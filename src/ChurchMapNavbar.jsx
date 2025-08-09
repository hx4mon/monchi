 import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSearch, FaCaretDown, FaCaretUp } from 'react-icons/fa';
import './ChurchMapNavbar.css';

//this code was made by: Raymund Cruz Espanto for MIS-SOLEDAD


function ChurchMapNavbar({ selectedChurch, onMapClick, onSearch, isMenuSidebarOpen, setIsMenuSidebarOpen, onTownSelect, onBarangaySelect, selectedTownForBarangayFilter, selectedTown, selectedBarangay, isLoggedIn, onLogout }) {
  const navigate = useNavigate();
  const buttonRef = useRef(null); // Ref for the button DOM element
  const menuSidebarRef = useRef(null); // Ref for the menu sidebar
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationsDropdown, setShowLocationsDropdown] = useState(false); // New state for locations dropdown
  const [towns, setTowns] = useState([]); // New state for storing towns
  const [showBarangaysDropdown, setShowBarangaysDropdown] = useState(false); // New state for barangays dropdown
  const [allChurches, setAllChurches] = useState([]); // Store all churches for filtering
  const [barangays, setBarangays] = useState([]); // New state for storing barangays

  const selectedTownLabel = selectedTown || 'Locations by Town';
  const selectedBarangayLabel = selectedBarangay || 'Locations by Barangay';

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/churches', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const filteredData = data.filter(church => church.church_name && church.church_name.trim() !== '' && church.church_name !== 'others' && church.church_name !== 'test' && church.church_name !== 'test2');
        setAllChurches(filteredData); // Store all churches

        // Extract unique church_town values
        const uniqueTowns = [...new Set(filteredData.map(church => church.church_town))];
        setTowns(uniqueTowns.sort());

      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    
    if (isLoggedIn) { // Only fetch if logged in
      fetchLocations();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (selectedTownForBarangayFilter) {
      const filteredBarangays = allChurches
        .filter(church => church.church_town === selectedTownForBarangayFilter && church.church_name && church.church_name.trim() !== '' && church.church_name !== 'others')
        .map(church => church.church_barangay);
      setBarangays([...new Set(filteredBarangays)].sort());
    }
  }, [selectedTownForBarangayFilter, allChurches]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };
  const [buttonPosition, setButtonPosition] = useState(() => {
    const savedPos = localStorage.getItem('hamburgerButtonPosition');
    return savedPos ? JSON.parse(savedPos) : { x: 50, y: 10 };
  });
  const isDraggingRef = useRef(false); // Use ref for isDragging
  const hasDraggedRef = useRef(false); // Use ref for hasDragged

  // Refs to store initial positions during drag
  const initialMouseX = useRef(0);
  const initialMouseY = useRef(0);
  const initialButtonX = useRef(0);
  const initialButtonY = useRef(0);

  useEffect(() => {
    localStorage.setItem('hamburgerButtonPosition', JSON.stringify(buttonPosition));
  }, [buttonPosition]);

  const toggleSidebar = () => {
    setIsMenuSidebarOpen(!isMenuSidebarOpen);
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current) {
      return;
    }

    // Prevent default touch behavior (like scrolling) while dragging
    if (e.touches) {
      e.preventDefault();
    }

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = Math.abs(clientX - initialMouseX.current);
    const dy = Math.abs(clientY - initialMouseY.current);
    const threshold = 5;

    if (dx > threshold || dy > threshold) {
      hasDraggedRef.current = true;
    }

    // Calculate new position
    const newX = initialButtonX.current + (clientX - initialMouseX.current);
    const newY = initialButtonY.current + (clientY - initialMouseY.current);

    // Directly update DOM element style
    if (buttonRef.current) {
      buttonRef.current.style.left = `${newX}px`;
      buttonRef.current.style.top = `${newY}px`;
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false; // Update ref directly
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('touchmove', handleMouseMove);
    document.removeEventListener('touchend', handleMouseUp);

    // Update state with final position after drag ends
    if (buttonRef.current) {
      setButtonPosition({
        x: buttonRef.current.offsetLeft,
        y: buttonRef.current.offsetTop,
      });
    }
  }, [handleMouseMove]);

  useEffect(() => {
    const button = buttonRef.current;
    if (button) {
      const handleMouseDownEvent = (e) => {
        isDraggingRef.current = true; // Update ref directly
        hasDraggedRef.current = false;

        // Determine if it's a touch event or mouse event
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        // Store initial mouse/touch and button positions
        initialMouseX.current = clientX;
        initialMouseY.current = clientY;
        initialButtonX.current = button.offsetLeft;
        initialButtonY.current = button.offsetTop;

        // Add event listeners based on event type
        if (e.type === 'touchstart') {
          document.addEventListener('touchmove', handleMouseMove, { passive: false });
          document.addEventListener('touchend', handleMouseUp);
        } else {
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }
      };

      button.addEventListener('mousedown', handleMouseDownEvent);
      button.addEventListener('touchstart', handleMouseDownEvent, { passive: false });

      return () => {
        button.removeEventListener('mousedown', handleMouseDownEvent);
        button.removeEventListener('touchstart', handleMouseDownEvent, { passive: false });
      };
    }
  }, [handleMouseMove, handleMouseUp]);

  

  return (
    <>
      <div
        ref={buttonRef} // Attach ref to the button
        className="hamburger-button"
        style={{ top: buttonPosition.y, left: buttonPosition.x }}
        onClick={(e) => {
          if (hasDraggedRef.current) {
            hasDraggedRef.current = false; // Reset the flag
            return; // Prevent click if it was a drag
          }
          toggleSidebar(e);
        }}
      >
        {isMenuSidebarOpen ? <FaTimes /> : <FaBars />}
      </div>

      <div ref={menuSidebarRef} className={`sidebar ${isMenuSidebarOpen ? 'open' : ''}`}>
        <div className="search-box">
          <input type="text" placeholder="Search churches..." value={searchQuery} onChange={handleSearchInputChange} onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(e); }} />
          <button type="submit" onClick={handleSearchSubmit}><FaSearch /></button>
        </div>

        <div className="menu-section">
          <div className="menu-item" onClick={() => navigate('/')}>
            Home
          </div>
        </div>

        <div className="menu-section">
          <div className="menu-item" onClick={() => {
            setShowLocationsDropdown(!showLocationsDropdown);
          }}>
            {selectedTownLabel} {showLocationsDropdown ? <FaCaretUp /> : <FaCaretDown />}
          </div>
          {showLocationsDropdown && (
            <ul className="dropdown-menu">
              {towns.map((townName, index) => (
                <li key={index} onClick={() => {
                  onTownSelect(townName);
                  setShowLocationsDropdown(false); // Close dropdown after selection
                }}>{townName}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="menu-section">
          <div className="menu-item" onClick={() => {
            setShowBarangaysDropdown(!showBarangaysDropdown);
          }}>
            {selectedBarangayLabel} {showBarangaysDropdown ? <FaCaretUp /> : <FaCaretDown />}
          </div>
          {showBarangaysDropdown && (
            <ul className="dropdown-menu">
              {barangays.map((barangayName, index) => (
                <li key={index} onClick={() => {
                  onBarangaySelect(barangayName);
                  setShowBarangaysDropdown(false); // Close dropdown after selection
                }}>{barangayName}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="menu-section">
          {isLoggedIn ? (
            <div className="menu-item" onClick={onLogout}>
              Logout
            </div>
          ) : (
            <div className="menu-item" onClick={() => navigate('/login')}>
              Login
            </div>
          )}
        </div>
      </div>

      {selectedChurch && (
        <div
          className={`sidebar info-sidebar ${selectedChurch ? 'open' : ''}`}
          style={{ left: isMenuSidebarOpen && selectedChurch ? `${menuSidebarRef.current ? menuSidebarRef.current.offsetWidth : 0}px` : '' }}
        >
          <button onClick={onMapClick} className="close-button">
            <FaTimes />
          </button>
          <div className="card">
            <div className="church-name-wrapper">
              <h2>{selectedChurch.church_name}</h2>
            </div>
            {selectedChurch.image_path && (
              <div className="church-image-container">
                <img src={`/uploads/${selectedChurch.image_path.split('/').pop()}`} alt="Church" className="church-image" />
              </div>
            )}
          </div>
          <div className="card">
            <p><strong>Address:</strong> {selectedChurch.church_street_purok}, {selectedChurch.church_barangay}, {selectedChurch.church_town}</p>
          </div>
          {selectedChurch.church_contact_number && (
            <div className="card">
              <p><strong>Contact Number:</strong> {selectedChurch.church_contact_number}</p>
            </div>
          )}
          {selectedChurch.denomination && (
            <div className="card">
              <p><strong>Denomination:</strong> {selectedChurch.denomination}</p>
            </div>
          )}
          {selectedChurch.no_of_years_in_existence && (
            <div className="card">
              <p><strong>Years in Existence:</strong> {selectedChurch.no_of_years_in_existence}</p>
            </div>
          )}
          {selectedChurch.sec_registration_number && (
            <div className="card">
              <p><strong>SEC Registration:</strong> {selectedChurch.sec_registration_number}</p>
            </div>
          )}
          {selectedChurch.tenure_status_of_the_church_building_lot && (
            <div className="card">
              <p><strong>Tenure Status:</strong> {selectedChurch.tenure_status_of_the_church_building_lot}</p>
            </div>
          )}
          {selectedChurch.total_number_of_assistant_pastor !== undefined && (
            <div className="card">
              <p><strong>Assistant Pastors:</strong> {selectedChurch.total_number_of_assistant_pastor}</p>
            </div>
          )}
          {selectedChurch.total_number_of_church_members !== undefined && (
            <div className="card">
              <p><strong>Church Members:</strong> {selectedChurch.total_number_of_church_members}</p>
            </div>
          )}
          {selectedChurch.total_number_of_leaders !== undefined && (
            <div className="card">
              <p><strong>Leaders:</strong> {selectedChurch.total_number_of_leaders}</p>
            </div>
          )}
          {selectedChurch.total_number_of_regular_attendees !== undefined && (
            <div className="card">
              <p><strong>Regular Attendees:</strong> {selectedChurch.total_number_of_regular_attendees}</p>
            </div>
          )}
          {selectedChurch.facebook_messenger_account_name_of_church && (
            <div className="card">
              <p><strong>Facebook Messenger:</strong> {selectedChurch.facebook_messenger_account_name_of_church}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default ChurchMapNavbar;
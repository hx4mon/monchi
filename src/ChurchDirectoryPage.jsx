import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './ChurchDirectoryPage.css'; // Import the new CSS file

const ChurchDirectoryPage = () => {
  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(''); // New state for debounced search term
  const [filteredChurches, setFilteredChurches] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [churchesPerPage] = useState(12); // Number of churches per page
  const [selectedChurch, setSelectedChurch] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setSelectedChurch(null);
      }
    };

    if (selectedChurch) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [selectedChurch]);

  useEffect(() => {
    const fetchChurches = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please log in.');
          setLoading(false);
          return;
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        };

        const response = await fetch('/api/churches', { headers });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setChurches(data);
        setFilteredChurches(data); // Initialize filtered churches with all churches
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChurches();
  }, []);

  // Debounce useEffect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 700); // 700ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]); // Only re-run if searchTerm changes

  useEffect(() => {
    const results = churches.filter(church =>
      church.church_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      church.denomination.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      church.church_street_purok.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      church.church_barangay.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      church.church_town.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
    setFilteredChurches(results);
    setCurrentPage(1); // Reset to first page on new search
  }, [debouncedSearchTerm, churches]); // Now depends on debouncedSearchTerm

  // Get current churches for pagination
  const indexOfLastChurch = currentPage * churchesPerPage;
  const indexOfFirstChurch = indexOfLastChurch - churchesPerPage;
  const currentChurches = filteredChurches.slice(indexOfFirstChurch, indexOfLastChurch);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredChurches.length / churchesPerPage);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPageButtons = 5; // Number of page buttons to display at once (excluding prev/next)

    if (totalPages <= maxPageButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(2, currentPage - Math.floor(maxPageButtons / 2) + 1);
      const endPage = Math.min(totalPages - 1, currentPage + Math.floor(maxPageButtons / 2) - 1);

      pageNumbers.push(1); // Always show the first page

      if (startPage > 2) {
        pageNumbers.push('...'); // First ellipsis
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push('...'); // Second ellipsis
      }

      pageNumbers.push(totalPages); // Always show the last page
    }

    return pageNumbers.map((number, index) => (
      <button
        key={number === '...' ? `ellipsis-${index}` : number} // Unique key for ellipsis
        onClick={() => number !== '...' && paginate(number)}
        className={currentPage === number ? 'active' : ''}
        disabled={number === '...'}
      >
        {number}
      </button>
    ));
  };

  if (loading) {
    return <div className="church-directory-container">Loading churches...</div>;
  }

  if (error) {
    return <div className="church-directory-container">Error: {error}</div>;
  }

  return (
    <div className="church-directory-container">
      <h2>Church Directory</h2>
      <div className="controls">
        <input
          type="text"
          placeholder="Search churches..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {filteredChurches.length === 0 ? (
        <p>No churches found matching your search.</p>
      ) : (
        <>
          <div className="church-cards-container">
            {currentChurches.map((church) => (
              <div 
                key={church.id} 
                className="church-card"
                onClick={() => setSelectedChurch(church)}
              >
                <h3>{church.church_name}</h3>
                <p><strong>Denomination:</strong> {church.denomination}</p>
                <p><strong>Location:</strong> {`${church.church_street_purok}, ${church.church_barangay}, ${church.church_town}`}</p>
                <p><strong>Contact:</strong> {church.church_contact_number}</p>
                {/* Add more church details as needed */}
              </div>
            ))}
          </div>
          {selectedChurch && (
            <div className="church-details-popup">
              <button className="close-button" onClick={() => setSelectedChurch(null)}>X</button>
              <h3>{selectedChurch.church_name}</h3>
              <p><strong>Denomination:</strong> {selectedChurch.denomination}</p>
              <div 
                className="popup-location-link"
                onClick={() => {
                  setSelectedChurch(null); // Close popup
                  navigate('/map', { state: { churchLocation: { lat: selectedChurch.latitude, lng: selectedChurch.longitude }, selectedMarkerId: selectedChurch.id } });
                }}
              >
                <p><strong>Location:</strong> {`${selectedChurch.church_street_purok}, ${selectedChurch.church_barangay}, ${selectedChurch.church_town}`}</p>
                <p className="click-to-view">Click to view on map</p>
              </div>
              <p><strong>Contact:</strong> {selectedChurch.church_contact_number}</p>
              <p><strong>Pastor:</strong> {selectedChurch.pastor_name}</p>
              <p><strong>Contact Number:</strong> {selectedChurch.pastor_contact_number}</p>
              <p><strong>Email:</strong> {selectedChurch.pastor_email}</p>
              <p><strong>Status:</strong> {selectedChurch.status}</p>
            </div>
          )}
          <div className="pagination">
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
            {renderPageNumbers()}
            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChurchDirectoryPage;
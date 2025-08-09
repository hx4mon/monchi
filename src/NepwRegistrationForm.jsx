import React, { useState, useEffect, useRef } from 'react';
import './NepwRegistrationForm.css';
import nameExtensions from './nameExtensions.json';
import designations from './designations.json';

const NepwRegistrationForm = ({ onFormSubmit, isLoggedIn }) => {
  const [allTownsData, setAllTownsData] = useState([]);
  const [allBarangaysData, setAllBarangaysData] = useState([]);
  const [allChurchesData, setAllChurchesData] = useState([]); // New state for all churches
  const [filteredChurches, setFilteredChurches] = useState([]); // New state for filtered churches
  const [filteredBarangays, setFilteredBarangays] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '', // New field for middle name
    last_name: '',
    name_extension: '',
    church_barangay: '',
    church_town: '',
    facebook_messenger_account_name_of_church: '',
    church_contact_number: '',
    no_of_years_in_existence: '',
    total_number_of_church_members: '',
    selected_church_name: '',
    designation: '', // New field for designation
    other_church_name: '', // New field for other church name
    total_number_of_assistant_pastor: '',
    total_number_of_leaders: '',
    total_number_of_regular_attendees: '',
    tenure_status_of_the_church_building_lot: '',
    church_status: '',
    latitude: '',
    longitude: '',
    image: null,
  });

  const [showOtherChurchInput, setShowOtherChurchInput] = useState(false);

  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prevState => ({ ...prevState, image: file }));
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      console.log('Image Preview URL:', imageUrl);
    }
  };

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const handleChooseImageClick = async () => {
    if (isMobileDevice()) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log('Camera detected and stream obtained:', stream);
        if (fileInputRef.current) {
          fileInputRef.current.setAttribute('capture', 'camera');
        }
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('No camera detected or permission denied on mobile, falling back to file input:', error);
        if (fileInputRef.current) {
          fileInputRef.current.removeAttribute('capture');
          fileInputRef.current.click();
        }
      }
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.removeAttribute('capture');
        fileInputRef.current.click();
      }
    }
  };

  

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const townsResponse = await fetch('/api/locations/towns');
        const townsData = await townsResponse.json();
        setAllTownsData(townsData);

        const barangaysResponse = await fetch('/api/locations/barangays');
        const barangaysData = await barangaysResponse.json();
        setAllBarangaysData(barangaysData);

        const token = localStorage.getItem('token');
        const churchesResponse = await fetch('/api/churches', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!churchesResponse.ok) {
          throw new Error(`HTTP error! status: ${churchesResponse.status}`);
        }
        const churchesData = await churchesResponse.json();
        setAllChurchesData(churchesData);
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    };
    
    if (isLoggedIn) { // Only fetch if logged in
      fetchLocationData();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    let currentFilteredBarangays = [];
    let currentFilteredChurches = [];

    if (formData.church_town && allTownsData.length > 0 && allBarangaysData.length > 0) {
      const selectedTownObj = allTownsData.find(town => town.town === formData.church_town);
      if (selectedTownObj) {
        currentFilteredBarangays = allBarangaysData.filter(brgy => brgy.id_town === selectedTownObj.id_town);
        setFilteredBarangays(currentFilteredBarangays);

        // Filter churches based on selected town and optionally barangay
        currentFilteredChurches = allChurchesData.filter(church => 
          church.church_town === formData.church_town && 
          (formData.church_barangay ? church.church_barangay === formData.church_barangay : true)
        );
        setFilteredChurches(currentFilteredChurches);
      } else {
        setFilteredBarangays([]);
        setFilteredChurches([]);
      }
    } else {
      setFilteredBarangays([]);
      setFilteredChurches([]);
    }
  }, [formData.church_town, formData.church_barangay, allTownsData, allBarangaysData, allChurchesData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
      ...(name === 'church_town' && { church_barangay: '' }),
      ...(name === 'selected_church_name' && value !== 'Others' && { other_church_name: '' })
    }));

    if (name === 'selected_church_name') {
      setShowOtherChurchInput(value === 'Others');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('status', 'pending'); // Add status field
    // Iterate over formData to append all fields, including middle_name
    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    }
    console.log('FormData before sending:', formData); // Log formData

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/nepw-registrations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('NEPW registered successfully:', result);
      alert('NEPW registered successfully!');
      // Reset form fields after successful submission
      setFormData({
        first_name: '',
        middle_name: '',
        last_name: '',
        name_extension: '',
        church_barangay: '',
        church_town: '',
        facebook_messenger_account_name_of_church: '',
        church_contact_number: '',
        selected_church_name: '',
        designation: '',
        other_church_name: '',
        image: null,
      });
      setImagePreview(null);
      setShowOtherChurchInput(false);
    } catch (error) {
      console.error('Error registering NEPW:', error);
      alert('Failed to register NEPW.');
    }
  };

  return (
      <div className="nepw-form-wrapper">
        <div className="nepw-registration-form-container">
        <h2>NEPW Registration</h2>
        <form onSubmit={handleSubmit}>
          <div className="name-fields-group">
            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="First Name" required />
            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Last Name" />
          </div>
          <div className="name-details-group">
            <input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} placeholder="Middle Name" />
            <select name="name_extension" value={formData.name_extension} onChange={handleChange}>
              <option value="">Select Name Extension</option>
              {nameExtensions.map((extension, index) => (
                <option key={index} value={extension}>{extension}</option>
              ))}
            </select>
          </div>
          <div className="contact-details-group">
            <input type="date" name="facebook_messenger_account_name_of_church" value={formData.facebook_messenger_account_name_of_church} onChange={handleChange} placeholder="Birthday" />
            <input type="text" name="church_contact_number" value={formData.church_contact_number} onChange={handleChange} placeholder="Contact Number" />
          </div>
          <div className="location-details-group">
            <select name="church_town" value={formData.church_town} onChange={handleChange} required>
              <option value="">Select Town</option>
              {allTownsData.map((townObj) => (
                <option key={townObj.id_town} value={townObj.town}>{townObj.town}</option>
              ))}
            </select>
            <select name="church_barangay" value={formData.church_barangay} onChange={handleChange} required>
              <option value="">Select Barangay</option>
              {filteredBarangays.map((barangayObj) => (
                <option key={barangayObj.id_brgy} value={barangayObj.barangay}>{barangayObj.barangay}</option>
              ))}
            </select>
          </div>
          <div className="church-details-group">
            <select name="selected_church_name" value={formData.selected_church_name} onChange={handleChange} required>
              <option value="">Select Church</option>
              {filteredChurches.map((church) => (
                <option key={church.id} value={church.church_name}>{church.church_name}</option>
              ))}
              <option value="Others">Others</option>
            </select>
          </div>
          {showOtherChurchInput && (
            <input type="text" name="other_church_name" value={formData.other_church_name} onChange={handleChange} placeholder="Enter Church Name" required />
          )}
          <select name="designation" value={formData.designation} onChange={handleChange} required>
            <option value="">Select Designation</option>
            {designations.map((designation, index) => (
              <option key={index} value={designation}>{designation}</option>
            ))}
          </select>
          
          
          
          
          
          
          <div className="image-upload-container">
            <div className="image-preview">
              {imagePreview ? (
                <img src={imagePreview} alt="NEPW Preview" />
              ) : (
                <div className="placeholder">Select an Image</div>
              )}
            </div>
            <input type="file" id="imageUpload" accept="image/jpeg, image/jpg" onChange={handleImageChange} style={{ display: 'none' }} ref={fileInputRef} />
            <label htmlFor="imageUpload" className="custom-file-upload">Choose Image</label>
          </div>
          <div className="submit-button-wrapper">
            <button type="submit">Register NEPW</button>
          </div>
        </form>
      </div>
      </div>
  );
};

export default NepwRegistrationForm;

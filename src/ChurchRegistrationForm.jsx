import React, { useState, useEffect, useRef } from 'react';
import './RegistrationForm.css'; // Assuming shared CSS
import tenureStatusData from './tenureStatus.json';
import churchStatusData from './churchStatus.json';

const ChurchRegistrationForm = ({ onFormSubmit }) => {
  const [allTownsData, setAllTownsData] = useState([]);
  const [allBarangaysData, setAllBarangaysData] = useState([]);
  const [filteredBarangays, setFilteredBarangays] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [tenureStatusOptions, setTenureStatusOptions] = useState([]);
  const [churchStatusOptions, setChurchStatusOptions] = useState([]);

  const [formData, setFormData] = useState({
    church_name: '',
    denomination: '',
    sec_registration_number: '',
    church_street_purok: '',
    church_barangay: '',
    church_town: '',
    facebook_messenger_account_name_of_church: '',
    church_contact_number: '',
    no_of_years_in_existence: '',
    total_number_of_church_members: '',
    total_number_of_assistant_pastor: '',
    total_number_of_leaders: '',
    total_number_of_regular_attendees: '',
    tenure_status_of_the_church_building_lot: '',
    church_status: '',
    latitude: '',
    longitude: '',
    image: null,
  });

  const [locationStatus, setLocationStatus] = useState('Get Current Location');
  const [isLocationSet, setIsLocationSet] = useState(false);

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

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setLocationStatus('Locating...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prevData => ({
            ...prevData,
            latitude: parseFloat(position.coords.latitude.toFixed(7)),
            longitude: parseFloat(position.coords.longitude.toFixed(7)),
          }));
          setLocationStatus('Location Found!');
          setIsLocationSet(true);
        },
        (error) => {
          console.error("Error getting location:", error);
          let errorMessage = 'Error getting location.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
            default:
              break;
          }
          setLocationStatus(errorMessage);
          setIsLocationSet(false);
        }
      );
    } else {
      setLocationStatus('Geolocation not supported by this browser.');
      setIsLocationSet(false);
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
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    };
    fetchLocationData();
    setTenureStatusOptions(tenureStatusData);
    setChurchStatusOptions(churchStatusData);
  }, []);

  useEffect(() => {
    if (formData.church_town && allTownsData.length > 0 && allBarangaysData.length > 0) {
      const selectedTownObj = allTownsData.find(town => town.town === formData.church_town);
      if (selectedTownObj) {
        const barangaysForSelectedTown = allBarangaysData.filter(brgy => brgy.id_town === selectedTownObj.id_town);
        setFilteredBarangays(barangaysForSelectedTown);
      } else {
        setFilteredBarangays([]);
      }
    } else {
      setFilteredBarangays([]);
    }
  }, [formData.church_town, allTownsData, allBarangaysData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
      ...(name === 'church_town' && { church_barangay: '' })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    for (const key in formData) {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    }

    try {
      const response = await fetch('/api/churches', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Church registered successfully:', result);
      alert('Church registered successfully!');
      // Reset form fields after successful submission
      setFormData({
        church_name: '',
        denomination: '',
        sec_registration_number: '',
        church_street_purok: '',
        church_barangay: '',
        church_town: '',
        facebook_messenger_account_name_of_church: '',
        church_contact_number: '',
        no_of_years_in_existence: '',
        total_number_of_church_members: '',
        total_number_of_assistant_pastor: '',
        total_number_of_leaders: '',
        total_number_of_regular_attendees: '',
        tenure_status_of_the_church_building_lot: '',
        church_status: '',
        latitude: '',
        longitude: '',
        image: null,
      });
      setImagePreview(null);
      setLocationStatus('Get Current Location');
      setIsLocationSet(false);
    } catch (error) {
      console.error('Error registering church:', error);
      alert('Failed to register church.');
    }
  };

  return (
    <div className="nepw-form-wrapper">
      <div className="nepw-registration-form-container">
        <h2>Church Registration</h2>
        <form onSubmit={handleSubmit}>
          <div className="name-fields-group">
            <input type="text" name="church_name" value={formData.church_name} onChange={handleChange} placeholder="Church Name" required />
            <input type="text" name="denomination" value={formData.denomination} onChange={handleChange} placeholder="Denomination" />
          </div>
          <div className="registration-address-group">
            <input type="text" name="sec_registration_number" value={formData.sec_registration_number} onChange={handleChange} placeholder="SEC Registration Number" />
            <input type="text" name="church_street_purok" value={formData.church_street_purok} onChange={handleChange} placeholder="Street / Purok" />
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
          <div className="contact-details-group">
            <input type="text" name="facebook_messenger_account_name_of_church" value={formData.facebook_messenger_account_name_of_church} onChange={handleChange} placeholder="Facebook / Messenger" />
            <input type="text" name="church_contact_number" value={formData.church_contact_number} onChange={handleChange} placeholder="Contact Number" />
          </div>
          <div className="church-stats-group-1">
            <input type="number" name="no_of_years_in_existence" value={formData.no_of_years_in_existence} onChange={handleChange} placeholder="Years of Existence" />
            <input type="number" name="total_number_of_regular_attendees" value={formData.total_number_of_regular_attendees} onChange={handleChange} placeholder="Total Number of Regular Attendees" />
          </div>
          <div className="church-stats-group-2">
            <input type="number" name="total_number_of_church_members" value={formData.total_number_of_church_members} onChange={handleChange} placeholder="Total of Church Members" />
            <input type="number" name="total_number_of_assistant_pastor" value={formData.total_number_of_assistant_pastor} onChange={handleChange} placeholder="Total Number of Assistant Pastors" />
          </div>
          {/* Church Status Fields */}
<div className="church-status-group">
    <select
        name="tenure_status_of_the_church_building_lot"
        value={formData.tenure_status_of_the_church_building_lot}
        onChange={handleChange}
        required
    >
        <option value="">Select Tenure Status</option>
        {tenureStatusOptions.map((status) => (
            <option key={status} value={status}>{status}</option>
        ))}
    </select>
    <select
        name="church_status"
        value={formData.church_status}
        onChange={handleChange}
        required
    >
        <option value="">Select Church Status</option>
        {churchStatusOptions.map((status) => (
            <option key={status} value={status}>{status}</option>
        ))}
    </select>
</div>
        {/* Location Button + Coordinates */}
<div className="lat-lng-inputs-group">
  <input
    type="text"
    name="latitude"
    value={formData.latitude}
    readOnly
    placeholder="Latitude"
  />
  <input
    type="text"
    name="longitude"
    value={formData.longitude}
    readOnly
    placeholder="Longitude"
  />
</div>
<div className="location-button-status-group">
  <button type="button" onClick={handleGetLocation}>{locationStatus}</button>
</div>
{/* Image Upload + Preview */}
<div className="image-upload-container">
  <div className="image-preview">
    {imagePreview ? (
      <img src={imagePreview} alt="Preview" />
    ) : (
      <div className="placeholder">No image selected</div>
    )}
  </div>
  
  <label className="custom-file-upload" onClick={handleChooseImageClick}>
    Choose Image
  </label>
  <input
    type="file"
    ref={fileInputRef}
    style={{ display: 'none' }}
    accept="image/*"
    onChange={handleImageChange}
  />
</div>

{/* Submit Button */}
<div className="submit-button-wrapper">
  <button type="submit">Register Church</button>
</div>
        </form>
      </div>
    </div>
  );
};

export default ChurchRegistrationForm;

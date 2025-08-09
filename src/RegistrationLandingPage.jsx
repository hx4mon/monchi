import React from 'react';
import { Link } from 'react-router-dom';
import './RegistrationLandingPage.css'; // We'll create this CSS file next

const RegistrationLandingPage = () => {
  return (
    <div className="registration-landing-container">
      <h2>Choose a Registration Type</h2>
      <div className="registration-options">
        <Link to="/registration/church" className="registration-option-card">
          <h3 style={{ color: '#555', fontWeight: '600' }}>Church Registration</h3>
          <p>Register a new church location.</p>
        </Link>
        <Link to="/registration/nepw" className="registration-option-card">
          <h3 style={{ color: '#555', fontWeight: '600' }}>Members Registration</h3>
          <p>Register as a New Evangelized Person of the Word.</p>
        </Link>
      </div>
    </div>
  );
};

export default RegistrationLandingPage;

import React from 'react';
import { Link } from 'react-router-dom';
import './DirectoryLandingPage.css'; // We'll create this CSS file next

const DirectoryLandingPage = () => {
  return (
    <div className="directory-landing-container">
      <h2>Choose a Directory to View</h2>
      <div className="directory-options">
        <Link to="/directory/churches" className="directory-option-card">
          <h3 style={{ color: '#555', fontWeight: '600' }}>Church Directory</h3>
          <p>View the directory of all registered churches.</p>
        </Link>
        <Link to="/directory/nepw" className="directory-option-card">
          <h3 style={{ color: '#555', fontWeight: '600' }}>Members Directory</h3>
          <p>View the directory of all registered Members.</p>
        </Link>
      </div>
    </div>
  );
};

export default DirectoryLandingPage;

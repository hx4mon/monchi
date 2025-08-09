import React from 'react';

const NotFoundPage = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      backgroundColor: '#f0f2f5', // Light gray background
      color: '#333', // Darker text for contrast
      fontFamily: 'Arial, sans-serif', // Modern sans-serif font
      padding: '20px',
      boxSizing: 'border-box',
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '40px 30px',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        width: '100%',
      }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#dc3545"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginBottom: '20px' }}
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <h1 style={{ fontSize: '4.5em', margin: '0 0 10px 0', color: '#dc3545' }}>404</h1>
        <h2 style={{ fontSize: '1.8em', margin: '0 0 15px 0', color: '#555' }}>Page Not Found</h2>
        <p style={{ fontSize: '1.1em', lineHeight: '1.6', marginBottom: '30px' }}>
          Oops! The page you're looking for seems to have gone on an adventure.
          It might have been moved, deleted, or never existed.
        </p>
        <a href="/" style={{
          display: 'inline-block',
          padding: '12px 25px',
          backgroundColor: '#007bff', // Primary blue button
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
          fontSize: '1.1em',
          fontWeight: 'bold',
          transition: 'background-color 0.3s ease',
        }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
           onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}>
          Go to Homepage
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;
import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import ChurchMapNavbar from './ChurchMapNavbar';

const Layout = ({ children, isLoggedIn, onLogout, loading, ...props }) => {
  const location = useLocation();
  const isMapPage = location.pathname === '/map';

  if (loading) {
    return <div className="loading-container">Loading application layout...</div>; // Or a spinner
  }

  return (
    <>
      {isMapPage ? (
        <ChurchMapNavbar {...props} isLoggedIn={isLoggedIn} onLogout={onLogout} />
      ) : (
        <Navbar isLoggedIn={isLoggedIn} onLogout={onLogout} userRole={props.userRole} />
      )}
      {children}
    </>
  );
};

export default Layout;

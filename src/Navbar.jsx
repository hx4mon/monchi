import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isLoggedIn, onLogout, userRole }) => {
  const [click, setClick] = useState(false);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
        </Link>
        <div className="menu-icon" onClick={handleClick}>
          <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
        </div>
        <ul className={click ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/" className="nav-links" onClick={closeMobileMenu}>
              Home
            </Link>
          </li>
          {isLoggedIn ? (
            <>
              <li className="nav-item">
                <Link to="/registration" className="nav-links" onClick={closeMobileMenu}>
                  Registration
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/map" className="nav-links" onClick={closeMobileMenu}>
                  Map
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/directory" className="nav-links" onClick={closeMobileMenu}>
                  Directory
                </Link>
              </li>
              {(userRole === 'admin') && (
                <li className="nav-item">
                  <Link to="/admin-approval" className="nav-links" onClick={closeMobileMenu}>
                    Approval Page
                  </Link>
                </li>
              )}
              <li className="nav-item">
                <button onClick={() => { onLogout(); closeMobileMenu(); }} className="nav-links logout-button">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <Link to="/login" className="nav-links" onClick={closeMobileMenu}>
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

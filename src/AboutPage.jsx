import React from 'react';
import './AboutPage.css';
import infosenseLogo from './img/infosense.png'; // Infosense logo

const AboutPage = () => {
  return (
    <div className="about-page-container">
      <div className="about-page-content">
        <img src={infosenseLogo} alt="MIS-SOLEDAD Logo" className="about-page-logo" />
        <h2>About MIS-SOLEDAD</h2>
        <p>
          Welcome to the About page for MIS-SOLEDAD. This project aims to provide comprehensive information and tools related to various churches and community initiatives.
        </p>
        <p>
          Our mission is to connect communities and facilitate information sharing in an accessible and user-friendly manner.
        </p>
        <p>
          More details about our vision, team, and future plans will be added here soon.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
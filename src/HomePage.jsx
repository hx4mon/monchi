import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <header className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Our Christian Community</h1>
          <p>Uniting hearts in faith, hope, and love.</p>
          <div className="hero-buttons">
            <Link to="/map" className="btn btn-primary">Find a Church</Link>
            <Link to="/registration" className="btn btn-secondary">Join Us</Link>
          </div>
        </div>
      </header>

      <section className="about-section">
        <h2>About Our Collaboration</h2>
        <p>We are a collaborative of Christian churches dedicated to spreading the Gospel and serving our communities. Our mission is to foster spiritual growth, encourage fellowship, and make a positive impact through shared faith and action.</p>
        <p>Together, we strive to embody the teachings of Christ, offering a welcoming home for all who seek spiritual nourishment and a deeper connection with God.</p>
      </section>

      <section className="events-section">
        <h2>Upcoming Events & Services</h2>
        <div className="events-grid">
          <div className="event-card">
            <h3>Sunday Worship Service</h3>
            <p>Join us every Sunday at 10:00 AM for a powerful worship experience.</p>
          </div>
          <div className="event-card">
            <h3>Mid-Week Bible Study</h3>
            <p>Deepen your understanding of the Word on Wednesdays at 7:00 PM.</p>
          </div>
          <div className="event-card">
            <h3>Community Outreach</h3>
            <p>Participate in our monthly outreach programs to serve those in need.</p>
          </div>
        </div>
      </section>

      <section className="contact-section">
        <h2>Contact Us</h2>
        <p>Have questions or need spiritual guidance? We'd love to hear from you.</p>
        <p>Email: info@christiancollaboration.org</p>
        <p>Phone: (123) 456-7890</p>
        <p>Address: 123 Faith Street, City, Country</p>
      </section>

      <footer className="footer">
        <p>&copy; 2025 Christian Church Collaboration. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
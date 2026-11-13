import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';


import "./About.css";

const Header = ({ onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="main-header">
      <div className="container">
        <h1 className="logo">
          <Link to="/">
            <span className="logo-drive">Drive</span>
            <span className="logo-easy">Easy</span>
          </Link>
        </h1>

        <nav className="main-nav">
          <ul>
            <li>
              <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>
                Home
              </NavLink>
            </li>

            <li>
              <NavLink to="/cars" className={({ isActive }) => isActive ? "active" : ""}>
                Cars
              </NavLink>
            </li>

            <li>
              <NavLink to="/contact" className={({ isActive }) => isActive ? "active" : ""}>
                Contact
              </NavLink>
            </li>

            <li>
              <NavLink to="/about" className={({ isActive }) => isActive ? "active" : ""}>
                About
              </NavLink>
            </li>

            <li>
              <button 
                className="logout-btn" 
                onClick={onLogout}
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>

        <button 
          className="mobile-menu-btn" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {mobileMenuOpen && (
        <nav className="mobile-nav">
          <ul>
            <li><NavLink to="/" end onClick={() => setMobileMenuOpen(false)}>Home</NavLink></li>
            <li><NavLink to="/cars" onClick={() => setMobileMenuOpen(false)}>Cars</NavLink></li>
            <li><NavLink to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</NavLink></li>
            <li><NavLink to="/about" onClick={() => setMobileMenuOpen(false)}>About</NavLink></li>
            <li>
              <button 
                className="mobile-logout-btn"
                onClick={() => { 
                  setMobileMenuOpen(false); 
                  onLogout();
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      )}

    </header>
  );
};




// ==========================================================
// FULL ABOUT PAGE (NOTHING REMOVED, ALL SECTIONS PRESERVED)
// ==========================================================

const About = ({ embedded = false, onLogout }) => {
  const ContentTag = embedded ? "div" : "main";

  const stats = [
    { number: "10,000+", label: "Happy Customers" },
    { number: "500+", label: "Vehicles Available" },
    { number: "50+", label: "Locations Nationwide" },
    { number: "24/7", label: "Customer Support" }
  ];

  const values = [
    {
      icon: "🎯",
      title: "Customer First",
      description: "Your satisfaction is our top priority. We go above and beyond to ensure every rental experience exceeds expectations."
    },
    {
      icon: "✨",
      title: "Quality Fleet",
      description: "All vehicles are regularly maintained and inspected to guarantee safety, comfort, and reliability on every journey."
    },
    {
      icon: "💎",
      title: "Transparent Pricing",
      description: "No hidden fees, no surprises. What you see is what you pay."
    },
    {
      icon: "🚀",
      title: "Innovation",
      description: "We leverage the latest technology to make booking, pickup, and return seamless."
    }
  ];

  const timeline = [
    { year: "2015", event: "DriveEasy Founded", description: "Started with 10 vehicles in Metro Manila" },
    { year: "2017", event: "Nationwide Expansion", description: "Opened branches across major PH cities" },
    { year: "2019", event: "500+ Vehicles", description: "Expanded fleet to meet demand" },
    { year: "2021", event: "Digital Transformation", description: "Launched mobile app & online booking" },
    { year: "2024", event: "Industry Leader", description: "Recognized as #1 car rental service" }
  ];

  return (
    <div className={`about-page${embedded ? " about-embedded" : ""}`} id={embedded ? "about" : undefined}>
      {!embedded && <Header onLogout={onLogout} />}
      
      <ContentTag>
        {/* Hero Section */}
        <section className="about-hero">
          <div className="about-hero-content">
            <h1>About DriveEasy</h1>
            <p>Redefining Car Rental Excellence Since 2015</p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="mission-section">
          <div className="container">
            <div className="mission-grid row g-4">
              <div className="col-md-6">
              <div className="mission-card">
                <h2>Our Mission</h2>
                <div className="divider"></div>
                <p>
                  To provide accessible, reliable, and affordable car rental services that empower people 
                  to explore, travel, and conduct business with confidence.
                </p>
              </div>

              </div>
              <div className="col-md-6">
              <div className="mission-card">
                <h2>Our Vision</h2>
                <div className="divider"></div>
                <p>
                  To become the most trusted and innovative car rental company in Southeast Asia.
                </p>
              </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              {stats.map((stat, idx) => (
                <div key={idx} className="stat-card">
                  <h3>{stat.number}</h3>
                  <p>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="values-section">
          <div className="container">
            <h2>Our Core Values</h2>
            <div className="divider-center"></div>
            <div className="values-grid">
              {values.map((value, idx) => (
                <div key={idx} className="value-card">
                  <div className="value-icon">{value.icon}</div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="timeline-section">
          <div className="container">
            <h2>Our Journey</h2>
            <div className="divider-center"></div>
            <div className="timeline">
              {timeline.map((item, idx) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-year">{item.year}</div>
                  <div className="timeline-content">
                    <h3>{item.event}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="about-cta-section">
          <div className="container">
            <h2>Ready to Experience DriveEasy?</h2>
            <p>Join thousands of satisfied customers who trust us every day.</p>
            <div className="cta-buttons">
              <a href={embedded ? "#cars" : "/cars"} className="cta-btn primary">Browse Cars</a>
              <a href={embedded ? "#contact" : "/contact"} className="cta-btn secondary">Contact Us</a>
            </div>
          </div>
        </section>
      </ContentTag>

      {/* Footer */}
      {!embedded && <footer className="footer">
        <div className="content">
          <h3 className="footer-logo">
            <span className="logo-drive">Drive</span>
            <span className="logo-easy">Easy</span>
          </h3>
          <p className="footer-tagline">Your journey starts here. Rent with confidence.</p>
          <p className="footer-copyright">© 2024 DriveEasy. All rights reserved.</p>
        </div>
      </footer>}
    </div>
  );
};

export default About;

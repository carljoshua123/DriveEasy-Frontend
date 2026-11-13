import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import "./Contact.css";

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
              <NavLink 
                to="/" 
                end 
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Home
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/cars" 
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Cars
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/contact" 
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Contact
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/about" 
                className={({ isActive }) => (isActive ? "active" : "")}
              >
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
                onClick={() => { setMobileMenuOpen(false); onLogout(); }}
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




// =========================
// CONTACT PAGE
// =========================

const Contact = ({ embedded = false, onLogout }) => {
  const ContentTag = embedded ? "div" : "main";

  const contactMethods = [
    {
      icon: "📧",
      title: "Email Us",
      detail: "Driveeasy@gmail.com",
      link: "mailto:Driveeasy@gmail.com",
      description: "Send us an email anytime"
    },
    {
      icon: "📱",
      title: "Call Us",
      detail: "01234567890",
      link: "tel:01234567890",
      description: "Mon-Fri from 8am to 6pm"
    },
    {
      icon: "📍",
      title: "Visit Us",
      detail: "National University – Manila",
      link: "https://www.google.com/maps/dir/?api=1&destination=National+University+Manila",
      description: "Come visit our office"
    },
    {
      icon: "💬",
      title: "Message Us",
      detail: "Chat with our team",
      link: "#",
      description: "Send a message and we'll reply here"
    }
  ];

  const socialMedia = [
    {
      name: "Facebook",
      icon: "📘",
      handle: "@DriveEasyPH",
      link: "https://facebook.com/driveeasy"
    },
    {
      name: "Instagram",
      icon: "📷",
      handle: "@DriveEasy",
      link: "https://instagram.com/driveeasy"
    },
    {
      name: "Twitter",
      icon: "🐦",
      handle: "@DriveEasyPH",
      link: "https://twitter.com/driveeasy"
    },
  ];

  return (
    <div className={`contact-page${embedded ? " contact-embedded" : ""}`} id={embedded ? "contact" : undefined}>
      {!embedded && <Header onLogout={onLogout} />}
      
      <ContentTag>
        {/* Hero Section */}
        <section className="contact-hero">
          <div className="contact-hero-content">
            <h1>Get In Touch</h1>
            <p>We'd love to hear from you. Our team is here to help!</p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="contact-methods-section">
          <div className="container">
            <div className="contact-methods-grid">
              {contactMethods.map((method, idx) => (
                <a 
                  key={idx} 
                  href={method.link} 
                  className="contact-method-card"
                  target={method.link.startsWith('http') ? '_blank' : '_self'}
                  rel="noreferrer"
                  onClick={method.title === "Message Us" ? (event) => {
                    event.preventDefault();
                    window.dispatchEvent(new Event("driveeasy:open-chat"));
                  } : undefined}
                >
                  <div className="method-icon">{method.icon}</div>
                  <h3>{method.title}</h3>
                  <p className="method-detail">{method.detail}</p>
                  <p className="method-description">{method.description}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Social Media Section */}
        <section className="social-section">
          <div className="container">
            <h2>Connect With Us</h2>
            <p className="social-subtitle">Follow us on social media for updates and promotions</p>
            
            <div className="social-grid">
              {socialMedia.map((social, idx) => (
                <a 
                  key={idx} 
                  href={social.link} 
                  className="social-card"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="social-icon">{social.icon}</div>
                  <h3>{social.name}</h3>
                  <p>{social.handle}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      </ContentTag>

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

export default Contact;

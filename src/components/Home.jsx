import { useEffect, useState } from "react";
import About from "./About";
import Cars from "./Cars";
import Contact from "./Contact";
import "./Home.css";
import BookingHistory from "./BookingHistory";

const introSlides = [
  { src: "/car.png", alt: "DriveEasy rental cars ready for the road" },
  { src: "/car1.png", alt: "A featured car from the DriveEasy fleet" },
  { src: "/car2.png", alt: "Another vehicle available to rent from DriveEasy" },
  { src: "/car3.png", alt: "Explore more cars in the DriveEasy fleet" },
];

const Home = ({ onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeIntroSlide, setActiveIntroSlide] = useState(0);

  const closeMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    const slideInterval = window.setInterval(() => {
      setActiveIntroSlide((current) => (current + 1) % introSlides.length);
    }, 3000);

    return () => window.clearInterval(slideInterval);
  }, []);

  return (
    <div className="home-page" id="home">
      <header className="main-header home-header">
        <div className="container">
          <a className="logo" href="#home" onClick={closeMenu} aria-label="DriveEasy home">
            <span className="logo-drive">Drive</span>
            <span className="logo-easy">Easy</span>
          </a>

          <nav className="main-nav" aria-label="Main navigation">
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#cars">Cars</a></li>
              <li><a href="#booking-history">My Bookings</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#about">About</a></li>
              <li>
                <button className="logout-btn" onClick={onLogout}>
                  Logout
                </button>
              </li>
            </ul>
          </nav>

          <button
            className="mobile-menu-btn"
            type="button"
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? "×" : "☰"}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <ul>
              <li><a href="#home" onClick={closeMenu}>Home</a></li>
              <li><a href="#cars" onClick={closeMenu}>Cars</a></li>
              <li><a href="#booking-history" onClick={closeMenu}>My Bookings</a></li>
              <li><a href="#contact" onClick={closeMenu}>Contact</a></li>
              <li><a href="#about" onClick={closeMenu}>About</a></li>
              <li>
                <button className="logout-btn" onClick={() => {
                  closeMenu();
                  onLogout();
                }}>
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        )}
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-content container">
            <p className="hero-eyebrow text-amber-400 tracking-[0.3em] uppercase font-semibold">
              The journey is yours
            </p>
            <h1 className="hero-title md:text-6xl" id="hero-title">
              Rent. Ride. Relax.
            </h1>
            <p className="hero-description">
              Discover a better way to travel with a car that fits your plans
              and your pace.
            </p>
            <a className="hero-cta inline-flex items-center gap-2 rounded-full transition" href="#cars">
              Explore our cars <span aria-hidden="true">→</span>
            </a>
          </div>
          <a className="hero-scroll" href="#welcome" aria-label="Scroll to learn more">
            <span />
          </a>
        </section>

        <section className="intro-section" id="welcome">
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-6 intro-content">
                <p className="section-kicker">Welcome to DriveEasy</p>
                <h2>Every great journey starts with the right ride.</h2>
                <p>
                  From everyday errands to unforgettable escapes, find a
                  well-maintained car and a rental experience designed around
                  you.
                </p>
                <p>
                  Explore the fleet, choose the ride that suits your trip, and
                  get on the road with confidence.
                </p>
                <a className="intro-btn inline-flex items-center gap-2 transition" href="#cars">
                  Find your car <span aria-hidden="true">→</span>
                </a>
              </div>
              <div className="col-lg-6 intro-image">
                <div className="intro-carousel" aria-label="Featured DriveEasy cars">
                  {introSlides.map((slide, index) => (
                    <img
                      key={slide.src}
                      src={slide.src}
                      alt={slide.alt}
                      className={index === activeIntroSlide ? "active" : ""}
                      aria-hidden={index !== activeIntroSlide}
                    />
                  ))}
                  <div className="intro-carousel-indicators" aria-label="Choose a featured car">
                    {introSlides.map((slide, index) => (
                      <button
                        key={slide.src}
                        type="button"
                        className={index === activeIntroSlide ? "active" : ""}
                        aria-label={`Show featured car ${index + 1}`}
                        aria-pressed={index === activeIntroSlide}
                        onClick={() => setActiveIntroSlide(index)}
                      />
                    ))}
                  </div>
                </div>
                <div className="intro-image-caption">
                  <span className="caption-mark">D</span>
                  <span>Make the miles memorable.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Cars embedded onLogout={onLogout} />
        <BookingHistory />
        <Contact embedded onLogout={onLogout} />
        <About embedded onLogout={onLogout} />
      </main>

      <footer className="site-footer">
        <a className="footer-brand" href="#home">
          <span className="logo-drive">Drive</span><span className="logo-easy">Easy</span>
        </a>
        <p>Your journey starts here. Rent with confidence.</p>
        <span>© {new Date().getFullYear()} DriveEasy. All rights reserved.</span>
      </footer>

    </div>
  );
};

export default Home;

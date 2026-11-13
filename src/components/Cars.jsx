import React, { useState, useEffect } from "react";
import { Users, Fuel, Settings, X, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { getCarImageUrl } from "../utils/carImage";
import "./Cars.css";

const getCarImages = (car) => {
  const imagePaths = [...(Array.isArray(car.images) ? car.images : []), car.image].filter(Boolean);
  return [...new Set(imagePaths)].map(getCarImageUrl);
};

function CarImageCarousel({ images, alt, className = "" }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const imageCount = images.length;
  const showControls = imageCount > 1;

  const changeImage = (event, direction) => {
    event.stopPropagation();
    setActiveIndex((index) => (index + direction + imageCount) % imageCount);
  };

  return (
    <div className={`car-image-carousel ${className}`}>
      <img
        src={images[activeIndex] || "https://via.placeholder.com/400x300?text=Car+Image"}
        className="car-image"
        alt={alt}
      />
      {showControls && (
        <>
          <button
            type="button"
            className="car-gallery-arrow car-gallery-previous"
            aria-label={`Previous photo of ${alt}`}
            onClick={(event) => changeImage(event, -1)}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className="car-gallery-arrow car-gallery-next"
            aria-label={`Next photo of ${alt}`}
            onClick={(event) => changeImage(event, 1)}
          >
            <ChevronRight size={20} />
          </button>
          <span className="car-gallery-count" aria-live="polite">
            {activeIndex + 1} / {imageCount}
          </span>
        </>
      )}
    </div>
  );
}

const Cars = ({ embedded = false, onLogout }) => {
  const navigate = useNavigate();

  const [selectedCar, setSelectedCar] = useState(null);
  const [fetchedCars, setFetchedCars] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/cars`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((car) => ({
          ...car,
          images: getCarImages(car),
          image: getCarImages(car)[0] || "https://via.placeholder.com/400x300?text=Car+Image",
          transmission: car.transmission || "Automatic",
          fuel: car.fuel || "Gasoline",
          pricePerDay: car.pricePerDay || parseInt(car.price?.replace(/[^\d]/g, "")) || 0,
          description: car.description || "A well-maintained rental car suitable for trips.",
        }));
        setFetchedCars(formatted);
      })
      .catch((err) => console.error(err));
  }, []);

  const displayCars = fetchedCars;

  const openModal = (car) => setSelectedCar(car);
  const closeModal = () => setSelectedCar(null);

  const handleRentalOption = (option) => {
    const pricePerDay = selectedCar.pricePerDay;

    navigate("/booking", {
      state: {
        car: selectedCar,
        rentalType: option,
        pricePerDay,
        carId: selectedCar._id,
      },
    });
  };

  const ContentTag = embedded ? "div" : "main";

  return (
    <section
      className={`car-listing-page${embedded ? " car-listing-embedded" : ""}`}
      id={embedded ? "cars" : undefined}
    >
      {/* HEADER */}
      {!embedded && <header className="main-header">
        <div className="container">
          <h1 className="logo">
            <Link to="/">
              <span className="logo-drive">Drive</span>
              <span className="logo-easy">Easy</span>
            </Link>
          </h1>

          <nav className={`main-nav${mobileMenuOpen ? " open" : ""}`}>
            <ul>
              <li><NavLink to="/" end>Home</NavLink></li>
              <li><NavLink to="/cars">Cars</NavLink></li>
              <li><NavLink to="/contact">Contact</NavLink></li>
              <li><NavLink to="/about">About</NavLink></li>
              <li>
                <button className="logout-btn" onClick={onLogout}>
                  <LogOut size={16} /> Logout
                </button>
              </li>
            </ul>
          </nav>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
        {mobileMenuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <ul>
              <li><Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link></li>
              <li><Link to="/cars" onClick={() => setMobileMenuOpen(false)}>Cars</Link></li>
              <li><Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link></li>
              <li><Link to="/about" onClick={() => setMobileMenuOpen(false)}>About</Link></li>
              <li><button className="logout-btn" onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}>Logout</button></li>
            </ul>
          </nav>
        )}
      </header>}

      {/* CAR GRID */}
      <ContentTag className="car-main">
        <div className="car-section-heading">
          <p className="car-section-kicker">The DriveEasy collection</p>
          <h2>Find your next ride.</h2>
          <p>Thoughtfully selected cars for wherever the road takes you.</p>
        </div>
        {displayCars.length === 0 && (
          <p className="cars-empty-state">Our fleet is being updated. Please check back soon.</p>
        )}
        <div className="car-grid">
          {displayCars.map((car) => (
            <div
              key={car._id}
              className="car-card"
              onClick={() => openModal(car)}
            >
              <CarImageCarousel images={car.images} alt={`${car.name} gallery`} />
              <h2 className="car-name">{car.name}</h2>

              <div className="car-specs">
                <div><Users size={16} /> {car.seats} Seats</div>
                <div><Settings size={16} /> {car.transmission}</div>
                <div><Fuel size={16} /> {car.fuel}</div>
              </div>

              <div className="car-price">₱{car.pricePerDay}/day</div>
              <button className="details-button">View Details</button>
            </div>
          ))}
        </div>
      </ContentTag>

      {/* MODAL */}
      {selectedCar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={closeModal} className="close-button"><X size={28} /></button>
            <CarImageCarousel
              images={selectedCar.images}
              alt={`${selectedCar.name} gallery`}
              className="modal-gallery"
            />
            <h2 className="modal-title">{selectedCar.name}</h2>
            <div className="modal-specs">
              <div><Users size={20} /> {selectedCar.seats} Seats</div>
              <div><Settings size={20} /> {selectedCar.transmission}</div>
              <div><Fuel size={20} /> {selectedCar.fuel}</div>
            </div>
            <p className="modal-description">{selectedCar.description}</p>
            <div className="modal-price">₱{selectedCar.pricePerDay}/day</div>

            <div className="modal-buttons">
              <button
                onClick={() => handleRentalOption("Self Drive")}
                className="rental-button self-drive-button"
              >
                Self Drive
              </button>
              <button
                onClick={() => handleRentalOption("With Driver")}
                className="rental-button with-driver-button"
              >
                With Driver
              </button>
            </div>

            <button onClick={closeModal} className="back-button">
              Back to Listings
            </button>
          </div>
        </div>
      )}

    </section>
  );
};

export default Cars;

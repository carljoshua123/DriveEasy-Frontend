import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { getCarImageUrl } from "../utils/carImage";
import "./Booking.css";

const Booking = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const car = state?.car;
  const rentalType = state?.rentalType;
  const pricePerDay = Number(car?.price?.replace(/[^\d]/g, "")) || 0;
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [dropoffDate, setDropoffDate] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [payment, setPayment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!car) {
    return (
      <div className="booking-container">
        <h2>No Car Selected</h2>
        <button onClick={() => navigate("/cars")} className="back-btn">
          Back to Cars
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
  e.preventDefault();

  const numericPrice = Number(car.price.replace(/[^\d]/g, ""));

  const bookingDetails = {
  carId: car._id,                                  // <-- renamed
  carName: car.name,
  startDate: pickupDate,
  endDate: dropoffDate,
  pricePerDay: numericPrice, // backend uses this to calculate totalPrice
  name,
  contact,
  pickupLocation,
  dropoffLocation,
  payment,
  rentalType,
};


  try {
    setLoading(true);

    const response = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingDetails),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Booking failed");
    }

    alert(`Booking successful! Total Price: ₱${data.booking.totalPrice}`);
    navigate("/");

  } catch (err) {
    console.error("BOOKING ERROR:", err);
    alert(err.message || "Error submitting booking");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="booking-page" style={{ backgroundImage: `url(${getCarImageUrl(car.image)})` }}>
      <div className="booking-card">
        <h1>Car Booking</h1>

        <div className="car-summary">
          <img src={getCarImageUrl(car.image)} alt={car.name} />
          <h2>{car.name}</h2>
          <p><strong>Rental Type:</strong> {rentalType}</p>
          <p><strong>Price:</strong> ₱{pricePerDay}</p>
        </div>

        <form className="booking-form" onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input 
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Contact Number</label>
          <input 
            type="text"
            placeholder="09XXXXXXXXX"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
          />

          <label>Pick-up Date</label>
          <input 
            type="date"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            required
          />

          <label>Drop-off Date</label>
          <input 
            type="date"
            value={dropoffDate}
            onChange={(e) => setDropoffDate(e.target.value)}
            required
          />

          <label>Pick-up Location</label>
          <input 
            type="text"
            placeholder="Enter pick-up location"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            required
          />

          <label>Drop-off Location</label>
          <input 
            type="text"
            placeholder="Enter drop-off location"
            value={dropoffLocation}
            onChange={(e) => setDropoffLocation(e.target.value)}
            required
          />

          <label>Payment Method</label>
          <select 
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            required
          >
            <option value="">Select payment method</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="GCash">GCash</option>
          </select>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit Booking"}
          </button>
        </form>

        <button className="back-btn" onClick={() => navigate("/cars")}>Back</button>
      </div>
    </div>
  );
};

export default Booking;

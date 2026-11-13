import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CarFront,
  Clock3,
  CircleCheck,
  CreditCard,
  Eye,
  ChevronLeft,
  ChevronRight,
  MapPin,
  UserRound,
  X,
} from "lucide-react";
import { API_BASE_URL } from "../config";
import { getCarImageUrl } from "../utils/carImage";
import "./BookingHistory.css";

const isCompletedBooking = (booking) =>
  Boolean(booking.returnedAt) ||
  ["returned", "completed"].includes(String(booking.status || "").toLowerCase());

const isPendingBooking = (booking) =>
  !isCompletedBooking(booking) &&
  ["", "pending"].includes(String(booking.status || "").toLowerCase());

const getStatus = (booking) => {
  if (isCompletedBooking(booking)) {
    return { label: "Completed", className: "completed" };
  }
  if (String(booking.status || "").toLowerCase() === "approved") {
    return { label: "Approved", className: "approved" };
  }
  return { label: booking.status || "Pending", className: "pending" };
};

function BookingCarGallery({ booking, className = "" }) {
  const images = [
    ...(Array.isArray(booking.carId?.images) ? booking.carId.images : []),
    booking.carId?.image,
  ].filter((image, index, allImages) =>
    typeof image === "string" && image && allImages.indexOf(image) === index
  );
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) {
    return (
      <div className={`${className} booking-history-gallery-fallback`}>
        <CarFront size={28} aria-hidden="true" />
      </div>
    );
  }

  const showPrevious = (event) => {
    event.stopPropagation();
    setActiveIndex((index) => (index - 1 + images.length) % images.length);
  };
  const showNext = (event) => {
    event.stopPropagation();
    setActiveIndex((index) => (index + 1) % images.length);
  };

  return (
    <div className={`${className} booking-history-gallery`}>
      <img
        src={getCarImageUrl(images[activeIndex])}
        alt={`${booking.carName} photo ${activeIndex + 1}`}
      />
      {images.length > 1 && (
        <>
          <button
            type="button"
            className="booking-history-gallery-arrow previous"
            onClick={showPrevious}
            aria-label="Show previous car photo"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="booking-history-gallery-arrow next"
            onClick={showNext}
            aria-label="Show next car photo"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
          <span className="booking-history-gallery-count" aria-live="polite">
            {activeIndex + 1} / {images.length}
          </span>
        </>
      )}
    </div>
  );
}

function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const completedCount = bookings.filter(isCompletedBooking).length;
  const pendingCount = bookings.filter(isPendingBooking).length;
  const visibleBookings = useMemo(
    () => bookings.filter((booking) => (
      filter === "all" ||
      (filter === "completed"
        ? isCompletedBooking(booking)
        : isPendingBooking(booking))
    )),
    [bookings, filter]
  );

  useEffect(() => {
    const controller = new AbortController();
    const loadHistory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/mine`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Could not load booking history.");
        }
        setBookings(data);
        setError("");
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Could not load booking history.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    loadHistory();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedBooking) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setSelectedBooking(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedBooking]);

  return (
    <section className="booking-history-section" id="booking-history" aria-labelledby="booking-history-title">
      <div className="booking-history-inner">
        <div className="booking-history-heading">
          <div>
            <p className="booking-history-kicker">Your DriveEasy account</p>
            <h2 id="booking-history-title">Booking History</h2>
            <p>Track every reservation, from pending approval to completed trips.</p>
          </div>
          <div className="booking-history-counts" aria-label="Booking totals">
            <span className="booking-history-total">{pendingCount} pending</span>
            <span className="booking-history-total completed-count">{completedCount} completed</span>
          </div>
        </div>

        {error && <p className="booking-history-error" role="alert">{error}</p>}
        {isLoading ? (
          <p className="booking-history-empty">Loading your bookings…</p>
        ) : bookings.length === 0 ? (
          <div className="booking-history-empty">
            <CarFront size={30} aria-hidden="true" />
            <strong>No bookings yet</strong>
            <span>Your reservations will appear here after you book a car.</span>
            <a href="#cars">Browse available cars</a>
          </div>
        ) : (
          <>
            <div className="booking-history-filters" role="group" aria-label="Filter bookings">
              {[
                { id: "all", label: `All (${bookings.length})` },
                { id: "pending", label: `Pending (${pendingCount})` },
                { id: "completed", label: `Completed (${completedCount})` },
              ].map((option) => (
                <button
                  type="button"
                  key={option.id}
                  className={filter === option.id ? "active" : ""}
                  aria-pressed={filter === option.id}
                  onClick={() => setFilter(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {visibleBookings.length === 0 ? (
              <div className="booking-history-empty booking-history-filter-empty">
                <strong>No {filter} bookings</strong>
                <span>
                  {filter === "completed"
                    ? "Completed trips will appear here after the car is returned."
                        : `There are no ${filter} bookings in this category.`}
                </span>
              </div>
            ) : (
              <div className="booking-history-list">
                {visibleBookings.map((booking) => {
                  const status = getStatus(booking);
                  return (
                    <article className="booking-history-card" key={booking._id}>
                      <BookingCarGallery
                        booking={booking}
                        className="booking-history-car-image"
                      />
                      <div className="booking-history-details">
                        <div className="booking-history-title-row">
                          <h3>{booking.carName}</h3>
                          <span className={`booking-history-status ${status.className}`}>
                            {status.className === "completed" ? <CircleCheck size={14} /> : <Clock3 size={14} />}
                            {status.label}
                          </span>
                        </div>
                        <div className="booking-history-meta">
                          <span><CalendarDays size={15} /> {new Date(booking.startDate).toLocaleDateString()} – {new Date(booking.endDate).toLocaleDateString()}</span>
                          {booking.rentalType && <span>{booking.rentalType}</span>}
                          {booking.payment && <span>{booking.payment}</span>}
                        </div>
                      </div>
                      <div className="booking-history-price">
                        <small>Total</small>
                        <strong>₱{Number(booking.totalPrice || 0).toLocaleString()}</strong>
                      </div>
                      <button
                        type="button"
                        className="booking-history-view-button"
                        onClick={() => setSelectedBooking(booking)}
                        aria-label={`View details for ${booking.carName}`}
                      >
                        <Eye size={16} aria-hidden="true" />
                        View details
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {selectedBooking && (
        <div
          className="booking-details-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedBooking(null);
          }}
        >
          <section
            className="booking-details-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-details-title"
          >
            <div className="booking-details-heading">
              <div>
                <p className="booking-history-kicker">Reservation details</p>
                <h2 id="booking-details-title">{selectedBooking.carName}</h2>
              </div>
              <button
                type="button"
                className="booking-details-close"
                onClick={() => setSelectedBooking(null)}
                aria-label="Close booking details"
              >
                <X size={20} />
              </button>
            </div>
            <div className="booking-details-content">
              <BookingCarGallery
                booking={selectedBooking}
                className="booking-details-image"
              />
              <div className="booking-details-status-row">
                <span className={`booking-history-status ${getStatus(selectedBooking).className}`}>
                  {getStatus(selectedBooking).label}
                </span>
                <span>Booking #{String(selectedBooking._id || "").slice(-8)}</span>
              </div>
              <dl className="booking-details-grid">
                <div>
                  <dt><CalendarDays size={16} /> Rental dates</dt>
                  <dd>{new Date(selectedBooking.startDate).toLocaleDateString()} – {new Date(selectedBooking.endDate).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt><UserRound size={16} /> Renter</dt>
                  <dd>{selectedBooking.name || "—"}</dd>
                  {selectedBooking.contact && <dd>{selectedBooking.contact}</dd>}
                </div>
                <div>
                  <dt><MapPin size={16} /> Pick-up location</dt>
                  <dd>{selectedBooking.pickupLocation || "—"}</dd>
                </div>
                <div>
                  <dt><MapPin size={16} /> Drop-off location</dt>
                  <dd>{selectedBooking.dropoffLocation || "—"}</dd>
                </div>
                <div>
                  <dt><CreditCard size={16} /> Payment method</dt>
                  <dd>{selectedBooking.payment || "—"}</dd>
                </div>
                <div>
                  <dt><CarFront size={16} /> Rental type</dt>
                  <dd>{selectedBooking.rentalType || "—"}</dd>
                </div>
                {selectedBooking.returnedAt && (
                  <div>
                    <dt><CircleCheck size={16} /> Returned on</dt>
                    <dd>{new Date(selectedBooking.returnedAt).toLocaleDateString()}</dd>
                  </div>
                )}
              </dl>
              <div className="booking-details-total">
                <span>Total price</span>
                <strong>₱{Number(selectedBooking.totalPrice || 0).toLocaleString()}</strong>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

export default BookingHistory;

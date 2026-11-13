  import "./Admin.css";
  import { useState, useEffect } from "react";
  import { API_BASE_URL } from "../config";
  import ManageCars from "./ManageCars";
  import AdminMessages from "./AdminMessages";

  export default function AdminDashboard({ onLogout, role = "admin", additionalTabs = [] }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [theme, setTheme] = useState(() => localStorage.getItem("adminTheme") || "dark");
    const activeTabLabel = [
      { id: "overview", label: "Overview" },
      { id: "tracking", label: "Tracking" },
      { id: "cars", label: "Manage Cars" },
      { id: "bookings", label: "Bookings" },
      { id: "messages", label: "Messages" },
      ...additionalTabs,
    ].find((tab) => tab.id === activeTab)?.label.replace(/^[^\w]+\s*/, "") || "Dashboard";

    const toggleTheme = () => {
      setTheme((currentTheme) => {
        const nextTheme = currentTheme === "dark" ? "light" : "dark";
        localStorage.setItem("adminTheme", nextTheme);
        return nextTheme;
      });
    };

    // State
    const [bookings, setBookings] = useState([]);
    const [completedBookings, setCompletedBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);

    const [overview, setOverview] = useState({
      totalBookings: 0,
      totalCars: 0,
      totalRevenue: 0,
      activeRentals: 0,
      recentBookings: [],
    });
    const [notifications, setNotifications] = useState([]);
    const [loadingOverview, setLoadingOverview] = useState(false);

    const [trackedCars, setTrackedCars] = useState([]);

    // Auto Refresh & Fetch data when tab changes
    useEffect(() => {
      const loadData = () => {
        if (activeTab === "bookings") fetchBookings();
        if (activeTab === "overview") fetchOverview();
        if (activeTab === "tracking") fetchTrackingData();
      };

      loadData();
      const interval = setInterval(loadData, 10000); // Auto refresh every 10s
      return () => clearInterval(interval);
    }, [activeTab, role]);

    // Real-time tracking simulation
    useEffect(() => {
      if (activeTab !== "tracking") return;

      const interval = setInterval(() => {
        setTrackedCars(prev => prev.map(car => {
          const isMoving = Math.random() > 0.3;
          return {
            ...car,
            speed: isMoving ? Math.floor(Math.random() * 60) + 20 : 0,
            status: isMoving ? "Moving" : "Idle",
            lat: car.lat + (Math.random() - 0.5) * 0.001,
            lng: car.lng + (Math.random() - 0.5) * 0.001,
          };
        }));
      }, 2000);

      return () => clearInterval(interval);
    }, [activeTab]);

    // -------------------
    // Fetch Overview
    // -------------------
    const fetchOverview = async () => {
      try {
        setLoadingOverview(true);
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch dashboard overview.");
        }

        setNotifications(data.notifications || []);
        setOverview({
          totalBookings: data.totalBookings || 0,
          totalCars: data.totalCars || 0,
          totalRevenue: data.totalRevenue || 0,
          activeRentals: data.activeRentals || 0,
          recentBookings: data.recentBookings || [],
        });
      } catch (err) {
        console.error("Error fetching overview:", err);
        alert("Failed to fetch overview data");
      } finally {
        setLoadingOverview(false);
      }
    };

    // -------------------
    // Fetch Bookings
    // -------------------
    const fetchBookings = async () => {
      try {
        setLoadingBookings(true);
        const res = await fetch(`${API_BASE_URL}/api/bookings`);
        if (!res.ok) throw new Error("Failed to fetch bookings");

        const data = await res.json();
        setBookings(data.filter((b) => b.status !== "Returned"));
        setCompletedBookings(data.filter((b) => b.status === "Returned"));
      } catch (err) {
        console.error("Error fetching bookings:", err);
        alert("Failed to load bookings");
      } finally {
        setLoadingBookings(false);
      }
    };

    // -------------------
    // Fetch Tracking Data
    // -------------------
    const fetchTrackingData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/bookings`);
        const data = await res.json();
        const active = data.filter(b => b.status !== "Returned");
        
        // Merge with existing to preserve simulation state if possible, else reset
        setTrackedCars(prev => {
          if (prev.length > 0 && prev.length === active.length) return prev;
          return active.map(b => ({
            id: b._id,
            carName: b.carName,
            user: b.name,
            speed: 0,
            lat: 14.6091, // Manila center approx
            lng: 121.0223,
            status: "Idle"
          }));
        });
      } catch (err) {
        console.error("Error fetching tracking data:", err);
      }
    };

    // -------------------
    // Actions
    // -------------------
    const deleteBooking = async (id) => {
      if (!window.confirm("Delete this booking?")) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/bookings/${id}`, { method: "DELETE" });
        if (res.ok) setBookings((prev) => prev.filter((b) => b._id !== id));
        else alert("Failed to delete booking");
      } catch (err) {
        console.error(err);
        alert("Error deleting booking");
      }
    };

    const approveBooking = async (id) => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Approved" }),
        });
        if (res.ok) {
          setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: "Approved" } : b)));
        } else alert("Failed to approve booking");
      } catch (err) {
        console.error(err);
        alert("Error approving booking");
      }
    };

    const returnBooking = async (id) => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/bookings/${id}/return`, { method: "PATCH" });
        if (res.ok) fetchBookings();
        else alert("Failed to mark as returned");
      } catch (err) {
        console.error(err);
        alert("Error updating booking");
      }
    };

    // -------------------
    // JSX
    // -------------------
    return (
      <div className="admin-container" data-theme={theme}>
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <h2 className="admin-title">{role === "superadmin" ? "Super Admin Panel" : "Admin Panel"}</h2>
          <ul className="admin-menu">
            <li className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>🏠 Overview</li>
            <li className={activeTab === "tracking" ? "active" : ""} onClick={() => setActiveTab("tracking")}>📍 Tracking</li>
            <li className={activeTab === "cars" ? "active" : ""} onClick={() => setActiveTab("cars")}>🚗 Manage Cars</li>
            <li className={activeTab === "bookings" ? "active" : ""} onClick={() => setActiveTab("bookings")}>📅 Bookings</li>
            <li className={activeTab === "messages" ? "active" : ""} onClick={() => setActiveTab("messages")}>💬 Messages</li>
            {additionalTabs.map((tab) => (
              <li
                key={tab.id}
                className={activeTab === tab.id ? "active" : ""}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </li>
            ))}
          </ul>
          <button className="logout-btn" onClick={onLogout}>🔒 Logout</button>
        </aside>

        {/* Main Content */}
        <main className="admin-content">
          <header className="admin-topbar">
            <div className="admin-topbar-title">
              <span className="admin-brand-mark" aria-hidden="true">D</span>
              <span className="admin-brand-name">DriveEasy</span>
              <span className="admin-topbar-divider" aria-hidden="true" />
              <span className="admin-current-page">{activeTabLabel}</span>
            </div>
            <div className="admin-topbar-meta">
              <span className="admin-status"><i aria-hidden="true" /> Online</span>
              <button
                type="button"
                className={`admin-theme-toggle ${theme === "light" ? "is-light" : ""}`}
                onClick={toggleTheme}
                role="switch"
                aria-checked={theme === "light"}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                <span className="admin-theme-toggle-track">
                  <span className="admin-theme-toggle-sky" aria-hidden="true" />
                  <span className="admin-theme-toggle-road" aria-hidden="true" />
                  <svg
                    className="admin-theme-toggle-car"
                    viewBox="0 0 64 36"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M12 23.5h-4a2 2 0 0 1-2-2v-3a3 3 0 0 1 2.2-2.9l5.2-1.4 6.1-7.3A5.2 5.2 0 0 1 23.5 5h17.2a8 8 0 0 1 5.7 2.4l6.5 6.7 4.8 1.3a4.5 4.5 0 0 1 3.3 4.4v2a2 2 0 0 1-2 2h-4.2" fill="currentColor" />
                    <path d="m18.7 13.1 4.4-5.3a1.2 1.2 0 0 1 .9-.4h8.1v5.7h-13.4Zm16.4-5.7h5.6a4 4 0 0 1 2.9 1.2l4.4 4.5H35.1V7.4Z" fill="#dce8f6" />
                    <path d="M12.5 23.5h5.2m28.2 0h5.3" stroke="currentColor" strokeWidth="2" />
                    <circle cx="20" cy="24" r="5.2" fill="#121619" stroke="#aab4bc" strokeWidth="2" />
                    <circle cx="20" cy="24" r="2" fill="#d9e1e7" />
                    <circle cx="46" cy="24" r="5.2" fill="#121619" stroke="#aab4bc" strokeWidth="2" />
                    <circle cx="46" cy="24" r="2" fill="#d9e1e7" />
                    <path d="M7 17.5h5.2" stroke="#fff1b8" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="admin-theme-toggle-label">{theme === "dark" ? "Dark" : "Light"}</span>
              </button>
              <span className="admin-role-badge">
                {role === "superadmin" ? "Super Admin" : "Car Owner"}
              </span>
            </div>
          </header>
          {/* Overview */}
          {activeTab === "overview" && (
            <div className="overview-container">
              <h2>Dashboard Overview</h2>
              {loadingOverview ? <p>Loading...</p> : (
                <div className="overview-content">
                  {/* Stats Cards */}
                  <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                    <div className="stat-card" style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", textAlign: "center" }}>
                      <h3 style={{ margin: "0 0 10px", color: "#7f8c8d", fontSize: "14px", textTransform: "uppercase" }}>Total Revenue</h3>
                      <p style={{ margin: 0, fontSize: "28px", fontWeight: "bold", color: "#2ecc71" }}>₱{overview.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="stat-card" style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", textAlign: "center" }}>
                      <h3 style={{ margin: "0 0 10px", color: "#7f8c8d", fontSize: "14px", textTransform: "uppercase" }}>Active Rentals</h3>
                      <p style={{ margin: 0, fontSize: "28px", fontWeight: "bold", color: "#3498db" }}>{overview.activeRentals}</p>
                    </div>
                    <div className="stat-card" style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", textAlign: "center" }}>
                      <h3 style={{ margin: "0 0 10px", color: "#7f8c8d", fontSize: "14px", textTransform: "uppercase" }}>Total Cars</h3>
                      <p style={{ margin: 0, fontSize: "28px", fontWeight: "bold", color: "#e67e22" }}>{overview.totalCars}</p>
                    </div>
                  </div>

                  <div className="dashboard-lower-section" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
                    {/* Recent Bookings */}
                    <div className="recent-bookings-card" style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
                      <h3 style={{ marginTop: 0, borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Recent Bookings</h3>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ textAlign: "left", color: "#7f8c8d", fontSize: "12px" }}>
                            <th style={{ padding: "10px 0" }}>Car</th>
                            <th style={{ padding: "10px 0" }}>User</th>
                            <th style={{ padding: "10px 0" }}>Status</th>
                            <th style={{ padding: "10px 0" }}>Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {overview.recentBookings.map(b => (
                            <tr key={b._id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                              <td style={{ padding: "12px 0", fontWeight: "500" }}>{b.carName}</td>
                              <td style={{ padding: "12px 0", color: "#666" }}>{b.name}</td>
                              <td style={{ padding: "12px 0" }}>
                                <span style={{ 
                                  padding: "4px 8px", 
                                  borderRadius: "12px", 
                                  fontSize: "11px",
                                  background: b.status === "Approved" ? "#e8f8f5" : b.status === "Returned" ? "#ebf5fb" : "#fef9e7",
                                  color: b.status === "Approved" ? "#2ecc71" : b.status === "Returned" ? "#3498db" : "#f1c40f"
                                }}>
                                  {b.status || "Pending"}
                                </span>
                              </td>
                              <td style={{ padding: "12px 0", fontWeight: "bold" }}>₱{b.totalPrice}</td>
                            </tr>
                          ))}
                          {overview.recentBookings.length === 0 && <tr><td colSpan="4" style={{ padding: "20px", textAlign: "center", color: "#999" }}>No recent bookings</td></tr>}
                        </tbody>
                      </table>
                    </div>

                    {/* Notifications */}
                    <div className="notifications-card" style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
                      <h3 style={{ marginTop: 0, borderBottom: "1px solid #eee", paddingBottom: "10px" }}>🔔 Notifications</h3>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {notifications.map((n) => (
                          <li key={n.id} style={{ padding: "15px 0", borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "start", gap: "10px" }}>
                            <div style={{ width: "8px", height: "8px", background: "#e74c3c", borderRadius: "50%", marginTop: "6px" }}></div>
                            <div>
                              <p style={{ margin: "0 0 5px", fontSize: "13px", fontWeight: "500" }}>{n.message}</p>
                              <span style={{ fontSize: "11px", color: "#999" }}>
                                {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                              </span>
                            </div>
                          </li>
                        ))}
                        {notifications.length === 0 && <li style={{ padding: "20px 0", color: "#999", textAlign: "center" }}>No new notifications</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tracking */}
          {activeTab === "tracking" && (
            <div className="admin-card">
              <h2>Car Tracking</h2>
              <p>Real-time fleet monitoring system.</p>
              
              <div className="tracking-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px", marginTop: "20px" }}>
                {trackedCars.length === 0 ? <p>No active vehicles to track.</p> : trackedCars.map(car => (
                  <div key={car.id} style={{ 
                    padding: "15px", 
                    border: "1px solid #eee", 
                    borderRadius: "8px", 
                    background: car.status === "Moving" ? "#f0fdf4" : "#fff" 
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <h3 style={{ margin: 0, fontSize: "16px" }}>{car.carName}</h3>
                      <span style={{ 
                        fontSize: "12px", 
                        padding: "4px 8px", 
                        borderRadius: "12px", 
                        background: car.status === "Moving" ? "#2ecc71" : "#95a5a6", 
                        color: "white" 
                      }}>{car.status}</span>
                    </div>
                    <p style={{ margin: "5px 0", fontSize: "14px" }}><strong>Driver:</strong> {car.user}</p>
                    <p style={{ margin: "5px 0", fontSize: "14px" }}><strong>Speed:</strong> {car.speed} km/h</p>
                    <p style={{ margin: "5px 0", fontSize: "12px", color: "#666" }}>
                      📍 {car.lat.toFixed(4)}, {car.lng.toFixed(4)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manage Cars */}
          {activeTab === "cars" && <ManageCars role={role} />}

          {/* Bookings */}
          {activeTab === "bookings" && (
            <div className="admin-card">
              <h2>Bookings</h2>
              {loadingBookings ? <p>Loading...</p> : (
                <>
                  <h3>Active Bookings</h3>
                  {bookings.length === 0 ? <p>No active bookings.</p> : (
                    <div className="bookings-table-scroll">
                      <table className="bookings-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Car</th>
                            <th>User</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Return</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.map((b) => (
                            <tr key={b._id} className={b.status === "Approved" ? "booking-row-approved" : ""}>
                              <td className="booking-id-cell">{b._id}</td>
                              <td>{b.carName}</td>
                              <td>{b.userId ? `${b.userId.name} (${b.userId.email})` : "Guest"}</td>
                              <td>{new Date(b.startDate).toLocaleDateString()}</td>
                              <td>{new Date(b.endDate).toLocaleDateString()}</td>
                              <td>₱{b.totalPrice}</td>
                              <td>{b.payment || "-"}</td>
                              <td>
                                {b.status === "Returned" ? new Date(b.returnedAt).toLocaleDateString() :
                                  <button className="return-btn" onClick={() => returnBooking(b._id)}>Mark as Returned</button>
                                }
                              </td>
                              <td className="booking-actions-cell">
                                {b.status !== "Returned" && <button className="approve-btn" onClick={() => approveBooking(b._id)}>Approve</button>}
                                <button className="delete-btn" onClick={() => deleteBooking(b._id)}>Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <h3 style={{ marginTop: "30px" }}>Completed Bookings</h3>
                  {completedBookings.length === 0 ? <p>No completed bookings.</p> : (
                    <div className="bookings-table-scroll">
                      <table className="bookings-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Car</th>
                            <th>User</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Return Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {completedBookings.map((b) => (
                            <tr key={b._id} className="booking-row-completed">
                              <td className="booking-id-cell">{b._id}</td>
                              <td>{b.carName}</td>
                              <td>{b.userId ? `${b.userId.name} (${b.userId.email})` : "Guest"}</td>
                              <td>{new Date(b.startDate).toLocaleDateString()}</td>
                              <td>{new Date(b.endDate).toLocaleDateString()}</td>
                              <td>₱{b.totalPrice}</td>
                              <td>{b.payment || "-"}</td>
                              <td>{new Date(b.returnedAt).toLocaleDateString()}</td>
                              <td><span className="booking-status-completed">Returned</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "messages" && (
            <AdminMessages token={localStorage.getItem("authToken")} role={role} />
          )}
          {additionalTabs.map((tab) => (
            activeTab === tab.id && <div key={tab.id}>{tab.content}</div>
          ))}
        </main>
      </div>
    );
  }
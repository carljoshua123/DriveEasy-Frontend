import { useEffect, useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { API_BASE_URL } from "../config";
import AdminDashboard from "./AdminDashboard";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
});

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", number: "" });

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: authHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load users.");
      setUsers(data);
      setError("");
    } catch (loadError) {
      console.error("Could not load users:", loadError);
      setError(loadError.message || "Could not load users.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const approveOwner = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}/approve-owner`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to approve car owner.");
      setUsers((current) => current.map((user) => user._id === id ? data.user : user));
    } catch (approveError) {
      console.error("Could not approve car owner:", approveError);
      setError(approveError.message || "Could not approve car owner.");
    }
  };

  const saveUser = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update user.");
      setUsers((current) => current.map((user) => user._id === id ? data.user : user));
      setEditingUserId(null);
      setError("");
    } catch (saveError) {
      console.error("Could not update user:", saveError);
      setError(saveError.message || "Could not update user.");
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete the account for ${user.name}?`)) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${user._id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to delete user.");
      setUsers((current) => current.filter((entry) => entry._id !== user._id));
      setError("");
    } catch (deleteError) {
      console.error("Could not delete user:", deleteError);
      setError(deleteError.message || "Could not delete user.");
    }
  };

  return (
    <section className="admin-card">
      <h2>Super Admin User Management</h2>
      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
      {isLoading ? <p>Loading users...</p> : users.length === 0 ? <p>No users yet.</p> : (
        <div style={{ overflowX: "auto" }}>
          <table className="users-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Account</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{editingUserId === user._id
                    ? <input aria-label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                    : user.name}</td>
                  <td>{editingUserId === user._id
                    ? <input aria-label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                    : user.email}</td>
                  <td>{editingUserId === user._id
                    ? <input aria-label="Phone number" inputMode="numeric" maxLength={11} value={form.number} onChange={(event) => setForm({ ...form, number: event.target.value })} />
                    : user.number}</td>
                  <td>{user.role === "superadmin" ? "Super admin"
                    : user.role === "pending_owner" ? "Car owner (pending)"
                      : user.role === "admin" ? "Car owner" : "Renter"}</td>
                  <td>
                    {editingUserId === user._id ? (
                      <>
                        <button type="button" className="btn-add" onClick={() => saveUser(user._id)}>Save</button>
                        <button type="button" className="delete-btn" onClick={() => setEditingUserId(null)}>Cancel</button>
                      </>
                    ) : user.role !== "superadmin" ? (
                      <>
                        {user.role === "pending_owner" && (
                          <button type="button" className="btn-add" onClick={() => approveOwner(user._id)}>Approve owner</button>
                        )}
                        <button type="button" className="btn-add" onClick={() => {
                          setEditingUserId(user._id);
                          setForm({ name: user.name, email: user.email, number: user.number });
                        }}>Edit</button>
                        <button type="button" className="delete-btn" onClick={() => deleteUser(user)}>Delete</button>
                      </>
                    ) : "Protected"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [bookingsResponse, carsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/bookings`),
          fetch(`${API_BASE_URL}/api/cars`),
        ]);
        if (!bookingsResponse.ok || !carsResponse.ok) {
          throw new Error("Could not load analytics data.");
        }
        const [bookings, cars] = await Promise.all([
          bookingsResponse.json(),
          carsResponse.json(),
        ]);
        const revenueByMonth = Array(12).fill(0);
        const bookingCountsByMonth = Array(12).fill(0);
        const currentYear = new Date().getFullYear();
        let yearlyRevenue = 0;

        bookings.forEach((booking) => {
          const date = new Date(booking.startDate);
          if (Number.isNaN(date.getTime()) || date.getFullYear() !== currentYear) return;
          const month = date.getMonth();
          const amount = Number(booking.totalPrice) || 0;
          revenueByMonth[month] += amount;
          bookingCountsByMonth[month] += 1;
          yearlyRevenue += amount;
        });

        const rented = bookings.filter((booking) => booking.status !== "Returned").length;
        setAnalytics({
          year: currentYear,
          yearlyRevenue,
          yearlyBookings: bookingCountsByMonth.reduce((sum, count) => sum + count, 0),
          availableCars: Math.max(cars.length - rented, 0),
          rentedCars: rented,
          revenueByMonth,
          bookingCountsByMonth,
        });
      } catch (loadError) {
        console.error("Could not load analytics:", loadError);
        setError(loadError.message || "Could not load analytics.");
      }
    };

    loadAnalytics();
  }, []);

  if (error) return <section className="admin-card"><h2>Analytics</h2><p role="alert">{error}</p></section>;
  if (!analytics) return <section className="admin-card"><h2>Analytics</h2><p>Loading analytics...</p></section>;

  const months = analytics.revenueByMonth.map((_, month) =>
    new Date(analytics.year, month).toLocaleString("en", { month: "short" })
  );
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" }, title: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div>
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 20 }}>
        <div className="admin-card"><h3>Revenue this year</h3><strong>₱{analytics.yearlyRevenue.toLocaleString()}</strong></div>
        <div className="admin-card"><h3>Bookings this year</h3><strong>{analytics.yearlyBookings}</strong></div>
        <div className="admin-card"><h3>Available cars</h3><strong>{analytics.availableCars}</strong></div>
        <div className="admin-card"><h3>Rented cars</h3><strong>{analytics.rentedCars}</strong></div>
      </div>
      <div className="admin-card" style={{ height: 360, marginBottom: 20 }}>
        <h2>Monthly Revenue ({analytics.year})</h2>
        <div style={{ height: 270 }}>
          <Bar options={chartOptions} data={{
            labels: months,
            datasets: [{ label: "Revenue (₱)", data: analytics.revenueByMonth, backgroundColor: "#d4af37" }],
          }} />
        </div>
      </div>
      <div className="admin-card" style={{ height: 360 }}>
        <h2>Monthly Bookings ({analytics.year})</h2>
        <div style={{ height: 270 }}>
          <Bar options={chartOptions} data={{
            labels: months,
            datasets: [{ label: "Bookings", data: analytics.bookingCountsByMonth, backgroundColor: "#2563eb" }],
          }} />
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminDashboard({ onLogout }) {
  const additionalTabs = [
    { id: "users", label: "👥 Users", content: <UserManagement /> },
    { id: "analytics", label: "📊 Analytics", content: <Analytics /> },
  ];

  return <AdminDashboard onLogout={onLogout} role="superadmin" additionalTabs={additionalTabs} />;
}

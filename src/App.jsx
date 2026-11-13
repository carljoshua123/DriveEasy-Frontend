// App.jsx
import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Home from "./components/Home";
import Cars from "./components/Cars";
import Contact from "./components/Contact";
import About from "./components/About";
import Booking from "./components/booking"; // Ensure casing matches your actual filename (Booking or booking)
import AdminDashboard from "./components/AdminDashboard";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import ManageCars from "./components/ManageCars";
import Login from "./components/Login";
import Signup from "./components/Signup";
import MessageWidget from "./components/MessageWidget";

import "./App.css";

export default function App() {
  // ✅ Load user from localStorage if exists
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");
    return token && role ? { token, role } : null;
  });

  const navigate = useNavigate();

  // ✅ LOGIN HANDLER
  const handleLogin = (token, email, roleOrIsAdmin) => {
    const role = typeof roleOrIsAdmin === "string"
      ? roleOrIsAdmin
      : roleOrIsAdmin ? "admin" : "user";

    setUser({ token, role });
    localStorage.setItem("authToken", token);
    localStorage.setItem("userRole", role);

    navigate("/"); // redirect after login
  };

  // ✅ LOGOUT HANDLER
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  return (
    <>
      <Routes>
        {/* 🔁 ROOT ROUTE */}
        <Route
          path="/"
          element={
            !isLoggedIn ? (
              <Navigate to="/login" replace />
            ) : isAdmin ? (
              user.role === "superadmin" ? (
                <SuperAdminDashboard onLogout={handleLogout} />
              ) : (
                <AdminDashboard onLogout={handleLogout} role={user.role} />
              )
            ) : (
              <Home onLogout={handleLogout} />
            )
          }
        />

        {/* 🔓 PUBLIC ROUTES */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />

        {/* 👤 USER ROUTES */}
        {isLoggedIn && !isAdmin && (
          <>
            <Route path="/cars" element={<Cars onLogout={handleLogout} />} />
            <Route path="/contact" element={<Contact onLogout={handleLogout} />} />
            <Route path="/about" element={<About onLogout={handleLogout} />} />
            <Route path="/booking" element={<Booking />} />
          </>
        )}

        {/* 🔐 ADMIN ROUTES */}
        {isLoggedIn && isAdmin && (
          <Route path="/manage-cars" element={<ManageCars role={user.role} />} />
        )}

        {/* ❌ FALLBACK FOR UNKNOWN ROUTES */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {isLoggedIn && user.role !== "superadmin" && (
        <MessageWidget token={user.token} role={user.role} />
      )}
    </>
  );
}
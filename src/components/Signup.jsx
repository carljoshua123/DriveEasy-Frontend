import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import AuthLayout from "./AuthLayout";
import "./Auth.css";

function Signup() {
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    number: "",
    accountType: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [numberError, setNumberError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupData({ ...signupData, [name]: value });

    if (name === "email") {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      setEmailError(isValid || !value ? "" : "Enter a valid email address.");
    }

    if (name === "number") {
      const isValid = /^[0-9]{11}$/.test(value);
      setNumberError(isValid || !value ? "" : "Use an 11-digit phone number.");
    }

    if (name === "password") {
      let strength = "Weak";
      if (
        value.length >= 6 &&
        /[A-Z]/.test(value) &&
        /[0-9]/.test(value) &&
        /[^A-Za-z0-9]/.test(value)
      ) {
        strength = "Strong";
      } else if (value.length >= 6) {
        strength = "Medium";
      }
      setPasswordStrength(value ? strength : "");
    }

    if (name === "confirmPassword" || name === "password") {
      const password = name === "password" ? value : signupData.password;
      const confirmation = name === "confirmPassword" ? value : signupData.confirmPassword;
      setPasswordMatchError(
        password && confirmation && password !== confirmation
          ? "Passwords do not match."
          : ""
      );
    }

    if (error) setError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, number, accountType } = signupData;

    if (!name || !email || !password || !confirmPassword || !number || !accountType) {
      setError("Complete all fields to create your account.");
      return;
    }

    if (!/^[0-9]{11}$/.test(number)) {
      setError("Use an 11-digit phone number.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (emailError) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, number, accountType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed. Please try again.");
        return;
      }

      window.alert(data.message || "Your account is ready. Please log in.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(
        `Unable to reach the backend at ${API_BASE_URL}. Start the backend server and try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      mode="signup"
      title="Create your account"
      subtitle="A few details are all you need to get started."
      footer={
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      }
    >
      <form className="auth-form auth-signup-form" onSubmit={handleSignup}>
        <div className="auth-field">
          <label htmlFor="signup-name">Full name</label>
          <input
            id="signup-name"
            name="name"
            autoComplete="name"
            value={signupData.name}
            onChange={handleChange}
            placeholder="Your full name"
            className="auth-input"
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="signup-email">Email address</label>
          <input
            id="signup-email"
            type="email"
            name="email"
            autoComplete="email"
            value={signupData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="auth-input"
            required
            aria-invalid={Boolean(emailError)}
          />
          {emailError && <p className="auth-field-error">{emailError}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="signup-number">Phone number</label>
          <input
            id="signup-number"
            type="tel"
            name="number"
            autoComplete="tel"
            inputMode="numeric"
            maxLength={11}
            value={signupData.number}
            onChange={handleChange}
            placeholder="09XXXXXXXXX"
            className="auth-input"
            required
            aria-invalid={Boolean(numberError)}
          />
          {numberError && <p className="auth-field-error">{numberError}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="signup-account-type">Account type</label>
          <select
            id="signup-account-type"
            name="accountType"
            value={signupData.accountType}
            onChange={handleChange}
            className="auth-input"
            required
          >
            <option value="" disabled>Choose an account type</option>
            <option value="renter">Renter</option>
            <option value="carOwner">Car owner</option>
          </select>
          {signupData.accountType === "carOwner" && (
            <p className="auth-field-note">
              Car owner accounts need admin approval before dashboard access.
            </p>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            name="password"
            autoComplete="new-password"
            value={signupData.password}
            onChange={handleChange}
            placeholder="Create a password"
            className="auth-input"
            required
          />
          {passwordStrength && (
            <p className={`auth-password-strength ${passwordStrength.toLowerCase()}`}>
              Password strength: {passwordStrength}
            </p>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="signup-confirm-password">Confirm password</label>
          <input
            id="signup-confirm-password"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            value={signupData.confirmPassword}
            onChange={handleChange}
            placeholder="Enter your password again"
            className="auth-input"
            required
            aria-invalid={Boolean(passwordMatchError)}
          />
          {passwordMatchError && (
            <p className="auth-field-error">{passwordMatchError}</p>
          )}
        </div>

        {error && <p className="auth-error" role="alert">{error}</p>}

        <button type="submit" className="auth-btn" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default Signup;

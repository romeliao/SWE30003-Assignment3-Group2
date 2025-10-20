import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneValid, setPhoneValid] = useState(false);
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [role, setRole] = useState("customer");
  const [passwordValid, setPasswordValid] = useState(false);
  const [checks, setChecks] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  const navigate = useNavigate();
  const formRef = useRef(null);

  useEffect(() => {
    // add no-scroll while auth page is mounted
    document.body.classList.add("no-scroll");
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  // password validation function
  const validatePassword = (pw) => {
    const newChecks = {
      length: pw.length >= 8,
      upper: /[A-Z]/.test(pw),
      lower: /[a-z]/.test(pw),
      number: /\d/.test(pw),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pw),
    };
    setChecks(newChecks);
    const allValid = Object.values(newChecks).every((c) => c);
    setPasswordValid(allValid);
    return allValid;
  };

  useEffect(() => {
    if (password) {
      validatePassword(password);
    } else {
      setPasswordValid(false);
      setChecks({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false,
      });
    }
  }, [password]);

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    validatePassword(val);
  };

  // email validation
  const validateEmail = (em) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = regex.test(em);
    setEmailValid(valid);
    return valid;
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    validateEmail(val);
  };

  // phone validation (basic)
  const validatePhone = (ph) => {
    const cleaned = ph.replace(/\D/g, "");
    const valid = cleaned.length >= 10 && cleaned.length <= 15;
    setPhoneValid(valid);
    return valid;
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setPhone(val);
    validatePhone(val);
  };

  const handleAddressChange = (e) => setAddress(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check email
    if (!emailValid) {
      return alert("Please enter a valid email address");
    }

    // Check phone
    if (!phoneValid) {
      return alert("Please enter a valid phone number (10-15 digits)");
    }

    // Check password
    if (!passwordValid) {
      return alert("Password does not meet requirements");
    }

    // Check password match
    if (password !== confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, address, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        return alert(data.error || "Signup failed");
      }

      // Save token and user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Account created successfully!");
      
      // Redirect based on role
      if (data.user.role === "staff") {
        navigate("/staff/dashboard");
      } else {
        navigate("/catalogue");
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Failed to create account. Please check if the backend server is running.");
    }
  };

  const indicator = (ok) => ({
    color: ok ? "#1e7e34" : "#c82333",
    fontWeight: 600,
    marginLeft: 8,
  });

  const passwordsMatch = confirmPassword && password === confirmPassword;

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Sign Up</h2>

        <form ref={formRef} onSubmit={handleSubmit} className="auth-form" aria-label="Sign up form">
          <input
            className="auth-input"
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
            required
            aria-label="Email"
          />
          {email && (
            <div style={{ fontSize: 13, marginTop: -4 }}>
              <span style={indicator(emailValid)}>
                {emailValid ? "✓ Valid email" : "✗ Invalid email"}
              </span>
            </div>
          )}

          <input
            className="auth-input"
            type="tel"
            placeholder="Phone (10-15 digits)"
            value={phone}
            onChange={handlePhoneChange}
            required
            aria-label="Phone"
          />
          {phone && (
            <div style={{ fontSize: 13, marginTop: -4 }}>
              <span style={indicator(phoneValid)}>
                {phoneValid ? "✓ Valid phone" : "✗ Must be 10-15 digits"}
              </span>
            </div>
          )}

          <input
            className="auth-input"
            type="text"
            placeholder="Address"
            value={address}
            onChange={handleAddressChange}
            required
          />

          {/* Role selection */}
          <div style={{ textAlign: "left", marginTop: 8 }}>
            <label style={{ fontSize: 14, color: "#55607f", marginBottom: 4, display: "block", fontWeight: 500 }}>
              Account Type
            </label>
            <select
              className="auth-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              aria-label="Account type"
              style={{ cursor: "pointer" }}
            >
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          {/* Password with toggle show button */}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input
              className="auth-input"
              type={showPasswords ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              required
              aria-label="Password"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn"
              onClick={() => setShowPasswords((s) => !s)}
              aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
            >
              {showPasswords ? "Hide" : "Show"}
            </button>
          </div>

          {password && (
            <div style={{ fontSize: 13, textAlign: "left", marginTop: 4 }}>
              <div style={indicator(checks.length)}>
                {checks.length ? "✓" : "✗"} At least 8 characters
              </div>
              <div style={indicator(checks.upper)}>
                {checks.upper ? "✓" : "✗"} At least one uppercase letter
              </div>
              <div style={indicator(checks.lower)}>
                {checks.lower ? "✓" : "✗"} At least one lowercase letter
              </div>
              <div style={indicator(checks.number)}>
                {checks.number ? "✓" : "✗"} At least one number
              </div>
              <div style={indicator(checks.special)}>
                {checks.special ? "✓" : "✗"} At least one special character (!@#$%^&*, etc.)
              </div>
            </div>
          )}

          {/* Confirm password */}
          <input
            className="auth-input"
            type={showPasswords ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            aria-label="Confirm password"
            style={{ marginTop: 8 }}
          />
          {confirmPassword && (
            <div style={{ fontSize: 13, marginTop: -4 }}>
              <span style={indicator(passwordsMatch)}>
                {passwordsMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
              </span>
            </div>
          )}

          <button className="btn primary" type="submit" style={{ marginTop: 12 }}>
            Sign Up
          </button>
        </form>

        <p className="auth-footer" style={{ marginTop: 12 }}>
          Already have an account?{" "}
          <Link to="/login">
            <button style={{ marginLeft: 8 }} className="btn">
              Login
            </button>
          </Link>
        </p>
      </div>
    </div>
  );
}
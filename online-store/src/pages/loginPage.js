import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [toast, setToast] = useState(null); // { message, type }
  const navigate = useNavigate();

  useEffect(() => {
    // add no-scroll while auth page is mounted
    document.body.classList.add("no-scroll");
    return () => {
      // remove it when leaving
      document.body.classList.remove("no-scroll");
    };
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return showToast("Please enter email and password", "error");
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return showToast(data.error || "Login failed", "error");
      }

      // Save token and user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

  showToast("Logged in successfully!", "success");
      
      // Redirect based on role (slight delay so toast is visible)
      setTimeout(() => {
        if (data.user.role === "staff") {
          navigate("/staff/dashboard");
        } else {
          navigate("/catalogue");
        }
      }, 600);
    } catch (error) {
      console.error("Login error:", error);
      showToast("Failed to login. Please check if the backend server is running.", "error");
    }
  };

  return (
    <div className="page auth-page">
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>

        <form onSubmit={handleSubmit} className="auth-form" aria-label="Login form">
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {/*password with toggle show button*/}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="auth-input"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="Password"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button className="btn primary" type="submit">
            Login
          </button>

          <p style={{ textAlign: "center", marginTop: 12, fontSize: 14 }}>
            <Link to="/forgot-password" style={{ color: "#007bff", textDecoration: "none" }}>
              Forgot Password?
            </Link>
          </p>
        </form>

        <p className="auth-footer" style={{ marginTop: 12 }}>
          No account?{" "}
          <Link to="/signup">
            <button style={{ marginLeft: 8 }} className="btn">
              Sign Up
            </button>
          </Link>
        </p>
      </div>
    </div>
  );
}
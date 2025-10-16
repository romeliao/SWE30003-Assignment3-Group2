// ...existing code...
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // add no-scroll while auth page is mounted
    document.body.classList.add("no-scroll");
    return () => {
      // remove it when leaving
      document.body.classList.remove("no-scroll");
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      localStorage.setItem("user", JSON.stringify({ email }));
      alert("Logged in");
      navigate("/catalogue");
    } else {
      alert("Please enter valid credentials");
    }
  };

  return (
    <div className="page auth-page">
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
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="btn primary" type="submit">
            Login
          </button>
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

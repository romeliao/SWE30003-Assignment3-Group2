// ...existing code...
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // disable body scrolling while on the auth page
    document.body.classList.add("no-scroll");
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) return alert("Please fill all required fields");
    const user = { name, email };
    localStorage.setItem("user", JSON.stringify(user));
    alert("Account created");
    navigate("/login");
  };

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Sign Up</h2>

        <form onSubmit={handleSubmit} className="auth-form" aria-label="Sign up form">
          <input
            className="auth-input"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            aria-label="Full name"
          />

          <input
            className="auth-input"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="Email address"
          />

          <input
            className="auth-input"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-label="Password"
          />

          <button className="btn primary" type="submit">Create account</button>
        </form>

        <p className="auth-footer" style={{ marginTop: 12 }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

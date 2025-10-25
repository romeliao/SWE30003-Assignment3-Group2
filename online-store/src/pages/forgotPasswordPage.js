import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email) {
      return setError("Please enter your email address");
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Failed to send reset instructions");
        setLoading(false);
        return;
      }

      setMessage(data.message || "Reset link generated!");
      
      // Redirect to reset password page after 2 seconds
      setTimeout(() => {
        navigate(`/reset-password?token=${data.resetToken}`);
      }, 2000);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Failed to send reset instructions. Please check if the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Forgot Password</h2>
        <p style={{ textAlign: "center", color: "#55607f", marginBottom: 20 }}>
          Enter your email address and we'll send you instructions to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="auth-form" aria-label="Forgot password form">
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          {error && (
            <div style={{ color: "#c82333", fontSize: 14, marginTop: 10, textAlign: "center" }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{ color: "#1e7e34", fontSize: 14, marginTop: 10, textAlign: "center" }}>
              {message}
            </div>
          )}

          <button 
            className="btn primary" 
            type="submit"
            disabled={loading}
            style={{ marginTop: 12 }}
          >
            {loading ? "Sending..." : "Send Reset Instructions"}
          </button>
        </form>

        <p className="auth-footer" style={{ marginTop: 12 }}>
          Remember your password?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

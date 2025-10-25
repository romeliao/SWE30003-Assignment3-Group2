import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Notification from "../components/Notification";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
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

    if (!email) {
      return setMessage({ text: "Please enter your email address", type: "error" });
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
        setMessage({ text: data.error || "Failed to send reset instructions", type: "error" });
        setLoading(false);
        return;
      }

      setMessage({
        text: "Reset link generated! Redirecting to reset page...",
        type: "success",
      });
      
      // Redirect to reset password page after 2 seconds
      setTimeout(() => {
        navigate(`/reset-password?token=${data.resetToken}`);
      }, 2000);
    } catch (err) {
      console.error("Forgot password error:", err);
      setMessage({
        text: "Failed to send reset instructions. Please check if the backend server is running.",
        type: "error",
      });
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
          <button 
            className="btn primary" 
            type="submit"
            disabled={loading}
            style={{ marginTop: 12 }}
          >
            {loading ? "Sending..." : "Send Reset Instructions"}
          </button>
        </form>
        <Notification message={message} onClear={() => setMessage({ text: "", type: "" })} />
        <p className="auth-footer" style={{ marginTop: 12 }}>
          Remember your password?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

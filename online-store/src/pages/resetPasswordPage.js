import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [checks, setChecks] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  const [showPassword, setShowPassword] = useState(false);     
  const [showConfirm, setShowConfirm] = useState(false);       
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, []);

  // Password validation
  const validatePassword = (pw) => {
    const rules = {
      length: pw.length >= 8,
      upper: /[A-Z]/.test(pw),
      lower: /[a-z]/.test(pw),
      number: /[0-9]/.test(pw),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pw),
    };
    setChecks(rules);
    setPasswordValid(Object.values(rules).every(Boolean));
  };

  useEffect(() => {
    validatePassword(password);
  }, [password]);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError("");
    setMessage("");
  };
  const handleConfirmChange = (e) => {
    setConfirmPassword(e.target.value);
    setError("");
    setMessage("");
  };

  const passwordsMatch = password && confirmPassword && password === confirmPassword; // NEW: match check

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!passwordValid) return setError("Password does not meet requirements.");
    if (!passwordsMatch) return setError("Passwords do not match."); 

    try {
      setLoading(true);
      const resp = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Reset failed");
      setMessage("Password updated. Redirecting to login…");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const indicator = (ok) => ({
    color: ok ? "#1e7e34" : "#c82333",
    fontWeight: 600,
    marginLeft: 8,
  });

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Reset Password</h2>

        <form onSubmit={handleSubmit} className="auth-form" aria-label="Reset password form">
          {/* passwords with one Show/Hide button */}
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1, display: "grid", gap: 8 }}>
              <input
                className="auth-input"
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); setMessage(""); }}
                required
                aria-label="New password"
              />
              <input
                className="auth-input"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); setMessage(""); }}
                required
                aria-label="Confirm password"
              />
            </div>
            <button
              type="button"
              className="btn"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide passwords" : "Show passwords"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* match + strength hints */}
          <div style={{ textAlign: "left", marginTop: 8, fontSize: 13 }}>
            {confirmPassword ? (
              <span style={{ color: passwordsMatch ? "#1e7e34" : "#c82333", fontWeight: 600 }}>
                {passwordsMatch ? "Passwords match" : "Passwords do not match"}
              </span>
            ) : null}
          </div>

          <div style={{ textAlign: "left", marginTop: 8, fontSize: 13, color: "#55607f" }}>
            <div>
              <span style={indicator(checks.length)}>{checks.length ? "✔" : "✖"}</span>
              <span style={{ marginLeft: 8 }}>At least 8 characters</span>
            </div>
            <div>
              <span style={indicator(checks.upper)}>{checks.upper ? "✔" : "✖"}</span>
              <span style={{ marginLeft: 8 }}>Contains an uppercase letter</span>
            </div>
            <div>
              <span style={indicator(checks.lower)}>{checks.lower ? "✔" : "✖"}</span>
              <span style={{ marginLeft: 8 }}>Contains a lowercase letter</span>
            </div>
            <div>
              <span style={indicator(checks.number)}>{checks.number ? "✔" : "✖"}</span>
              <span style={{ marginLeft: 8 }}>Contains a number</span>
            </div>
            <div>
              <span style={indicator(checks.special)}>{checks.special ? "✔" : "✖"}</span>
              <span style={{ marginLeft: 8 }}>Contains a special character (e.g. !@#$%)</span>
            </div>
          </div>

          {error && <div style={{ color: "#c82333", marginTop: 10 }}>{error}</div>}
          {message && <div style={{ color: "#1e7e34", marginTop: 10 }}>{message}</div>}

          <button
            className="btn primary"
            type="submit"
            style={{ marginTop: 12 }}
            disabled={!passwordValid || !passwordsMatch || loading}  // NEW: disable when invalid/mismatch
            aria-disabled={!passwordValid || !passwordsMatch || loading}
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
// ...existing code...
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [checks, setChecks] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    // disable body scrolling while on the auth page
    document.body.classList.add("no-scroll");
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  //password validation function
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
    const pw = e.target.value;
    setPassword(pw);
    validatePassword(pw);
  };

  //email validation function
  const validateEmail = (em) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(re.test(String(em).toLowerCase()));
  }

  const handleEmailChange = (e) => {
    const em = e.target.value;
    setEmail(em);
    validateEmail(em);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("submit", { name, email, passwordValid, checks }); // debug
    if (!name || !email || !password) return alert("Please fill all required fields");
    if (!emailValid) return alert("Please enter a valid email address");
    if (!passwordValid) return alert("Password does not meet requirements");
    const user = { name, email };
    localStorage.setItem("user", JSON.stringify(user));
    alert("Account created");
    navigate("/login");
  };

  const indicator = (ok) => ({
    color: ok ? "#1e7e34" : "#c82333",
    fontWeight: 600,
    marginLeft: 8,
  });

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
            onChange={handleEmailChange}
            required
            aria-label="Email address"
          />

          {/* email validity hint */}
          <div style={{ textAlign: "left", marginTop: 6, fontSize: 13 }}>
            {email ? (
              <span style={{ color: emailValid ? "#1e7e34" : "#c82333", fontWeight: 600 }}>
                {emailValid ? "Valid email" : "Invalid email format"}
              </span>
            ) : null}
          </div>
          
          <input
            className="auth-input"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            required
            aria-label="Password"
          />

          {/* password requirements */}
          <div style={{ textAlign: "left", marginTop: 8, fontSize: 13, color: "#55607f" }}>
            <div>
              <span style={indicator(checks.length)}>
                {checks.length ? "✔" : "✖"}
              </span>
              <span style={{ marginLeft: 8 }}>At least 8 characters</span>
            </div>
            <div>
              <span style={indicator(checks.upper)}>
                {checks.upper ? "✔" : "✖"}
              </span>
              <span style={{ marginLeft: 8 }}>Contains an uppercase letter</span>
            </div>
            <div>
              <span style={indicator(checks.lower)}>
                {checks.lower ? "✔" : "✖"}
              </span>
              <span style={{ marginLeft: 8 }}>Contains a lowercase letter</span>
            </div>
            <div>
              <span style={indicator(checks.number)}>
                {checks.number ? "✔" : "✖"}
              </span>
              <span style={{ marginLeft: 8 }}>Contains a number</span>
            </div>
            <div>
              <span style={indicator(checks.special)}>
                {checks.special ? "✔" : "✖"}
              </span>
              <span style={{ marginLeft: 8 }}>Contains a special character (e.g. !@#$%)</span>
            </div>
          </div>

          <button
            className="btn primary"
            type="submit"
            style={{ marginTop: 12 }}
          >
            Create account
          </button>
        </form>

        <p className="auth-footer" style={{ marginTop: 12 }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

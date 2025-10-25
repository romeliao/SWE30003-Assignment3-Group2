import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import profileIcon from "../icons/profile.png";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      console.log("[Navbar] user:", parsedUser);
      console.log("[Navbar] user role:", parsedUser?.role);
    } else {
      setUser(null);
    }
    // close mobile menu on navigation change
    setMenuOpen(false);
  }, [location]);

  const isStaff = user?.role === "staff";
  const isCustomer = user?.role === "customer";
  console.log("[Navbar] isStaff:", isStaff, "isCustomer:", isCustomer);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h2 className="nav-brand">Online Store</h2>
      </div>
      <button
        className="nav-toggle"
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
      >
        <span className="nav-toggle-bar" />
        <span className="nav-toggle-bar" />
        <span className="nav-toggle-bar" />
      </button>
      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        <Link to="/catalogue" onClick={() => setMenuOpen(false)}>Catalogue</Link>
        
        {/* Staff-only links */}
        {isStaff && (
          <>
            <Link to="/staff/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link to="/staff/products" onClick={() => setMenuOpen(false)}>Manage Products</Link>
            <Link to="/staff/orders" onClick={() => setMenuOpen(false)}>Manage Orders</Link>
            <Link to="/staff/reports" onClick={() => setMenuOpen(false)}>Reports</Link>
          </>
        )}
        
        {/* Customer-only links */}
        {isCustomer && (
          <>
            <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart</Link>
            <Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
          </>
        )}

        {/* Logout button for logged-in users */}
        {user && (
          <button
            onClick={handleLogout}
            className="btn nav-logout-btn"
            aria-label="Logout"
          >
            Logout
          </button>
        )}

        {/* Profile icon - shown when not logged in */}
        {!user && (
          <Link
            to="/login"
            aria-label="Login"
            className="profile-link"
          >
            <img
              src={profileIcon}
              alt="Login"
              className="profile-icon"
              width="24"
              height="24"
            />
          </Link>
        )}
      </div>
    </nav>
  );
}
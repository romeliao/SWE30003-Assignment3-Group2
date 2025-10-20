import React from "react";
import { Link } from "react-router-dom";
import profileIcon from "../icons/profile.png";

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));
  console.log("[Navbar] user:", user);
  const isStaff = user?.role === "staff";
  const isCustomer = user?.role === "customer";

  return (
    <nav className="navbar">
      <h2>Online Store</h2>
      <div>
        <Link to="/catalogue">Catalogue</Link>
        
        {/* Staff-only links */}
        {isStaff && (
          <>
            <Link to="/staff/dashboard">Dashboard</Link>
            <Link to="/staff/products">Manage Products</Link>
            <Link to="/staff/orders">Manage Orders</Link>
          </>
        )}
        
        {/* Customer-only links */}
        {isCustomer && (
          <>
            <Link to="/cart">Cart</Link>
            <Link to="/orders">My Orders</Link>
          </>
        )}

        {/* Profile icon - always visible */}
        <Link
          to="/login"
          aria-label={user ? `Profile of ${user.email}` : "Login"}
          className="profile-link"
        >
          <img
            src={profileIcon}
            alt={user ? user.email : "Login"}
            className="profile-icon"
            width="24"
            height="24"
          />
        </Link>
      </div>
    </nav>
  );
}
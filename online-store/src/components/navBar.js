import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import profileIcon from "../icons/profile.png";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const location = useLocation();

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
  }, [location]);

  const isStaff = user?.role === "staff";
  const isCustomer = user?.role === "customer";
  console.log("[Navbar] isStaff:", isStaff, "isCustomer:", isCustomer);

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
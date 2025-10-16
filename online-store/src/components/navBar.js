import React from "react";
import { Link } from "react-router-dom";
import profileIcon from "../icons/profile.png";

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <nav className="navbar">
      <h2>Online Store</h2>
      <div>
        <Link to="/catalogue">Catalogue</Link>

        {/* ensure the icon always goes to the login page */}
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
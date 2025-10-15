import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <h2>Online Store</h2>
      <div>
        <Link to="/catalogue">Catalogue</Link>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
}

import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access control
  if (allowedRole && user.role !== allowedRole) {
    // Redirect to appropriate home page based on role
    if (user.role === "staff") {
      return <Navigate to="/staff/dashboard" replace />;
    } else {
      return <Navigate to="/catalogue" replace />;
    }
  }

  return children;
}
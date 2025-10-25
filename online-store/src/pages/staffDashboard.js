import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StaffDashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="page" style={{ padding: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1>Staff Dashboard</h1>
        </div>
        
        {user && (
          <div style={{ marginBottom: "2rem", padding: "1.5rem", background: "#f8f9fa", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <h3 style={{ marginBottom: "0.5rem" }}>Welcome, {user.name}!</h3>
            <p style={{ margin: "0.25rem 0", color: "#666" }}>Email: {user.email}</p>
            <p style={{ margin: "0.25rem 0", color: "#666" }}>Role: <span style={{ textTransform: "capitalize", fontWeight: 600, color: "#2b3a67" }}>{user.role}</span></p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          <div className="dashboard-card">
            <h3>Manage Products</h3>
            <p>Add, edit, or remove products from the catalogue</p>
            <button className="btn primary" onClick={() => navigate("/staff/products")}>Go to Products</button>
          </div>

          <div className="dashboard-card">
            <h3>Manage Orders</h3>
            <p>View and process customer orders</p>
            <button className="btn primary" onClick={() => navigate("/staff/orders")}>Go to Orders</button>
          </div>

          <div className="dashboard-card">
            <h3>View Customers</h3>
            <p>Manage customer accounts and information</p>
            <button className="btn primary" onClick={() => navigate("/staff/customers")}>Go to Customers</button>
          </div>

          <div className="dashboard-card">
            <h3>Reports</h3>
            <p>View sales reports and analytics</p>
            <button className="btn primary" onClick={() => navigate("/staff/reports")}>Go to Reports</button>
          </div>
        </div>

        <button onClick={handleLogout} className="btn" style={{ background: "#dc3545", color: "#fff" }}>
          Logout
        </button>
      </div>
    </div>
  );
}
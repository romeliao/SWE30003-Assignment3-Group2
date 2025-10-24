import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ViewCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/auth/staff/customers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data = await response.json();
      setCustomers(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching customers:", error);
      alert("Failed to load customers");
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (customerId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/auth/staff/customers/${customerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch customer details");
      }

      const data = await response.json();
      setSelectedCustomer(data);
      setShowDetails(true);
    } catch (error) {
      console.error("Error fetching customer details:", error);
      alert("Failed to load customer details");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="page" style={{ padding: "2rem" }}>
        <h1>View Customers</h1>
        <p>Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="page" style={{ padding: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1>View Customers</h1>

        {/* Search Bar */}
        <div style={{ marginBottom: "2rem" }}>
          <input
            type="text"
            placeholder="Search by email, name, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="auth-input"
            style={{ maxWidth: "400px" }}
          />
        </div>

        {/* Customer Count */}
        <p style={{ marginBottom: "1.5rem", color: "#666" }}>
          Showing {filteredCustomers.length} of {customers.length} customers
        </p>

        {filteredCustomers.length === 0 ? (
          <p>No customers found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <strong>{customer.id}</strong>
                    </td>
                    <td>{customer.name || "N/A"}</td>
                    <td>{customer.email}</td>
                    <td>{formatDate(customer.createdAt)}</td>
                    <td>
                      <button
                        className="btn"
                        onClick={() => fetchCustomerDetails(customer.id)}
                        style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Customer Details Modal */}
        {showDetails && selectedCustomer && (
          <div className="modal-overlay" onClick={() => setShowDetails(false)}>
            <div
              className="modal-card customer-details-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1.5rem" }}>
                <h2 style={{ margin: 0 }}>Customer Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    color: "#666",
                  }}
                >
                  ×
                </button>
              </div>

              <div className="customer-info-section">
                <h3>Customer Information</h3>
                <div className="info-row">
                  <span className="info-label">Customer ID:</span>
                  <span>{selectedCustomer.id}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Name:</span>
                  <span>{selectedCustomer.name || "Not provided"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span>{selectedCustomer.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Role:</span>
                  <span style={{ textTransform: "capitalize" }}>{selectedCustomer.role}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Registered:</span>
                  <span>{formatDate(selectedCustomer.createdAt)}</span>
                </div>
              </div>

              <div className="customer-stats-section">
                <h3>Order Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{selectedCustomer.totalOrders}</div>
                    <div className="stat-label">Total Orders</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">${selectedCustomer.totalSpent.toFixed(2)}</div>
                    <div className="stat-label">Total Spent</div>
                  </div>
                </div>
              </div>

              {selectedCustomer.orders && selectedCustomer.orders.length > 0 && (
                <div className="customer-orders-section">
                  <h3>Order History</h3>
                  <div className="orders-list-compact">
                    {selectedCustomer.orders.map((order) => (
                      <div key={order.id} className="order-compact">
                        <div className="order-compact-header">
                          <strong>Order #{order.id}</strong>
                          <span className="order-compact-date">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="order-compact-details">
                          <span>{order.items.length} item(s)</span>
                          <span className="order-compact-total">${order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

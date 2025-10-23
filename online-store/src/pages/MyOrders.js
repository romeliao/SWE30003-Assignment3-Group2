import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/auth/customer/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      // Sort by most recent first
      const sortedOrders = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedOrders);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      alert("Failed to load orders");
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: "status-badge status-pending",
      processing: "status-badge status-processing",
      shipped: "status-badge status-shipped",
      delivered: "status-badge status-delivered",
      cancelled: "status-badge status-cancelled",
      completed: "status-badge status-completed",
    };
    return statusClasses[status] || "status-badge";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="page" style={{ padding: "2rem" }}>
        <h1>My Orders</h1>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="page" style={{ padding: "2rem", textAlign: "center" }}>
        <h1>My Orders</h1>
        <p style={{ margin: "2rem 0", color: "#666" }}>You haven't placed any orders yet.</p>
        <button className="btn primary" onClick={() => navigate("/catalogue")}>
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="page" style={{ padding: "2rem" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h1>My Orders</h1>

        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-header-info">
                  <h3>Order #{order.id}</h3>
                  <p className="order-date">{formatDate(order.createdAt)}</p>
                </div>
                <span className={getStatusBadgeClass(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className="order-items-summary">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item-row">
                    <span className="order-item-name">
                      {item.productName} x {item.quantity}
                    </span>
                    <span className="order-item-price">${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="order-shipping">
                  <strong>Shipping Address:</strong> {order.shippingAddress}
                </div>
                <div className="order-total">
                  <strong>Total:</strong> ${order.totalAmount.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

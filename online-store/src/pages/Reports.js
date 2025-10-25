import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function Reports() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Fetch orders and products in parallel
      const [ordersRes, productsRes] = await Promise.all([
        fetch("http://localhost:5000/api/auth/staff/orders", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/auth/staff/products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!ordersRes.ok || !productsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();

      setOrders(ordersData);
      setProducts(productsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter orders by date
  const getFilteredOrders = () => {
    const now = new Date();
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      
      switch (dateFilter) {
        case "today":
          return orderDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= weekAgo;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return orderDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const filteredOrders = getFilteredOrders();

  // Calculate metrics
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = filteredOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Completed orders
  const completedOrders = filteredOrders.filter(o => o.status === "completed");

  // Top selling products
  const productSales = {};
  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          name: item.productName,
          quantity: 0,
          revenue: 0,
        };
      }
      productSales[item.productId].quantity += item.quantity;
      productSales[item.productId].revenue += item.subtotal;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Sales by category
  const categorySales = {};
  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      const category = product?.category || "Unknown";
      
      if (!categorySales[category]) {
        categorySales[category] = {
          revenue: 0,
          quantity: 0,
        };
      }
      categorySales[category].revenue += item.subtotal;
      categorySales[category].quantity += item.quantity;
    });
  });

  const topCategories = Object.entries(categorySales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  // Low stock products
  const lowStockProducts = products
    .filter((p) => p.stock < 30)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 10);

  if (loading) {
    return (
      <div className="page" style={{ padding: "2rem" }}>
        <h1>Sales Reports</h1>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="page" style={{ padding: "2rem" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h1>Sales Reports & Analytics</h1>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className={`btn ${dateFilter === "all" ? "primary" : ""}`}
              onClick={() => setDateFilter("all")}
            >
              All Time
            </button>
            <button
              className={`btn ${dateFilter === "month" ? "primary" : ""}`}
              onClick={() => setDateFilter("month")}
            >
              Last 30 Days
            </button>
            <button
              className={`btn ${dateFilter === "week" ? "primary" : ""}`}
              onClick={() => setDateFilter("week")}
            >
              Last 7 Days
            </button>
            <button
              className={`btn ${dateFilter === "today" ? "primary" : ""}`}
              onClick={() => setDateFilter("today")}
            >
              Today
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          <div className="stat-card">
            <div className="stat-value">${totalRevenue.toFixed(2)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalOrders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">${averageOrderValue.toFixed(2)}</div>
            <div className="stat-label">Average Order Value</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{completedOrders.length}</div>
            <div className="stat-label">Completed Orders</div>
          </div>
        </div>

        {/* Two Column Layout */}
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", marginBottom: "2rem" }}>
          {/* Top Selling Products */}
          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>Top Selling Products</h2>
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              <table style={{ width: "100%", fontSize: "0.9rem" }}>
                <thead style={{ position: "sticky", top: 0, background: "#fff" }}>
                  <tr style={{ borderBottom: "2px solid #dee2e6" }}>
                    <th style={{ textAlign: "left", padding: "0.75rem 0.5rem" }}>Product</th>
                    <th style={{ textAlign: "center", padding: "0.75rem 0.5rem" }}>Qty</th>
                    <th style={{ textAlign: "right", padding: "0.75rem 0.5rem" }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "0.75rem 0.5rem" }}>{product.name}</td>
                      <td style={{ textAlign: "center", padding: "0.75rem 0.5rem" }}>{product.quantity}</td>
                      <td style={{ textAlign: "right", padding: "0.75rem 0.5rem", fontWeight: 600 }}>
                        ${product.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {topProducts.length === 0 && (
                <p style={{ textAlign: "center", color: "#666", padding: "2rem" }}>No sales data available</p>
              )}
            </div>
          </div>

          {/* Sales by Category */}
          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>Sales by Category</h2>
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              <table style={{ width: "100%", fontSize: "0.9rem" }}>
                <thead style={{ position: "sticky", top: 0, background: "#fff" }}>
                  <tr style={{ borderBottom: "2px solid #dee2e6" }}>
                    <th style={{ textAlign: "left", padding: "0.75rem 0.5rem" }}>Category</th>
                    <th style={{ textAlign: "center", padding: "0.75rem 0.5rem" }}>Items Sold</th>
                    <th style={{ textAlign: "right", padding: "0.75rem 0.5rem" }}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topCategories.map((category, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "0.75rem 0.5rem" }}>{category.name}</td>
                      <td style={{ textAlign: "center", padding: "0.75rem 0.5rem" }}>{category.quantity}</td>
                      <td style={{ textAlign: "right", padding: "0.75rem 0.5rem", fontWeight: 600 }}>
                        ${category.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {topCategories.length === 0 && (
                <p style={{ textAlign: "center", color: "#666", padding: "2rem" }}>No category data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem", color: "#dc3545" }}>⚠️ Low Stock Alert</h2>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            <table style={{ width: "100%", fontSize: "0.9rem" }}>
              <thead style={{ position: "sticky", top: 0, background: "#fff" }}>
                <tr style={{ borderBottom: "2px solid #dee2e6" }}>
                  <th style={{ textAlign: "left", padding: "0.75rem 0.5rem" }}>Product</th>
                  <th style={{ textAlign: "left", padding: "0.75rem 0.5rem" }}>Category</th>
                  <th style={{ textAlign: "center", padding: "0.75rem 0.5rem" }}>Current Stock</th>
                  <th style={{ textAlign: "right", padding: "0.75rem 0.5rem" }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((product) => (
                  <tr key={product.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "0.75rem 0.5rem" }}>{product.name}</td>
                    <td style={{ padding: "0.75rem 0.5rem", color: "#666" }}>{product.category}</td>
                    <td style={{ textAlign: "center", padding: "0.75rem 0.5rem" }}>
                      <span style={{ 
                        background: product.stock < 10 ? "#dc3545" : "#ffc107",
                        color: "#fff",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "12px",
                        fontWeight: 600,
                        fontSize: "0.85rem"
                      }}>
                        {product.stock}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", padding: "0.75rem 0.5rem" }}>${product.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lowStockProducts.length === 0 && (
              <p style={{ textAlign: "center", color: "#28a745", padding: "2rem" }}>✓ All products are well stocked!</p>
            )}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>Order Status Breakdown</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
            {["completed", "pending", "processing", "shipped", "delivered", "cancelled"].map((status) => {
              const count = filteredOrders.filter((o) => o.status === status).length;
              const revenue = filteredOrders
                .filter((o) => o.status === status)
                .reduce((sum, o) => sum + o.totalAmount, 0);
              
              return (
                <div key={status} style={{ textAlign: "center", padding: "1rem", background: "#f8f9fa", borderRadius: "6px" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#2b3a67" }}>{count}</div>
                  <div style={{ fontSize: "0.85rem", color: "#666", textTransform: "capitalize", marginBottom: "0.5rem" }}>
                    {status}
                  </div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#28a745" }}>
                    ${revenue.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

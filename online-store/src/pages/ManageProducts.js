import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Notification from "../components/Notification";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });
  const navigate = useNavigate();
  const [message, setMessage] = useState({ text: "", type: "" }); 

  const fetchProducts = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/auth/staff/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Failed to load products");
      setLoading(false);
    }
  }, [navigate]);

  // Fetch all products
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open modal for adding new product
  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
    });
    setShowModal(true);
  };

  // Open modal for editing existing product
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category || "",
    });
    setShowModal(true);
  };

  // Submit form (add or update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("No authentication token found. Please log in again.");
      navigate("/login");
      return;
    }

    console.log("Submitting product:", formData);

    try {
      const url = editingProduct
        ? `http://localhost:5000/api/auth/staff/products/${editingProduct.id}`
        : "http://localhost:5000/api/auth/staff/products";

      const method = editingProduct ? "PUT" : "POST";

      console.log(`Making ${method} request to:`, url);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          category: formData.category,
        }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error("Error response:", error);
        throw new Error(error.error || "Failed to save product");
      }

      const result = await response.json();
      console.log("Success response:", result);

      setMessage({ text: "Product updated successfully!", type: "success" });
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      alert(`Failed to save product: ${error.message}`);
    }
  };

  // Delete product
  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/auth/staff/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setMessage({ text: "Product deleted successfully!", type: "success" });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      setMessage({ text: "Failed to delete product.", type: "error" });
    }
  };

  // Add stock to product
  const handleAddStock = async (productId) => {
    const amount = prompt("Enter amount to add to stock:");
    if (!amount || isNaN(amount)) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/auth/staff/products/${productId}/stock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stock: parseInt(amount),
          operation: "add",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update stock");
      }

      setMessage({ text: "Stock updated successfully!", type: "success" });
      fetchProducts();
    } catch (error) {
      console.error("Error updating stock:", error);
      setMessage({ text: "Failed to update stock", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ padding: "2rem" }}>
        <h1>Manage Products</h1>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="page" style={{ padding: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h1>Manage Products</h1>
          <button onClick={handleAddNew} className="btn primary">
            Add New Product
          </button>
        </div>

        {products.length === 0 ? (
          <p>No products found. Add your first product!</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <thead>
                <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Name</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Category</th>
                  <th style={{ padding: "1rem", textAlign: "right" }}>Price</th>
                  <th style={{ padding: "1rem", textAlign: "right" }}>Stock</th>
                  <th style={{ padding: "1rem", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                    <td style={{ padding: "1rem" }}>
                      <strong>{product.name}</strong>
                      {product.description && (
                        <div style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.25rem" }}>
                          {product.description.substring(0, 50)}
                          {product.description.length > 50 ? "..." : ""}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "1rem" }}>{product.category || "General"}</td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>${product.price.toFixed(2)}</td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <span
                        style={{
                          color: product.stock < 10 ? "#dc3545" : "#28a745",
                          fontWeight: "600",
                        }}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <button
                          onClick={() => handleEdit(product)}
                          className="btn"
                          style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleAddStock(product.id)}
                          className="btn primary"
                          style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
                        >
                          + Stock
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="btn"
                          style={{
                            fontSize: "0.85rem",
                            padding: "0.4rem 0.8rem",
                            background: "#dc3545",
                            color: "white",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal for Add/Edit Product */}
        {showModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() => setShowModal(false)}
          >
            <div
              style={{
                background: "white",
                padding: "2rem",
                borderRadius: "8px",
                maxWidth: "500px",
                width: "90%",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}
              >
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                    Product Name <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="auth-input"
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="auth-input"
                    style={{ width: "100%", minHeight: "80px", resize: "vertical" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                      Price ($) <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="auth-input"
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                      Stock <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="auth-input"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="auth-input"
                    style={{ width: "100%" }}
                    placeholder="e.g., Electronics, Food, Clothing"
                  />
                </div>

                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                  <button type="submit" className="btn primary" style={{ flex: 1 }}>
                    {editingProduct ? "Update Product" : "Add Product"}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ flex: 1 }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <Notification message={message} onClear={() => setMessage({ text: "", type: "" })} />
      </div>
    </div>
  );
}
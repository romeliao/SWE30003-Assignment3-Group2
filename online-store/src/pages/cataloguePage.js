import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";

export default function CataloguePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [cartCounts, setCartCounts] = useState({});
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const normalizeCategory = (v) => (v || "").trim().replace(/\s+/g, " ");

  // Get user-specific cart key
  const getCartKey = () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user ? `cart_${user.id}` : "cart_guest";
  };

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
    updateCartCounts();
  }, []);

  // Update cart counts whenever component is focused/visible
  useEffect(() => {
    const handleFocus = () => updateCartCounts();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const updateCartCounts = () => {
    const cartKey = getCartKey();
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const counts = cart.reduce((acc, item) => {
      acc[item.id] = (acc[item.id] || 0) + 1;
      return acc;
    }, {});
    setCartCounts(counts);
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/products");
      
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched products:", data); // Debug log
        setProducts(data);
        const cats = Array.from(
          new Set(
            (data || [])
              .map((p) => normalizeCategory(p.category))
              .filter((c) => c && c.length > 0)
          )
        ).sort((a, b) => a.localeCompare(b));
        setCategories(cats);
      } else {
        console.error("Failed to fetch products, status:", response.status);
        setProducts([]);
        setCategories([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setCategories([]);
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!token || !user) {
      setShowLoginPrompt(true);
      return;
    }

    // Get user-specific cart
    const cartKey = getCartKey();
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const cartCount = cart.filter((item) => item.id === product.id).length;
    
    if (cartCount >= product.originalStock) {
      showToast(`Cannot add more. Only ${product.originalStock} available in stock.`, "error");
      return;
    }

    if (product.stock === 0) {
      showToast(`${product.name} is out of stock.`, "error");
      return;
    }

    cart.push(product);
    localStorage.setItem(cartKey, JSON.stringify(cart));
    
    // Update cart counts to reflect new addition
    updateCartCounts();
    
    showToast(`${product.name} added to cart (${cartCount + 1}/${product.originalStock} available)`);
  };

  // Compute filtered products before any early return to respect hooks rules
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return products;
    const sel = normalizeCategory(selectedCategory);
    return (products || []).filter(
      (p) => normalizeCategory(p.category) === sel
    );
  }, [products, selectedCategory]);

  // Adjust products to show remaining stock (total stock - items in cart)
  const productsWithAdjustedStock = useMemo(() => {
    return filteredProducts.map((product) => ({
      ...product,
      originalStock: product.stock,
      stock: Math.max(0, product.stock - (cartCounts[product.id] || 0)),
      inCart: cartCounts[product.id] || 0
    }));
  }, [filteredProducts, cartCounts]);

  if (loading) {
    return (
      <div className="page">
        <h1>Product Catalogue</h1>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Product Catalogue</h1>
      {/* Filter bar */}
      {categories.length > 0 && (
        <div className="filters" role="tablist" aria-label="Category filters">
          <button
            className={`filter ${selectedCategory === "All" ? "active" : ""}`}
            onClick={() => setSelectedCategory("All")}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
      {products.length === 0 ? (
        <p>No products available at the moment.</p>
      ) : (
        <div className="grid">
          {productsWithAdjustedStock.map((p) => (
            <ProductCard key={p.id} product={p} addToCart={addToCart} />
          ))}
        </div>
      )}

      {/* Login required modal */}
      {showLoginPrompt && (
        <div className="modal-overlay" onClick={() => setShowLoginPrompt(false)}>
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="login-modal-title" style={{ marginTop: 0 }}>Login required</h3>
            <p style={{ margin: "8px 0 16px", color: "#2b3a67" }}>
              You need to be logged in to add items to your cart.
            </p>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowLoginPrompt(false)}>
                Cancel
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  setShowLoginPrompt(false);
                  navigate("/login");
                }}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

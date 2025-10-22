import React, { useState, useEffect, useMemo } from "react";
import ProductCard from "../components/ProductCard";

export default function CataloguePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const normalizeCategory = (v) => (v || "").trim().replace(/\s+/g, " ");

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

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
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${product.name} added to cart`);
  };

  // Compute filtered products before any early return to respect hooks rules
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return products;
    const sel = normalizeCategory(selectedCategory);
    return (products || []).filter(
      (p) => normalizeCategory(p.category) === sel
    );
  }, [products, selectedCategory]);

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
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} addToCart={addToCart} />
          ))}
        </div>
      )}
    </div>
  );
}

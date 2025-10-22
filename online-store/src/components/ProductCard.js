import React from "react";

export default function ProductCard({ product, addToCart }) {
  const isOutOfStock = product.stock === 0;

  return (
    <div className="card">
      <h3>{product.name}</h3>
      <p style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#2b3a67" }}>
        ${product.price.toFixed(2)}
      </p>
      <p style={{ 
        fontSize: "0.9rem", 
        color: isOutOfStock ? "#dc3545" : product.stock < 10 ? "#ff9800" : "#28a745",
        fontWeight: "600",
        marginBottom: "0.5rem"
      }}>
        {isOutOfStock ? "Out of Stock" : `Stock: ${product.stock}`}
      </p>
      <button 
        onClick={() => addToCart(product)} 
        disabled={isOutOfStock}
        style={{
          opacity: isOutOfStock ? 0.5 : 1,
          cursor: isOutOfStock ? "not-allowed" : "pointer",
          backgroundColor: isOutOfStock ? "#6c757d" : "#2b3a67"
        }}
      >
        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );
}

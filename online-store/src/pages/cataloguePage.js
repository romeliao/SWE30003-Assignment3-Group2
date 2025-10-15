import React, { useState } from "react";
import ProductCard from "../components/ProductCard";

export default function CataloguePage() {
  const [products] = useState([
    { id: 1, name: "Apple", price: 2.5 },
    { id: 2, name: "Milk", price: 3.2 },
    { id: 3, name: "Bread", price: 2.0 },
  ]);

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${product.name} added to cart`);
  };

  return (
    <div className="page">
      <h1>Product Catalogue</h1>
      <div className="grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} addToCart={addToCart} />
        ))}
      </div>
    </div>
  );
}

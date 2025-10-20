import React, { useState, useEffect } from "react";
import CartItem from "../components/cartItem";

export default function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  const handleRemove = (id) => {
    const updated = cart.filter((i) => i.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const handleQuantityChange = (id, qty) => {
    const updated = cart.map((i) =>
      i.id === id ? { ...i, quantity: +qty } : i
    );
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const handleClearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="cart">
      <h2>Your Cart</h2>
      {cart.length ? (
        <>
          {cart.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onRemove={handleRemove}
              onQuantityChange={handleQuantityChange}
            />
          ))}
          <h3>Total: ${total}</h3>
          
          <div className="cart-actions">
            <button className="clear-cart-btn" onClick={handleClearCart}>
              Clear Cart
            </button>
            <button className="checkout-btn" onClick={() => alert("Checkout functionality coming soon!")}>
              Proceed to Checkout
            </button>
          </div>
        </>
      ) : (
        <p>Your cart is empty.</p>
      )}

    </div>
  );
}
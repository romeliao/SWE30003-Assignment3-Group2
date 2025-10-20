import React, { useState } from "react";
import CartItem from "../components/cartItem";

export default function Cart() {
  const [cart, setCart] = useState([
    { id: 1, name: "Bread", price: 20, quantity: 1, image: "/img/itemA.jpg" },
    { id: 2, name: "Milk", price: 15, quantity: 2, image: "/img/itemB.jpg" },
  ]);

  const handleRemove = (id) => setCart(cart.filter((i) => i.id !== id));

  const handleQuantityChange = (id, qty) =>
    setCart(cart.map((i) => (i.id === id ? { ...i, quantity: +qty } : i)));

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
        </>
      ) : (
        <p>Your cart is empty.</p>
      )}
    </div>
  );
}
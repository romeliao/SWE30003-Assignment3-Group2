import React from "react";

export default function CartItem({ item, onRemove, onQuantityChange }) {
  return (
    <div className="cart-item">
      <div className="details">
        <h4>{item.name}</h4>
        <p>${item.price}</p>
        <input
          type="number"
          value={item.quantity}
          min="1"
          onChange={(e) => onQuantityChange(item.id, e.target.value)}
        />
        <button onClick={() => onRemove(item.id)}>Remove</button>
      </div>
    </div>
  );
}
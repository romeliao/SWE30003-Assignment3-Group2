import React from "react";

export default function CartItem({ item, onRemove, onQuantityChange }) {
  return (
    <div className="cart-item">
      <div className="cart-item-info">
        <h4>{item.name}</h4>
        <p>${item.price.toFixed(2)}</p>
      </div>

      <div className="cart-item-actions">
        <button onClick={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}>−</button>
        <span>{item.quantity}</span>
        <button onClick={() => onQuantityChange(item.id, item.quantity + 1)}>+</button>
        <button className="remove-btn" onClick={() => onRemove(item.id)}>Remove</button>
      </div>
    </div>
  );
}

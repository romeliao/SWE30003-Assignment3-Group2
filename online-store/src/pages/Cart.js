import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const navigate = useNavigate();

  // Get current user
  const getUser = () => {
    return JSON.parse(localStorage.getItem("user"));
  };

  // Get user-specific cart key
  const getCartKey = () => {
    const user = getUser();
    return user ? `cart_${user.id}` : "cart_guest";
  };

  // Load cart from localStorage on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const cartKey = getCartKey();
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    // Group items by ID and add quantity
    const grouped = cart.reduce((acc, item) => {
      const existing = acc.find((i) => i.id === item.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        acc.push({ ...item, quantity: 1 });
      }
      return acc;
    }, []);
    setCartItems(grouped);
  };

  const saveCart = (items) => {
    const cartKey = getCartKey();
    // Flatten back to array for localStorage
    const flatCart = items.flatMap((item) =>
      Array(item.quantity).fill({ ...item, quantity: undefined })
    );
    localStorage.setItem(cartKey, JSON.stringify(flatCart));
    setCartItems(items);
  };

  const updateQuantity = (productId, delta) => {
    const updated = cartItems.map((item) => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        
        // Prevent going below 0
        if (newQty < 0) return item;
        
        // Check stock limit when increasing
        if (delta > 0 && newQty > item.stock) {
          alert(`Cannot add more. Only ${item.stock} available in stock.`);
          return item;
        }
        
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter((item) => item.quantity > 0);
    saveCart(updated);
  };

  const removeItem = (productId) => {
    const updated = cartItems.filter((item) => item.id !== productId);
    saveCart(updated);
  };

  const clearCart = () => {
    const cartKey = getCartKey();
    localStorage.removeItem(cartKey);
    setCartItems([]);
    setShowClearConfirm(false);
};

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    navigate("/payment");
  };

  if (cartItems.length === 0) {
    return (
      <div className="page" style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Shopping Cart</h1>
        <p style={{ margin: "2rem 0", color: "#666" }}>Your cart is empty.</p>
        <button className="btn primary" onClick={() => navigate("/catalogue")}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="page" style={{ padding: "2rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h1>Shopping Cart</h1>
          
          <button
            className="btn"
            style={{ background: "#dc3545", color: "white" }}
            onClick={() => setShowClearConfirm(true)}
          >
            Clear Cart
          </button>

          {showClearConfirm && (
            <div className="confirm-overlay">
              <div className="confirm-box">
                <p>Are you sure you want to clear your entire cart?</p>
                <div className="confirm-buttons">
                  <button className="confirm-yes" onClick={clearCart}>Yes, clear it</button>
                  <button className="confirm-no" onClick={() => setShowClearConfirm(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                {item.description && (
                  <p className="cart-item-description">{item.description}</p>
                )}
                <p className="cart-item-price">${item.price.toFixed(2)} each</p>
              </div>

              <div className="cart-item-actions">
                <div className="quantity-control">
                  <button
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, -1)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, 1)}
                    disabled={item.quantity >= item.stock}
                    style={{
                      opacity: item.quantity >= item.stock ? 0.5 : 1,
                      cursor: item.quantity >= item.stock ? "not-allowed" : "pointer"
                    }}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-subtotal">
                  ${(item.price * item.quantity).toFixed(2)}
                  <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "2px" }}>
                    {item.quantity >= item.stock ? "Max stock" : `${item.stock - item.quantity} more available`}
                  </div>
                </div>

                <button
                  className="btn-remove"
                  aria-label="Remove item"
                  onClick={() => setItemToDelete(item)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {itemToDelete && (
          <div className="confirm-overlay">
            <div className="confirm-box">
              <p>Remove "{itemToDelete.name}" from your cart?</p>
              <div className="confirm-buttons">
                <button
                  className="confirm-yes"
                  onClick={() => {
                    removeItem(itemToDelete.id);
                    setItemToDelete(null);
                  }}
                >
                  Yes, remove
                </button>
                <button
                  className="confirm-no"
                  onClick={() => setItemToDelete(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="cart-summary">
          <div className="cart-total">
            <span className="cart-total-label">Total:</span>
            <span className="cart-total-amount">${calculateTotal().toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button className="btn" onClick={() => navigate("/catalogue")} style={{ flex: 1 }}>
              Continue Shopping
            </button>
            <button className="btn primary" onClick={handleCheckout} style={{ flex: 1 }}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
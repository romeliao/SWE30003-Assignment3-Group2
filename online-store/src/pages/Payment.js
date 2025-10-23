import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Payment() {
  const [cartItems, setCartItems] = useState([]);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    billingAddress: "",
    city: "",
    zipCode: "",
  });
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  // Get user-specific cart key
  const getCartKey = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user ? `cart_${user.id}` : "cart_guest";
  };

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const cartKey = getCartKey();
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    
    if (cart.length === 0) {
      navigate("/cart");
      return;
    }

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

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in to place an order.");
        navigate("/login");
        return;
      }

      // Prepare order data
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: `${paymentForm.billingAddress}, ${paymentForm.city}, ${paymentForm.zipCode}`,
        paymentMethod: "Credit Card",
      };

      // Create order via backend
      const response = await fetch("http://localhost:5000/api/auth/customer/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create order");
      }

      const result = await response.json();

      // Clear the cart after successful order
      const cartKey = getCartKey();
      localStorage.removeItem(cartKey);

      // Navigate to orders page
      alert("Order placed successfully! Your order is being processed.");
      navigate("/orders");
    } catch (error) {
      console.error("Payment error:", error);
      alert(`Payment failed: ${error.message}`);
      setProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="page" style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Payment</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page" style={{ padding: "2rem" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h1>Checkout</h1>

        <div className="payment-container">
          {/* Order Summary */}
          <div className="order-summary-section">
            <h2>Order Summary</h2>
            <div className="order-items">
              {cartItems.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="order-item-details">
                    <h4>{item.name}</h4>
                    <p className="order-item-qty">Quantity: {item.quantity}</p>
                  </div>
                  <div className="order-item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-total">
              <div className="order-total-row">
                <span>Subtotal:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="order-total-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="order-total-row order-total-final">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="payment-form-section">
            <h2>Payment Information</h2>
            <form onSubmit={handlePlaceOrder} className="payment-form">
              <div className="form-group">
                <label>Cardholder Name *</label>
                <input
                  type="text"
                  name="cardName"
                  value={paymentForm.cardName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                  className="auth-input"
                />
              </div>

              <div className="form-group">
                <label>Card Number *</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={paymentForm.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                  className="auth-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={paymentForm.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                    className="auth-input"
                  />
                </div>
                <div className="form-group">
                  <label>CVV *</label>
                  <input
                    type="text"
                    name="cvv"
                    value={paymentForm.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength="4"
                    required
                    className="auth-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Billing Address *</label>
                <input
                  type="text"
                  name="billingAddress"
                  value={paymentForm.billingAddress}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                  required
                  className="auth-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={paymentForm.city}
                    onChange={handleInputChange}
                    placeholder="Melbourne"
                    required
                    className="auth-input"
                  />
                </div>
                <div className="form-group">
                  <label>Zip Code *</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={paymentForm.zipCode}
                    onChange={handleInputChange}
                    placeholder="3000"
                    required
                    className="auth-input"
                  />
                </div>
              </div>

              <div className="payment-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => navigate("/cart")}
                  disabled={processing}
                >
                  Back to Cart
                </button>
                <button
                  type="submit"
                  className="btn primary"
                  disabled={processing}
                  style={{
                    opacity: processing ? 0.7 : 1,
                    cursor: processing ? "not-allowed" : "pointer",
                  }}
                >
                  {processing ? "Processing..." : "Place Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

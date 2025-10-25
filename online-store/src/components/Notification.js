import React, { useEffect, useState } from "react";

export default function Notification({ message, onClear }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message?.text) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onClear?.(), 300); // clear after fade-out
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClear]);

  if (!message?.text) return null;

  const isSuccess = message.type === "success";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 9999,
        minWidth: "250px",
        padding: "0.75rem 1rem",
        borderRadius: "6px",
        border: `1px solid ${isSuccess ? "#c3e6cb" : "#f5c6cb"}`,
        background: isSuccess ? "#d4edda" : "#f8d7da",
        color: isSuccess ? "#155724" : "#721c24",
        fontSize: "0.9rem",
        boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.3s ease",
      }}
    >
      {message.text}
    </div>
  );
}

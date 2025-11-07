import React from "react";

export default function DetailsModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          width: "400px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={item.image}
          alt={item.title}
          style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px" }}
        />
        <h2>{item.title}</h2>
        <p>{item.subtitle}</p>
        <p style={{ color: "#1d4ed8", fontWeight: "bold" }}>Price: ₹{item.price}</p>
        <p>{item.description}</p>

        <button
          onClick={onClose}
          style={{
            marginTop: "12px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

import React from "react";

export default function PlaceCard({ image, title, subtitle, price, onBook }) {
  return (
    <div
      style={{
        width: "260px",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        overflow: "hidden",
        margin: "8px",
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <img src={image} alt={title} style={{ width: "100%", height: "150px", objectFit: "cover" }} />
      <div style={{ padding: "12px" }}>
        <h3 style={{ margin: "0 0 4px", fontSize: "18px" }}>{title}</h3>
        <p style={{ margin: "0 0 8px", color: "#64748b" }}>{subtitle}</p>
        {price && <p style={{ color: "#1d4ed8", fontWeight: "bold" }}>₹{price}</p>}
        <button
          onClick={onBook}
          style={{
            marginTop: "8px",
            width: "100%",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "8px 0",
            cursor: "pointer",
          }}
        >
          Book Now
        </button>
      </div>
    </div>
  );
}

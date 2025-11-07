import React from "react";

export default function CategoryNav({ active, onSelect }) {
  const categories = ["Hotels", "Restaurants", "Flights", "Attractions", "Offers"];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",   // ✅ centers the buttons
        alignItems: "center",
        gap: "16px",                // ✅ spacing between buttons
        padding: "16px 0",
        borderBottom: "1px solid #e5e7eb", // subtle underline
      }}
    >
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          style={{
            background: "transparent",     // ✅ no background
            border: "none",
            fontSize: "16px",
            fontWeight: active === cat ? "700" : "500",
            color: active === cat ? "#2563eb" : "#1e293b", // blue for active, gray otherwise
            cursor: "pointer",
            padding: "8px 12px",
            borderBottom: active === cat ? "2px solid #2563eb" : "2px solid transparent",
            transition: "all 0.2s ease-in-out",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#2563eb")}
          onMouseLeave={(e) => (e.target.style.color = active === cat ? "#2563eb" : "#1e293b")}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

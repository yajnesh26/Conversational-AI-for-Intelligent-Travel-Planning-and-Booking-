import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();

  const navStyle = {
    padding: "12px 20px",
    background: "#2563eb",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const linkStyle = (path) => ({
    color: location.pathname === path ? "#facc15" : "white", // highlights active link
    marginRight: 16,
    textDecoration: "none",
    fontWeight: location.pathname === path ? "bold" : "normal",
  });

  return (
    <div>
      {/* 🧭 Navbar */}
      <nav style={navStyle}>
        <h2 style={{ margin: 0 }}>🌍 Travel AI</h2>
        <div>
          <Link to="/" style={linkStyle("/")}>
            Home
          </Link>
          <Link to="/chat" style={linkStyle("/chat")}>
            Chat
          </Link>
          <Link to="/profile" style={linkStyle("/profile")}>
            Profile
          </Link>
          <Link to="/login" style={linkStyle("/login")}>
            Login
          </Link>
        </div>
      </nav>

      {/* 👇 Page content renders here */}
      <main style={{ padding: "20px" }}>
        <Outlet />
      </main>
    </div>
  );
}

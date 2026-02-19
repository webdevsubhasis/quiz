import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/navbar.css";

export default function Topbar({ title }) {
  const navigate = useNavigate();

  // ✅ Read admin email directly
  const adminEmail = localStorage.getItem("admin_email");

  const logout = () => {
    // 🔐 Clear all admin auth data
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_token_expiry");
    localStorage.removeItem("admin_email");
    localStorage.removeItem("admin_remember");

    navigate("/login", { replace: true });
  };

  return (
    <header className="topbar">
      {/* LEFT */}
      <div className="topbar-left">
        <h3>{title}</h3>
      </div>

      {/* RIGHT */}
      <div className="topbar-right">
        <div className="topbar-user">
          <span className="user-dot" />
          {adminEmail || "Admin"}
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}

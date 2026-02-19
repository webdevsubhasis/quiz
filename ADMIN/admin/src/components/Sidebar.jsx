import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/admin/login");
  };

  return (
    <aside className="sidebar">
      {/* ================= BRAND ================= */}
      <div className="brand">
        <div className="logo">SM</div>
        <div className="brand-name">Quiz Admin</div>
      </div>

      {/* ================= NAV ================= */}
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
          📊 Dashboard
        </NavLink>

        <NavLink to="/subjects" className={({ isActive }) => isActive ? "active" : ""}>
          📚 Subjects
        </NavLink>

        <NavLink to="/questions" className={({ isActive }) => isActive ? "active" : ""}>
          ❓ Questions
        </NavLink>

        <NavLink to="/users" className={({ isActive }) => isActive ? "active" : ""}>
          👥 Users
        </NavLink>

        <NavLink to="/settings" className={({ isActive }) => isActive ? "active" : ""}>
          ⚙️ Settings
        </NavLink>
      </nav>

      {/* ================= LOGOUT ================= */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}

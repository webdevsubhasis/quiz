import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Header.css";
import { logout } from "../utils/auth";

export default function Header({ onSearch }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const token =
    localStorage.getItem("user_token") || sessionStorage.getItem("user_token");

  const email =
    localStorage.getItem("user_email") || sessionStorage.getItem("user_email");

  return (
    <header className="quiz-header">
      <div className="header-container">
        {/* LOGO */}
        <NavLink to="/" className="logo">
          <img src="/logo.png" alt="SM Quiz App" className="logo-img" />
          <span className="logo-text">QUIZ APP</span>
        </NavLink>

        {/* 🔍 LIVE SEARCH */}
        <div className="header-search">
          <input
            type="text"
            placeholder="Search subject..."
            value={query}
            onChange={(e) => {
              const value = e.target.value;
              setQuery(value);
              if (onSearch) onSearch(value); // 🔥 LIVE SEARCH
            }}
          />
        </div>

        {/* RIGHT ACTIONS */}
        <div className="nav-links">
          {token && (
            <div className="user-email" title={email}>
              {email}
            </div>
          )}

          {token ? (
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          ) : (
            <button onClick={() => navigate("/login")} className="login-btn">
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

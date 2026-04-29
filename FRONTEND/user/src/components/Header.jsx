import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { searchAll } from "../services/search.service";
import { logout } from "../utils/auth";

export default function Header({ onCategorySelect }) {
  const navigate = useNavigate();
  const ref = useRef();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ subjects: [], categories: [] });
  const [show, setShow] = useState(false);

  const token =
    localStorage.getItem("user_token") ||
    sessionStorage.getItem("user_token");

  const email =
    localStorage.getItem("user_email") ||
    sessionStorage.getItem("user_email");

  /* ================= SEARCH ================= */
  useEffect(() => {
    if (!query) {
      setResults({ subjects: [], categories: [] });
      return;
    }

    const t = setTimeout(async () => {
      try {
        const data = await searchAll(query);
        setResults(data);
        setShow(true);
      } catch (err) {
        console.error(err);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [query]);

  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShow(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-blue-950/70 border-b border-white/10 shadow-md">

      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between relative">

        {/* ================= LEFT ================= */}
        <div className="flex items-center gap-2 z-10">
          <NavLink
            to="/"
            className="flex items-center gap-2 text-white font-semibold text-sm"
          >
            <img src="/logo.png" className="h-7 w-7" />
            <span className="hidden sm:block">QUIZ</span>
          </NavLink>
        </div>

        {/* ================= CENTER SEARCH ================= */}
        <div
          ref={ref}
          className="
        absolute left-1/2 -translate-x-1/2 
        w-[60%] max-w-xl
      "
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShow(true)}
            placeholder="Search subjects or categories..."
            className="
          w-full px-4 pr-10 py-2 text-sm rounded-full 
          bg-white/5 border border-white/10 
          text-white placeholder:text-slate-400 
          outline-none focus:bg-white/10 focus:border-indigo-400
        "
          />

          {/* CLEAR BUTTON */}
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setShow(false);
              }}
              className="
            absolute right-2 top-1/2 -translate-y-1/2 
            h-6 w-6 flex items-center justify-center 
            rounded-full 
            text-slate-400 hover:text-white 
            hover:bg-white/10 
            transition
          "
            >
              ✕
            </button>
          )}

          {/* DROPDOWN */}
          {show && query && (
            <div className="absolute mt-2 w-full bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl p-2 z-50">

              {results.subjects.map((s) => (
                <div
                  key={s._id}
                  onClick={() => {
                    navigate(`/subject/${s._id}`);
                    setShow(false);
                  }}
                  className="px-3 py-2 rounded hover:bg-white/10 text-sm flex justify-between cursor-pointer"
                >
                  <span>{s.displayName}</span>
                  <span className="text-xs text-slate-400">
                    {s.categoryId?.displayName}
                  </span>
                </div>
              ))}

              {results.categories.map((c) => (
                <div
                  key={c._id}
                  onClick={() => {
                    setShow(false);
                    setQuery("");

                    onCategorySelect?.(c); // ✅ THIS IS THE FIX
                  }}
                  className="px-3 py-2 rounded hover:bg-white/10 text-sm cursor-pointer"
                >
                  {c.displayName}
                </div>
              ))}

              {results.subjects.length === 0 &&
                results.categories.length === 0 && (
                  <div className="text-center text-slate-400 text-sm py-3">
                    No results found
                  </div>
                )}
            </div>
          )}
        </div>

        {/* ================= RIGHT ================= */}
        <div className="flex items-center gap-3 z-10">

          {token && (
            <div className="hidden sm:block text-xs text-white/70 max-w-[140px] truncate">
              {email}
            </div>
          )}

          {token ? (
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-3 py-1.5 rounded-full bg-white text-black text-xs"
            >
              Login
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
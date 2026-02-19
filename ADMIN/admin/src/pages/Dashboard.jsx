import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";
import { getAdminActivity } from "../services/activityApi";

export default function Dashboard() {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [stats, setStats] = useState({
    subjects: 0,
    questions: 0,
    users: 0,
    results: 0,
  });

  const [activities, setActivities] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const expiry = localStorage.getItem("admin_token_expiry");

    if (!token || !expiry || Date.now() > Number(expiry)) {
      localStorage.clear();
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  /* ================= GREETING ================= */
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning ☀️";
    if (hour >= 12 && hour < 16) return "Good Afternoon 🌤️";
    if (hour >= 16 && hour < 21) return "Good Evening 🌙";
    return "Good Night 🌙";
  };

  /* ================= LOAD STATS ================= */
  const loadStats = async () => {
    try {
      const token = localStorage.getItem("admin_token");

      const res = await fetch("http://127.0.0.1:8081/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      setStats({
        subjects: data.subjects ?? 0,
        questions: data.questions ?? 0,
        users: data.users ?? 0,
        results: data.results ?? 0,
      });
    } catch (err) {
      console.error("Stats error:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  /* ================= LOAD ACTIVITY ================= */
  const loadActivity = async () => {
    try {
      setLoadingActivity(true);
      const data = await getAdminActivity();

      if (Array.isArray(data)) {
        setActivities(data);
      }
    } catch (err) {
      console.error("Activity error:", err);
    } finally {
      setLoadingActivity(false);
    }
  };

  /* ================= INIT + AUTO REFRESH ================= */
  useEffect(() => {
    loadStats();
    loadActivity();

    const interval = setInterval(loadActivity, 30000); // every 30s
    return () => clearInterval(interval);
  }, []);

  /* ================= UI ================= */
  return (
    <div className="layout">
      <Sidebar />

      <main className="main">
        <Topbar title="Dashboard" />

        <div className="content dashboard-content">
          {/* Greeting */}
          <div className="welcome-box">
            <h2>{getGreeting()}, Admin 👋</h2>
            <p>Here is the summary of your quiz system.</p>
          </div>

          {/* Stats */}
          <div className="cards-grid">
            {["Subjects", "Questions", "Users", "Results"].map((title, i) => (
              <div key={title} className="widget card-admin pop">
                <div className="w-title">{title}</div>
                <div className="w-value">
                  {loadingStats ? "..." : Object.values(stats)[i]}
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="card-admin mt-3 fade-in">
            <h4 className="activity-title">Recent Activity</h4>

            <div className="timeline">
              {loadingActivity && (
                <p className="muted">Loading activity...</p>
              )}

              {!loadingActivity && activities.length === 0 && (
                <p className="muted">No recent activity</p>
              )}

              {!loadingActivity &&
                activities.map((item) => (
                  <div className="timeline-item" key={item._id}>
                    <span className="dot"></span>
                    <p>{item.message}</p>
                    <small className="time">
                      {new Date(item.createdAt).toLocaleString()}
                    </small>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

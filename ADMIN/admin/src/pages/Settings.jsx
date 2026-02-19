import React, { useState } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import "../styles/settings.css";

export default function Settings() {
  const [profile, setProfile] = useState({
    name: "Admin",
    email: "test@gmail.com",
  });

  const [password, setPassword] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const [system, setSystem] = useState({
    quizTimer: true,
    negativeMarking: false,
    showResult: true,
  });

  const handleSave = () => {
    alert("Settings saved successfully ✅");
  };

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-main">
        <Topbar />

        <div className="settings-page">
          <h2 className="page-title">⚙️ Settings</h2>
          <p className="page-subtitle">
            Manage your admin profile and quiz system preferences
          </p>

          {/* PROFILE SETTINGS */}
          <div className="settings-card">
            <h3>👤 Admin Profile</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Admin Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* PASSWORD SETTINGS */}
          <div className="settings-card">
            <h3>🔐 Change Password</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={password.current}
                  onChange={(e) =>
                    setPassword({ ...password, current: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={password.newPass}
                  onChange={(e) =>
                    setPassword({ ...password, newPass: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={password.confirm}
                  onChange={(e) =>
                    setPassword({ ...password, confirm: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* SYSTEM SETTINGS */}
          <div className="settings-card">
            <h3>🧠 Quiz System Settings</h3>

            <div className="toggle-group">
              <label>
                <input
                  type="checkbox"
                  checked={system.quizTimer}
                  onChange={() =>
                    setSystem({ ...system, quizTimer: !system.quizTimer })
                  }
                />
                Enable Quiz Timer
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={system.negativeMarking}
                  onChange={() =>
                    setSystem({
                      ...system,
                      negativeMarking: !system.negativeMarking,
                    })
                  }
                />
                Enable Negative Marking
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={system.showResult}
                  onChange={() =>
                    setSystem({ ...system, showResult: !system.showResult })
                  }
                />
                Show Result After Exam
              </label>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="settings-actions">
            <button className="btn-secondary">Reset</button>
            <button className="btn-primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

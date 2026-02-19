import React, { useState } from "react";
import "../styles/users.css";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";

const USERS_DATA = [
  {
    id: 1,
    name: "Rahul Das",
    email: "rahul@gmail.com",
    phone: "9876543210",
    status: "Active",
    exams: 5,
    score: 82,
    lastExam: "02 Jan 2026",
  },
  {
    id: 2,
    name: "Anita Roy",
    email: "anita@gmail.com",
    phone: "9123456789",
    status: "Inactive",
    exams: 2,
    score: 45,
    lastExam: "29 Dec 2025",
  },
  {
    id: 3,
    name: "Sourav Paul",
    email: "sourav@gmail.com",
    phone: "9988776655",
    status: "Active",
    exams: 8,
    score: 91,
    lastExam: "03 Jan 2026",
  },
];

export default function Users() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = USERS_DATA.filter((u) =>
    `${u.name} ${u.email} ${u.phone}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="layout">
      <Sidebar />

      <main className="main">
        <Topbar title="Users" />

        <div className="content users-page">
          {/* HEADER */}
          <div className="users-header">
            <div className="users-title">
              <h2>Users</h2>
              <p>Manage quiz participants and performance</p>
            </div>

            <div className="users-actions">
              <input
                className="search-input"
                placeholder="Search name, email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="users-count">
                {filteredUsers.length} Users
              </span>
            </div>
          </div>

          {/* TABLE CARD */}
          <div className="users-card">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Exams</th>
                  <th>Score</th>
                  <th>Last Exam</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No users found
                    </td>
                  </tr>
                )}

                {filteredUsers.map((u) => (
                  <tr key={u.id} className="user-row">
                    <td>
                      <div className="user-info">
                        <div className="avatar">{u.name[0]}</div>
                        <div>
                          <div className="user-name">{u.name}</div>
                          <div className="user-email">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td>{u.phone}</td>

                    <td>
                      <span
                        className={`status-pill ${u.status.toLowerCase()}`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td>{u.exams}</td>

                    <td>
                      <div className="score-wrap">
                        <div className="score-bar">
                          <span style={{ width: `${u.score}%` }} />
                        </div>
                        <span className="score-text">{u.score}%</span>
                      </div>
                    </td>

                    <td className="muted">{u.lastExam}</td>

                    <td>
                      <button
                        className="view-btn"
                        onClick={() => setSelectedUser(u)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MODAL */}
          {selectedUser && (
            <div
              className="modal-overlay"
              onClick={() => setSelectedUser(null)}
            >
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3>User Details</h3>

                {[
                  ["Name", selectedUser.name],
                  ["Email", selectedUser.email],
                  ["Phone", selectedUser.phone],
                  ["Status", selectedUser.status],
                  ["Exams Attempted", selectedUser.exams],
                  ["Last Exam", selectedUser.lastExam],
                  ["Score", `${selectedUser.score}%`],
                ].map(([k, v]) => (
                  <div className="modal-row" key={k}>
                    <span>{k}</span>
                    <b>{v}</b>
                  </div>
                ))}

                <button
                  className="close-btn"
                  onClick={() => setSelectedUser(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

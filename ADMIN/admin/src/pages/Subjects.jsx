import React, { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import "../styles/subject.css";

const LIMIT = 8;

export default function Subjects() {
  const navigate = useNavigate();
  const location = useLocation();

  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 DELETE MODAL STATE
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const token =
    localStorage.getItem("admin_token") ||
    sessionStorage.getItem("admin_token");

  /* ===============================
     🔐 AUTH GUARD
  =============================== */
  useEffect(() => {
    if (!token) {
      toast.error("Session expired. Please login again.");
      navigate("/admin/login", { replace: true });
    }
  }, [token, navigate]);

  /* ===============================
     📥 LOAD SUBJECTS
  =============================== */
  const loadSubjects = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `https://quiz-backend-gamma.vercel.app/api/admin/subjects?page=${page}&limit=${LIMIT}&search=${encodeURIComponent(
          search
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load subjects");
      }

      setList(data.subjects || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error(err.message || "Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  
  }, [page, search, location.state?.refresh]);

  /* ===============================
     🗑 DELETE SUBJECT
  =============================== */
  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(
        `https://quiz-backend-gamma.vercel.app/api/admin/subjects/${deleteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Delete failed");
      }

      toast.success("Subject deleted successfully");

      setShowDelete(false);
      setDeleteId(null);

      // 🔥 RESET PAGE IF NEEDED
      if (list.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        loadSubjects();
      }
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  };

  /* ===============================
     🎨 UI
  =============================== */
  return (
    <div className="layout">
      <Sidebar />

      <main className="main">
        <Topbar title="Subjects" />

        <div className="content">
          <div className="card-admin">
            {/* ===== HEADER ===== */}
            <div className="subject-header">
              <h5>Subject Lists</h5>

              <input
                className="subject-search"
                placeholder="Search subject..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />

              <button
                className="btn btn-primary"
                onClick={() => navigate("/subjects/add")}
              >
                Add Subject
              </button>
            </div>

            {/* ===== LIST ===== */}
            {loading ? (
              <p className="text-center muted">Loading...</p>
            ) : list.length === 0 ? (
              <p className="text-center muted">No subjects found</p>
            ) : (
              list.map((s) => (
                <div key={s._id} className="list-row">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800 }}>
                      {(s.name || s.displayName || "").toUpperCase()}
                    </div>
                    <div className="muted">
                      {s.description || "No description"}
                    </div>
                  </div>

                  <div>
                    <button
                      className="btn btn-outline-secondary btn-sm me-2"
                      onClick={() =>
                        navigate(`/subjects/edit/${s._id}`)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        setDeleteId(s._id);
                        setShowDelete(true);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* ===== PAGINATION ===== */}
            {totalPages > 1 && (
              <div className="pagination-bar">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Prev
                </button>

                <span>
                  Page {page} / {totalPages}
                </span>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ===== DELETE MODAL ===== */}
      {showDelete && (
        <div className="modal-overlay">
          <div className="modal-box premium-plus">
            <div className="modal-icon-wrap">
              <div className="modal-icon">⚠️</div>
            </div>

            <h4 className="modal-title">Delete Subject?</h4>

            <p className="modal-text">
              All related questions will also be removed.
            </p>

            <p className="danger-text">
              This action cannot be undone.
            </p>

            <div className="modal-actions">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setShowDelete(false);
                  setDeleteId(null);
                }}
              >
                Cancel
              </button>

              <button
                className="btn btn-danger premium-delete"
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

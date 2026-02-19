import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import { getJSON, del } from "../services/authApi";
import toast from "react-hot-toast";
import "../styles/question.css";

/* ================= HELPERS ================= */

const toTitleCase = (str = "") =>
  str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const truncate = (text = "", max = 20) =>
  text.length > max ? text.slice(0, max) + "..." : text;

/* ✅ Capitalize FIRST letter only */
const capitalizeFirst = (text = "") =>
  text ? text.charAt(0).toUpperCase() + text.slice(1) : "";

/* 🔥 SMART PAGINATION */
const getPageNumbers = (current, total, range = 2) => {
  const pages = [];
  const start = Math.max(1, current - range);
  const end = Math.min(total, current + range);

  if (start > 1) pages.push(1);
  if (start > 2) pages.push("...");

  for (let i = start; i <= end; i++) pages.push(i);

  if (end < total - 1) pages.push("...");
  if (end < total) pages.push(total);

  return pages;
};

export default function Questions() {
  const navigate = useNavigate();
  const location = useLocation();

  /* ================= STATE ================= */
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [search, setSearch] = useState("");
  const [subjectId, setSubjectId] = useState("all");

  const [page, setPage] = useState(1);
  const [jumpPage, setJumpPage] = useState("");
  const limit = 10;

  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  /* 🔥 DELETE MODAL STATE */
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const searchRef = useRef(null);

  /* ================= KEYBOARD UX ================= */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "/" && searchRef.current) {
        e.preventDefault();
        searchRef.current.focus();
      }
      if (e.key === "Escape") {
        setSearch("");
        setShowDelete(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ================= FETCH SUBJECTS ================= */
  const loadSubjects = async () => {
    try {
      const res = await getJSON("/admin/subjects?limit=all");
      if (res?.subjects) setSubjects(res.subjects);
    } catch {
      toast.error("Failed to load subjects");
    }
  };

  /* ================= FETCH QUESTIONS ================= */
  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await getJSON(
        `/admin/questions?page=${page}&limit=${limit}&search=${search}&subjectId=${subjectId}`
      );
      setQuestions(res.questions || []);
      setTotalPages(res.totalPages || 1);
    } catch {
      toast.error("Failed to load questions");
    }
    setLoading(false);
  };

  /* ================= INITIAL + REFRESH LOAD ================= */
  useEffect(() => {
    loadSubjects();
  }, [location.state?.refresh]); // 🔥 refresh after subject edit/add/delete

  useEffect(() => {
    loadQuestions();
  }, [page, search, subjectId, location.state?.refresh]);

  /* ================= IMPORT JSON ================= */
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      toast.error("Only JSON files are supported");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        "http://127.0.0.1:8081/api/admin/questions/import",
        { method: "POST", body: formData }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Import failed");
        return;
      }

      toast.success(
        `${data.inserted} imported, ${data.duplicates} duplicates`
      );
      loadQuestions();
    } catch {
      toast.error("Server error during import");
    }

    e.target.value = "";
  };

  /* ================= CONFIRM DELETE ================= */
  const confirmDelete = async () => {
    try {
      const res = await del(`/admin/questions/${deleteId}`);
      if (res?.message) toast.success(res.message);

      setShowDelete(false);
      setDeleteId(null);

      if (questions.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        loadQuestions();
      }
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= GO TO PAGE ================= */
  const goToPage = () => {
    const num = Number(jumpPage);
    if (!num || num < 1 || num > totalPages) {
      toast.error("Invalid page number");
      return;
    }
    setPage(num);
    setJumpPage("");
  };

  /* ================= UI ================= */
  return (
    <div className="layout">
      <Sidebar />

      <main className="main">
        <Topbar title="Questions" />

        <div className="content">
          {/* ================= HEADER FILTER BAR ================= */}
          <div className="question-header-bar glow-border">
            <div className="input-icon">
              <span className="icon">🔍</span>
              <input
                ref={searchRef}
                className="question-search"
                placeholder="Search question…"
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>

            <div className="input-icon select-wrapper">
              <span className="icon">🎯</span>
              <select
                className="question-subject"
                value={subjectId}
                onChange={(e) => {
                  setPage(1);
                  setSubjectId(e.target.value);
                }}
              >
                <option value="all">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {truncate(toTitleCase(s.displayName || s.name), 25)}
                  </option>
                ))}
              </select>
              <span className="select-arrow">▾</span>
            </div>

            <button
              className="question-add-btn"
              onClick={() => navigate("/questions/add")}
            >
              ➕ Add Question
            </button>

            <label className="upload-btn">
              ⬆ Import JSON
              <input
                type="file"
                accept=".json"
                hidden
                onChange={handleImport}
              />
            </label>
          </div>

          {/* ================= QUESTIONS LIST ================= */}
          <div className="card-admin question-scroll fade-slide">
            {loading && <p className="text-center">Loading...</p>}

            {!loading && questions.length === 0 && (
              <p className="text-center muted">No questions found</p>
            )}

            {questions.map((q) => (
              <div key={q._id} className="list-row">
                <div style={{ flex: 1 }}>
                  <strong>{capitalizeFirst(q.title)}</strong>
                  <div className="muted">
                    Subject: {toTitleCase(q.subjectName)}
                  </div>
                </div>

                <div>
                  <button
                    className="btn btn-outline-secondary btn-sm me-2"
                    onClick={() => navigate(`/questions/edit/${q._id}`)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                      setDeleteId(q._id);
                      setShowDelete(true);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {/* ================= PAGINATION ================= */}
            {totalPages > 1 && (
              <div className="pagination-wrapper mobile-pagination">
                <button
                  className="page-btn"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  ◀
                </button>

                {getPageNumbers(page, totalPages).map((p, i) =>
                  p === "..." ? (
                    <span key={i} className="page-dots">…</span>
                  ) : (
                    <button
                      key={p}
                      className={`page-btn ${page === p ? "active" : ""}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  className="page-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  ▶
                </button>

                <div className="goto-box">
                  <input
                    type="number"
                    placeholder="Page"
                    value={jumpPage}
                    onChange={(e) => setJumpPage(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && goToPage()
                    }
                  />
                  <button onClick={goToPage}>Go</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ================= DELETE MODAL ================= */}
      {showDelete && (
        <div className="modal-overlay">
          <div className="modal-box premium-plus">
            <div className="modal-icon-wrap">
              <div className="modal-icon">⚠️</div>
            </div>

            <h4 className="modal-title">Delete Question?</h4>

            <p className="modal-text">
              This question will be permanently removed.
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
                className="btn premium-delete"
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

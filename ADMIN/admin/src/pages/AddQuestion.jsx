import React, { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

/* 🔹 Capitalize helper */
const toTitleCase = (str = "") =>
  str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function AddQuestion() {
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");

  const [title, setTitle] = useState("");
  const [type, setType] = useState("mcq");

  const [codeContent, setCodeContent] = useState("");

  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("0");

  const navigate = useNavigate();

  /* ================= LOAD SUBJECTS ================= */
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res = await fetch("https://quiz-backend-gamma.vercel.app/api/admin/subjects", {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("admin_token")}`,
          },
        });
        const data = await res.json();
        if (Array.isArray(data.subjects)) setSubjects(data.subjects);
      } catch (err) {
        console.error("Subjects fetch error:", err);
      }
    };

    loadSubjects();
  }, []);

  /* ================= OPTIONS HANDLER ================= */
  const setOpt = (index, value) => {
    setOptions((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  /* ================= SUBMIT ================= */
  const submit = async (e) => {
    e.preventDefault();

    if (!subjectId) return toast.error("Select subject");
    if (!title.trim()) return toast.error("Enter question title");
    if (options.some((o) => !o.trim()))
      return toast.error("All 4 options required");

    if (type === "output" && !codeContent.trim())
      return toast.error("Code is required for output question");

    const payload = {
      subjectId,
      title,
      type,
      code: type === "output" ? { content: codeContent } : null,
      options,
      correctAnswer: Number(correctAnswer),
    };

    console.log("ADD QUESTION PAYLOAD:", payload);

    try {
      const res = await fetch("https://quiz-backend-gamma.vercel.app/api/admin/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      toast.success("Question added successfully");
      navigate("/questions");
    } catch (err) {
      console.error("Add question error:", err);
      toast.error(err.message || "Failed to add question");
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <main className="main">
        <Topbar title="Add Question" />

        <div className="content">
          <div className="card-admin">
            <form onSubmit={submit}>
              {/* SUBJECT */}
              <div className="mb-3">
                <label className="form-label">Subject</label>
                <select
                  className="form-select"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {toTitleCase(sub.displayName || sub.name)}
                    </option>
                  ))}
                </select>
              </div>

              {/* QUESTION TYPE */}
              <div className="mb-3">
                <label className="form-label">Question Type</label>
                <select
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="mcq">MCQ</option>
                  <option value="output">Output</option>
                </select>
              </div>

              {/* TITLE */}
              <div className="mb-3">
                <label className="form-label">Question Title</label>
                <textarea
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* CODE (OUTPUT ONLY) */}
              {type === "output" && (
                <div className="mb-3">
                  <label className="form-label">Code</label>
                  <textarea
                    className="form-control"
                    rows="6"
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    style={{
                      fontFamily: "monospace",
                      background: "#111",
                      color: "#0f0",
                    }}
                    required
                  />
                </div>
              )}

              {/* OPTIONS */}
              {options.map((opt, i) => (
                <div className="mb-3" key={i}>
                  <label className="form-label">Option {i + 1}</label>
                  <input
                    className="form-control"
                    value={opt}
                    onChange={(e) => setOpt(i, e.target.value)}
                    required
                  />
                </div>
              ))}

              {/* CORRECT ANSWER */}
              <div className="mb-3">
                <label className="form-label">Correct Answer</label>
                <select
                  className="form-select"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                >
                  <option value="0">Option 1</option>
                  <option value="1">Option 2</option>
                  <option value="2">Option 3</option>
                  <option value="3">Option 4</option>
                </select>
              </div>

              <button className="btn btn-primary">Add Question</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

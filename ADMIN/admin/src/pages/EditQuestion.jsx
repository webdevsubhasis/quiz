import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import toast from "react-hot-toast";
import "../styles/editQuestion.css";

export default function EditQuestion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  // 🔹 Editable states
  const [type, setType] = useState("mcq");
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("0");

  // 🔹 Code handling (IMPORTANT FIX)
  const [codeContent, setCodeContent] = useState("");
  const [savedCodeContent, setSavedCodeContent] = useState(""); // backup

  /* ================= LOAD QUESTION ================= */
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await fetch(`/api/admin/questions/${id}`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("admin_token")}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setType(data.type || "mcq");
        setTitle(data.title || "");
        setOptions(data.options || ["", "", "", ""]);
        setCorrectAnswer(String(data.correctAnswer ?? 0));

        const existingCode = data.code?.content || "";
        setCodeContent(existingCode);
        setSavedCodeContent(existingCode); // 🔥 backup
      } catch (err) {
        console.error(err);
        toast.error("Failed to load question");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  /* ================= UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      return toast.error("Question title is required");
    }

    if (options.some((o) => !o.trim())) {
      return toast.error("All 4 options are required");
    }

    if (type === "output" && !codeContent.trim()) {
      return toast.error("Code is required for output question");
    }

    const payload = {
      title,
      options,
      correctAnswer: Number(correctAnswer),
      type,
      code: type === "output" ? { content: codeContent } : null,
    };

    console.log("FINAL UPDATE PAYLOAD:", payload);

    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Question updated successfully");
      navigate("/questions");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Update failed");
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-main">
        <Topbar title="Edit Question" />

        <div className="admin-content">
          {/* 🔗 Breadcrumb */}
          <div className="breadcrumb clean">
            <span onClick={() => navigate("/dashboard")}>Dashboard</span>
            <span>/</span>
            <span onClick={() => navigate("/questions")}>Questions</span>
            <span>/</span>
            <span className="active">Edit</span>
          </div>

          <div className="editq-card">
            <h2>Edit Question</h2>

            <form onSubmit={handleSubmit}>
              {/* QUESTION TYPE */}
              <label>Question Type</label>
              <select
                value={type}
                onChange={(e) => {
                  const newType = e.target.value;

                  if (newType === "mcq") {
                    // store code before hiding
                    setSavedCodeContent(codeContent);
                  }

                  if (newType === "output") {
                    // restore old code
                    setCodeContent(savedCodeContent);
                  }

                  setType(newType);
                }}
              >
                <option value="mcq">MCQ</option>
                <option value="output">Output</option>
              </select>

              {/* TITLE */}
              <label>Question Title</label>
              <textarea
                rows="3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              {/* OUTPUT CODE */}
              {type === "output" && (
                <>
                  <label>Code Content</label>
                  <textarea
                    rows="6"
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    placeholder="Enter code here..."
                    style={{
                      fontFamily: "monospace",
                      background: "#111",
                      color: "#0f0",
                    }}
                    required
                  />
                </>
              )}

              {/* OPTIONS */}
              {options.map((opt, i) => (
                <div key={i}>
                  <label>Option {i + 1}</label>
                  <input
                    value={opt}
                    onChange={(e) => {
                      const copy = [...options];
                      copy[i] = e.target.value;
                      setOptions(copy);
                    }}
                    required
                  />
                </div>
              ))}

              {/* CORRECT ANSWER */}
              <label>Correct Answer</label>
              <select
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
              >
                <option value="0">Option 1</option>
                <option value="1">Option 2</option>
                <option value="2">Option 3</option>
                <option value="3">Option 4</option>
              </select>

              <button type="submit">Update Question</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

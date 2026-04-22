import React, { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const toTitleCase = (str = "") =>
  str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function AddQuestion() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [sets, setSets] = useState([]);

  const [subjectId, setSubjectId] = useState("");
  const [setId, setSetId] = useState("");

  const [title, setTitle] = useState("");
  const [type, setType] = useState("mcq");

  const [codeContent, setCodeContent] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("java");

  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("0");

  const [explanation, setExplanation] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [marks, setMarks] = useState(1);
  const [negativeMarks, setNegativeMarks] = useState(0);

  /* ================= LOAD SUBJECTS ================= */
  useEffect(() => {
    fetch("http://localhost:8081/api/admin/subjects")
      .then((res) => res.json())
      .then((data) => setSubjects(data?.subjects || []))
      .catch(() => toast.error("Failed to load subjects"));
  }, []);
  console.log("subject", subjects);

  /* ================= LOAD SETS ================= */
  useEffect(() => {
    if (!subjectId) return;

    fetch(`http://localhost:8081/api/sets/${subjectId}`)
      .then((res) => res.json())
      .then(setSets)
      .catch(() => toast.error("Failed to load sets"));
  }, [subjectId]);

  /* ================= OPTIONS ================= */
  const setOpt = (i, val) => {
    const copy = [...options];
    copy[i] = val;
    setOptions(copy);
  };

  /* ================= SUBMIT ================= */
  const submit = async (e) => {
    e.preventDefault();

    if (!subjectId) return toast.error("Select subject");
    if (!setId) return toast.error("Select set");
    if (!title.trim()) return toast.error("Enter question");

    if (options.some((o) => !o.trim()))
      return toast.error("All options required");

    if (type === "output" && !codeContent.trim())
      return toast.error("Code required");

    const payload = {
      subjectId,
      setId,
      title,
      type,
      code:
        type === "output"
          ? { content: codeContent, language: codeLanguage }
          : null,
      options,
      correctAnswer: Number(correctAnswer),
      explanation,
      difficulty,
      marks: Number(marks),
      negativeMarks: Number(negativeMarks),
    };

    try {
      const res = await fetch(
        "http://localhost:8081/api/admin/questions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("✅ Question added");
      navigate("/questions");
    } catch (err) {
      toast.error(err.message || "Error");
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
                <label>Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    setSetId("");
                  }}
                  className="form-select"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {toTitleCase(s.displayName || s.name)}
                    </option>
                  ))}
                </select>
              </div>

              {/* SET */}
              <div className="mb-3">
                <label>Set (Difficulty)</label>
                <select
                  value={setId}
                  onChange={(e) => setSetId(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select Set</option>
                  {sets.map((set) => (
                    <option key={set._id} value={set._id}>
                      {toTitleCase(set.displayName || set.name)}
                    </option>
                  ))}
                </select>
              </div>

              {/* TYPE */}
              <div className="mb-3">
                <label>Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="form-select"
                >
                  <option value="mcq">MCQ</option>
                  <option value="output">Output</option>
                </select>
              </div>

              {/* TITLE */}
              <div className="mb-3">
                <label>Question</label>
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-control"
                />
              </div>

              {/* CODE */}
              {type === "output" && (
                <>
                  <div className="mb-3">
                    <label>Language</label>
                    <select
                      value={codeLanguage}
                      onChange={(e) => setCodeLanguage(e.target.value)}
                      className="form-select"
                    >
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="python">Python</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label>Code</label>
                    <textarea
                      value={codeContent}
                      onChange={(e) => setCodeContent(e.target.value)}
                      className="form-control"
                      rows="6"
                    />
                  </div>
                </>
              )}

              {/* OPTIONS */}
              {options.map((opt, i) => (
                <div key={i} className="mb-2">
                  <input
                    value={opt}
                    onChange={(e) => setOpt(i, e.target.value)}
                    className="form-control"
                    placeholder={`Option ${i + 1}`}
                  />
                </div>
              ))}

              {/* CORRECT */}
              <div className="mb-3">
                <label>Correct Answer</label>
                <select
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="form-select"
                >
                  <option value="0">Option 1</option>
                  <option value="1">Option 2</option>
                  <option value="2">Option 3</option>
                  <option value="3">Option 4</option>
                </select>
              </div>

              {/* EXTRA */}
              <div className="mb-3">
                <label>Explanation</label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="form-control"
                />
              </div>

              {/* <div className="mb-3">
                <label>Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="form-select"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div> */}

              <div className="mb-3">
                <label>Marks</label>
                <input
                  type="number"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="mb-3">
                <label>Negative Marks</label>
                <input
                  type="number"
                  value={negativeMarks}
                  onChange={(e) => setNegativeMarks(e.target.value)}
                  className="form-control"
                />
              </div>

              <button className="btn btn-primary w-100">
                Add Question
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
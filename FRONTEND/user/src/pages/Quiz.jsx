import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import TimerRing from "../components/TimerRing";
import QuestionPalette from "../components/QuestionPalette";
import { formatQuestion } from "../utils/formatQuestion";
import Prism from "prismjs";

/* 🔥 Prism languages */
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-css";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-java";
import "prismjs/components/prism-python";
import "prismjs/components/prism-javascript";

import "../styles/Quiz.css";

const MAX_WARNINGS = 3;
const NEGATIVE_MARK = 1 / 3;

export default function Quiz() {
  const { setId } = useParams();

  const navigate = useNavigate();
  const submittedRef = useRef(false);

  /* ================= STATE ================= */
  const [subjectName, setSubjectName] = useState("Loading...");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [review, setReview] = useState({});
  const [visited, setVisited] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  const [showInstructions, setShowInstructions] = useState(true);
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [fullscreenStarted, setFullscreenStarted] = useState(false);
  const [warnings, setWarnings] = useState(0);

  /* 🔥 SUBMIT MODAL */
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  // Convert any string to Title Case
  const toTitleCase = (text) => {
    if (!text) return "";

    return text
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };


  /* ================= FETCH QUESTIONS ================= */
  useEffect(() => {
    fetch(`http://localhost:8081/api/questions/public?setId=${setId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("checking....", data)
        const mapped = data.questions.map((q) => (

          {

            ...q,
            question: q.title,
            answer: q.correctAnswer,
          }));

        setQuestions(mapped);
        setTimeLeft(Math.ceil(mapped.length * 0.7 * 60));
        // console.log("checking....", questions);

        // ✅ SUBJECT NAME FROM BACKEND
        setSubjectName(data.subjectName || mapped[0]?.subjectName || "Subject");
      })
      .catch(() => toast.error("Failed to load exam"));
  }, [setId]);

  useEffect(() => {
    if (!submittedRef.current) {
      setVisited(v => ({ ...v, [current]: true }));
    }
  }, [current]);
  /* ================= TIMER ================= */
  useEffect(() => {
    if (!fullscreenStarted) return;

    if (timeLeft <= 0 && !submittedRef.current) {
      handleSubmit(true);
      return;
    }

    const t = setInterval(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, fullscreenStarted]);

  /* ================= TAB / BLUR DETECTION ================= */
  useEffect(() => {
    if (!fullscreenStarted) return;

    const violation = () => {
      setWarnings((w) => {
        const next = w + 1;
        if (next >= MAX_WARNINGS && !submittedRef.current) {
          toast.error("Maximum violations reached. Exam submitted!");
          handleSubmit(true);
        } else {
          toast.error(`Tab switch detected! Warning ${next}/${MAX_WARNINGS}`);
        }
        return next;
      });
    };

    const onVisibility = () => document.hidden && violation();
    const onBlur = () => violation();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
    };
  }, [fullscreenStarted]);

  /* ================= COPY / KEY BLOCK ================= */
  useEffect(() => {
    const block = (e) => e.preventDefault();

    const keyBlock = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "x", "a", "p"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        toast.error("Action blocked during exam");
      }
    };

    document.addEventListener("contextmenu", block);
    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("keydown", keyBlock);

    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("keydown", keyBlock);
    };
  }, []);

  /* ================= PRISM ================= */
  useEffect(() => {
    Prism.highlightAll();
  }, [current, questions]);

  /* ================= ACTIONS ================= */
  const selectOption = (i) => {
    if (!submittedRef.current) {
      setAnswers((a) => ({ ...a, [current]: i }));
      setVisited((v) => ({ ...v, [current]: true }));
    }
  };
  console.log("checkAnswer:", answers);

  const toggleReview = () => {
    if (!submittedRef.current) {
      setReview((r) => ({ ...r, [current]: !r[current] }));
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (force = false) => {
    if (submittedRef.current) return;

    if (!force) setShowSubmitModal(false);
    submittedRef.current = true;

    const total = questions.length;
    // const attempted = Object.keys(answers).length;

    let correct = 0;
    let wrong = 0;

    questions.forEach((q, index) => {
      const userAnswer = answers[index];

      if (userAnswer === undefined) return;

      if (userAnswer === q.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    });


    const attempted = correct + wrong;
    const unattempted = total - attempted;

    const score = Math.max(0, +(correct - wrong * NEGATIVE_MARK).toFixed(2));
    const finalScore = Math.max(0, Number(score.toFixed(2)));

    const percentage = +((score / total) * 100).toFixed(2);

    const timeTakenSec =
      Math.ceil(questions.length * 0.7 * 60) - timeLeft;

    toast.success("🎉 EXAM COMPLETE SUCCESSFULLY");


    /* ===== NAVIGATE TO RESULT PAGE ===== */
    navigate("/result", {
      state: {

        subjectName,
        questions,
        answers,
        total,
        attempted,
        unattempted,
        correct,
        wrong,
        score: finalScore,
        percentage,
        pass: percentage >= 40,
        warnings,
        timeTaken: timeTakenSec,
      },
    });



    /* ===== SAVE RESULT TO BACKEND ===== */
    try {
      const token =
        localStorage.getItem("user_token") ||
        sessionStorage.getItem("user_token");

      // ✅ 1. SAVE ATTEMPT (IMPORTANT)
      await fetch("http://localhost:8081/api/sets/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          setId,
          score: finalScore,
          total,
        }),
      });
    } catch (err) {
      console.error("Result save/email failed", err);
    }

  };
  ;

  /* ================= INSTRUCTIONS ================= */
  if (showInstructions) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center px-4">

        <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 relative">

          {/* 🔙 BACK BUTTON */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 text-slate-400 hover:text-white transition text-sm flex items-center gap-1"
          >
            ← Back
          </button>

          {/* HEADER */}
          <div className="text-center mb-5">
            <h2 className="text-2xl font-semibold tracking-tight">
              Exam Instructions
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Please read carefully before starting
            </p>
          </div>

          {/* SUBJECT */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3 mb-5 text-center">
            <span className="text-sm text-slate-400">Subject</span>
            <div className="text-lg font-semibold">
              {toTitleCase(subjectName)}
            </div>
          </div>

          {/* RULES */}
          <ul className="space-y-2 text-sm text-slate-300 mb-5">
            <li>⏱ Duration: {Math.ceil(questions.length * 0.7)} minutes</li>
            <li>❌ Negative marking: −1/3</li>
            <li>🚫 No tab switching allowed</li>
            <li>⚠ Max {MAX_WARNINGS} warnings</li>
            <li>📱 Fullscreen mandatory</li>
            <li>📤 Auto-submit on timeout</li>
          </ul>

          {/* AGREEMENT */}
          <label className="flex items-center gap-2 text-sm text-slate-300 mb-5 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedRules}
              onChange={(e) => setAcceptedRules(e.target.checked)}
              className="accent-indigo-500"
            />
            I agree to all instructions
          </label>

          {/* ACTION */}
          <button
            disabled={!acceptedRules}
            className={`
            w-full py-3 rounded-lg font-medium transition
            ${acceptedRules
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-slate-700 text-slate-400 cursor-not-allowed"}
          `}
            onClick={() => {
              document.documentElement.requestFullscreen?.();
              setShowInstructions(false);
              setFullscreenStarted(true);
            }}
          >
            Start Exam →
          </button>

        </div>
      </div>
    );
  }
  /* ================= EXAM UI ================= */
  const q = questions[current];
  const formatted = formatQuestion(q, current);

  const isFirst = current === 0;
  const isLast = current === questions.length - 1;

  return (
    <div className="cbt-root">
      <header className="cbt-header">
        <div>{toTitleCase(subjectName)}</div>
        <TimerRing timeLeft={timeLeft} />
        <div>{current + 1}/{questions.length}</div>
      </header>

      <div className="cbt-body">
        <aside className="palette-wrapper">
          <QuestionPalette
            questions={questions}
            current={current}
            setCurrent={setCurrent}
            visited={visited}
            answers={answers}
            review={review}
          />
        </aside>

        <main className="cbt-main">
          <p className="question-text">{formatted.questionPart}</p>

          {q?.type === "output" && q?.code?.content && (
            <pre key={q._id} className="code-block">
              <code className={`language-${q.code.language || "css"}`}>
                {q.code.content}
              </code>
            </pre>
          )}

          <div className="options">
            {q.options.map((opt, i) => (
              <button
                key={i}
                className={`option ${answers[current] === i ? "selected" : ""}`}
                onClick={() => selectOption(i)}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="cbt-actions">
            <button
              disabled={isFirst}
              className={isFirst ? "disabled-btn" : ""}
              onClick={() => !isFirst && setCurrent(c => c - 1)}
            >
              Prev
            </button>
            <button
              className={`review-btn ${review[current] ? "marked" : ""}`}
              onClick={toggleReview}
            >
              {review[current] ? "Un-Review" : "Review"}
            </button>

            <button
              disabled={isLast}
              className={isLast ? "disabled-btn" : ""}
              onClick={() => !isLast && setCurrent(c => c + 1)}
            >
              Next
            </button>

            <button className="submit-btn" onClick={() => setShowSubmitModal(true)}>Submit</button>
          </div>
        </main>
      </div>

      {/* 🔥 SUBMIT CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div className="submit-overlay">
          <div className="submit-card">
            <h3>Submit Exam?</h3>
            <p>You cannot change answers after submission.</p>

            <div className="submit-actions">
              <button onClick={() => setShowSubmitModal(false)}>
                Cancel
              </button>
              <button className="confirm" onClick={() => handleSubmit(false)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

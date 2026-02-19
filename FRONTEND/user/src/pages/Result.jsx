import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Result.css";

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return <div className="result-error">No Result Data</div>;
  }

  const {
    subjectId,
    subjectName = "Subject",
    questions = [],
    answers = {},
    total = 0,
    attempted = 0,
    unattempted = 0,
    correct = 0,
    wrong = 0,
    score = 0,
    percentage = 0,
    timeTaken = 0,
  } = state;

  const accuracy =
    attempted === 0 ? 0 : Math.round((correct / attempted) * 100);

  const isPass = percentage >= 40;

  const minutes = Math.floor(timeTaken / 60);
  const seconds = timeTaken % 60;

  return (
    <div className={`result-root ${isPass ? "pass-anim" : "fail-anim"}`}>
      <div className="result-card glass">
        <h1 className="result-title">Exam Result</h1>
        <h3 className="subject-name">{subjectName.toUpperCase()}</h3>

        <div className={`result-status ${isPass ? "pass" : "fail"}`}>
          {isPass ? "PASS" : "FAIL"}
        </div>

        {/* SCORE RING */}
        <div className="score-ring">
          <svg>
            <circle cx="60" cy="60" r="52" />
            <circle
              cx="60"
              cy="60"
              r="52"
              style={{
                strokeDashoffset: 327 - (327 * percentage) / 100,
              }}
            />
          </svg>
          <div className="score-text">
            <span>{score}</span>
            <small>/ {total}</small>
          </div>
        </div>

        {/* STATS */}
        <div className="result-grid">
          <Stat label="Total Questions" value={total} />
          <Stat label="Attempted" value={attempted} />
          <Stat label="Unattempted" value={unattempted} />
          <Stat label="Correct" value={correct} />
          <Stat label="Wrong" value={wrong} />
          <Stat label="Accuracy" value={`${accuracy}%`} />
          <Stat label="Time Taken" value={`${minutes}m ${seconds}s`} />
        </div>

        {/* ACTIONS */}
        <div className="result-actions">
          <button onClick={() => navigate("/")}>Home</button>

          <button
            className="secondary"
            onClick={() =>
              navigate("/review", {
                state: {
                  subjectId,
                  subjectName,
                  questions,
                  answers,
                },
              })
            }
          >
            Review Answers
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

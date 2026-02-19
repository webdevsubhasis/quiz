import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Review.css";

export default function Review() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Safety check: state or questions missing or empty
  if (!state || !state.questions || state.questions.length === 0) {
    return (
      <div className="review-error">
  <div className="error-card">
    <div className="error-icon">⚠️</div>
    <h3>No Review Data Available</h3>
    <p>Please complete the exam to view your answers.</p>
    <button onClick={() => navigate(-1)}>⬅ Go Back</button>
  </div>
</div>

    );
  }

  const { subjectName, questions, answers } = state;

  

  return (
    <div className="review-root">
      <header className="review-header">
        <h2>Answer Review</h2>
        <h4>{subjectName.toUpperCase()}</h4>
        <button onClick={() => navigate(-1)}>⬅ Back</button>
      </header>

      <div className="review-list">
        {questions.map((q, index) => {
          const userAnswerIndex = answers[index];
          const correctIndex = q.answer;

          const userAnswer =
            userAnswerIndex !== undefined
              ? q.options[userAnswerIndex]
              : "Not Attempted";

          const correctAnswer = q.options[correctIndex];

          const isCorrect = userAnswerIndex === correctIndex;

          return (
            <div
              key={q._id || index}
              className={`review-card ${isCorrect ? "correct" : "wrong"}`}
            >
              <h4>
                Q{index + 1}. {q.question}
              </h4>

              {/* CODE FOR OUTPUT QUESTIONS */}
              {q.type === "output" && q.code?.content && (
                <pre className="review-code">
                  <code>{q.code.content}</code>
                </pre>
              )}

              <p>
                <strong>Your Answer:</strong>{" "}
                <span className={isCorrect ? "green" : "red"}>{userAnswer}</span>
              </p>

              <p>
                <strong>Correct Answer:</strong>{" "}
                <span className="green">{correctAnswer}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

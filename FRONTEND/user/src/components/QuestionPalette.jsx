import React from "react";
import "../styles/Palette.css";

export default function QuestionPalette({
  questions,
  current,
  setCurrent,
  visited,
  answers,
  review,
}) {
  const getStatusClass = (index) => {
    if (review[index] && answers[index] !== undefined)
      return "qp-review-answered";

    if (review[index]) return "qp-review";
    if (answers[index] !== undefined) return "qp-answered";
    if (visited[index]) return "qp-visited";
    return "qp-not-visited";
  };

  return (
    <aside className="palette">
      <h3 className="palette-title">Question Palette</h3>

      <div className="palette-grid">
        {questions.map((_, index) => (
          <button
            key={index}
            className={`palette-btn ${getStatusClass(index)} ${current === index ? "active" : ""}`}
            onClick={() => setCurrent(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="palette-legend">
        <div><span className="dot not"></span> Not Visited</div>
        <div><span className="dot visited"></span> Visited</div>
        <div><span className="dot answered"></span> Answered</div>
        <div><span className="dot review"></span> Marked for Review</div>
        <div><span className="dot review-answered"></span> Marked + Answered</div>
      </div>
    </aside>
  );
}

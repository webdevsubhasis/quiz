
import React from "react";
import { formatQuestion } from "../utils/formatQuestion"; 

export default function QuestionCard({ rawQuestion, explanation, answer }) {
  const formatted = formatQuestion(rawQuestion, explanation, answer);

  return (
    <div className="question-card">
      <h3>{formatted.questionPart}</h3>

      {formatted.codePart && (
        <pre style={{ background: "#111", color: "#0f0", padding: "10px" }}>
          {formatted.codePart}
        </pre>
      )}

      <p>
        <strong>Explanation:</strong> {formatted.explanation}
      </p>
      <p>
        <strong>Answer:</strong> {formatted.answer}
      </p>
    </div>
  );
}

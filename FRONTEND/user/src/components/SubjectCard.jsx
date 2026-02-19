import React from "react";
import { Link } from "react-router-dom";
import { FaBookOpen } from "react-icons/fa";
import "../styles/Home.css";

/* 🔍 Highlight matched text */
const highlightText = (text, search) => {
  if (!search) return text;

  const regex = new RegExp(`(${search})`, "gi");
  return text.split(regex).map((part, i) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <mark key={i} className="highlight">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

export default function SubjectCard({ subject, search = "" }) {
  return (
    <Link to={`/quiz/${subject._id}`} className="subject-card">
      <div className="subject-icon">
        <FaBookOpen />
      </div>

      <h3 className="subject-title">
        {highlightText(subject.name.toUpperCase(), search)}
      </h3>

      <p className="subject-desc">
        {subject.description || "Practice questions and test your knowledge"}
      </p>

      <span className="subject-btn">Start Practice →</span>
    </Link>
  );
}

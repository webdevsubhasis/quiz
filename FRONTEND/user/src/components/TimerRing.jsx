import React from "react";
import "../styles/Timer.css"; // add this css file

export default function TimerRing({ timeLeft }) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // timer status
  let timerClass = "timer-normal";

  if (timeLeft <= 60) {
    timerClass = "timer-danger blink";
  } else if (timeLeft <= 300) {
    timerClass = "timer-warning";
  }

  return (
    <div className={`timer-ring ${timerClass}`}>
      ⏱ {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  );
}

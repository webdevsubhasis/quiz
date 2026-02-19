import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ResultChart({ correct, wrong }) {
  const data = {
    labels:["Correct","Wrong"],
    datasets:[{
      data:[correct,wrong],
      backgroundColor:["#4CAF50","#F44336"]
    }]
  }

  return (
    <div className="chart-container" style={{maxWidth:"300px",margin:"auto"}}>
      <Pie data={data}/>
    </div>
  )
}

import React from "react";

export default function SidebarQuestionMap({ total, current, answers }) {
  return (
    <div className="sidebar-map d-flex flex-wrap mt-3 mt-lg-0 ms-lg-3">
      {Array.from({length:total}).map((_,idx)=>{
        const answered = answers[idx] !== undefined;
        const active = idx === current;
        return (
          <div key={idx} className={`map-dot m-1 ${active?"bg-primary":answered?"bg-success":"bg-secondary"}`} style={{width:"30px",height:"30px",borderRadius:"50%",cursor:"pointer"}}>
            {idx+1}
          </div>
        )
      })}
    </div>
  );
}

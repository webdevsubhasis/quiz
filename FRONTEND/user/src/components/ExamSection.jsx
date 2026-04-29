import { useNavigate } from "react-router-dom";
import { isLoggedIn, isPremiumUser } from "../utils/subscription";


export default function ExamSection({ title, exams = [], type = "default" }) {
    const navigate = useNavigate();




    return (
        <section className="section mt-10">
            <h2 className="text-lg font-semibold mb-4">{title}</h2>

            <div className="flex gap-4 overflow-x-auto pb-2">
                {exams.map((exam) => (
                    <div
                        key={exam.id}
                        className={`min-w-[220px] p-4 rounded-xl shadow-md border border-white/5 ${type === "recent"
                            ? "bg-gradient-to-br from-slate-700 to-slate-800"
                            : "bg-gradient-to-br from-indigo-700 to-purple-800"
                            }`}
                    >
                        {/* TITLE */}
                        <h3 className="text-white font-semibold text-md mb-2">
                            {exam.subject}
                        </h3>
                        <h4 className="text-white font-semibold text-md mb-2">
                            Set : {exam.setType}
                        </h4>

                        {/* CONTENT */}
                        {type === "recent" ? (
                            <>
                                {/* // <p className="text-sm text-gray-300 mb-3">
                            //     Score: {exam.score}/{exam.total}
                            // </p> */}
                            </>
                        ) : (
                            <p className="text-sm text-gray-300 mb-3">
                                {exam.students}+ students
                            </p>
                        )}

                        {/* BUTTON */}
                        <button
                            onClick={() => {
                                if (!isLoggedIn()) {
                                    navigate("/login");
                                    return;
                                }

                                if (
                                    exam.setType?.toLowerCase().includes("hard") &&
                                    !isPremiumUser()
                                ) {
                                    alert("🔒 Premium required");
                                    return;
                                }

                                navigate(`/quiz/${exam.setId}`);
                            }}

                            className="w-full mt-2 py-2 rounded bg-black/30 hover:bg-black/50 text-white text-sm transition"
                        >
                            {type === "recent" ? "Reattempt" : "Start"}
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}
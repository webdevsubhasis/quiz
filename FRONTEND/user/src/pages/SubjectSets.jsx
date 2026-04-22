import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSetsBySubject } from "../services/set.service";

export default function SubjectSets() {
    const { subjectId } = useParams();
    const navigate = useNavigate();

    const [sets, setSets] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const loadSets = async () => {
            try {
                const data = await getSetsBySubject(subjectId);
                setSets(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadSets();
    }, [subjectId]);

    console.log("test set", sets);
    

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-400">
                Loading sets...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] text-white px-6 py-10">

            {/* HEADER */}
            <div className="max-w-5xl mx-auto mb-10">
                <h1 className="text-3xl font-bold mb-2">
                    Choose Your Challenge 🚀
                </h1>
                <p className="text-gray-400">
                    Select difficulty level to start your exam
                </p>
            </div>

            {/* SET GRID */}
            <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

                {sets.map((set) => {
                    const level = (set.name || "").toLowerCase();

                    // 🎯 Dynamic styling
                    const styles = {
                        easy: "from-green-500/20 to-green-700/10 border-green-400/20",
                        medium: "from-yellow-500/20 to-yellow-700/10 border-yellow-400/20",
                        hard: "from-red-500/20 to-red-700/10 border-red-400/20",
                    };

                    const icons = {
                        easy: "🟢",
                        medium: "🟡",
                        hard: "🔴",
                    };

                    return (
                        <div
                            key={set._id}
                            onClick={() => navigate(`/quiz/${set._id}`)}
                            className={`cursor-pointer p-6 rounded-2xl backdrop-blur-lg bg-gradient-to-br ${styles[level] || "from-slate-700/20 to-slate-900/20"} border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2`}
                        >
                            {/* ICON */}
                            <div className="text-3xl mb-4">
                                {icons[level] || "📘"}
                            </div>

                            {/* TITLE */}
                            <h2 className="text-xl font-semibold mb-2">
                                {(set.displayName || set.name || "Set").toUpperCase()}
                            </h2>

                            {/* SUBTEXT */}
                            <p className="text-gray-400 text-sm">
                                {level === "easy" && "Beginner friendly questions"}
                                {level === "medium" && "Moderate difficulty questions"}
                                {level === "hard" && "Challenging advanced questions"}
                            </p>

                            {/* CTA */}
                            <div className="mt-4 text-sm text-blue-400">
                                Start Test →
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
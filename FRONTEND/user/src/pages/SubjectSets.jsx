import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSetsBySubject } from "../services/set.service";

// ✅ ADD THESE
const isLoggedIn = () =>
    !!(
        localStorage.getItem("user_token") ||
        sessionStorage.getItem("user_token")
    );

const isPremiumUser = () =>
    localStorage.getItem("isPremium") === "true";

export default function SubjectSets() {
    const { subjectId } = useParams();
    const navigate = useNavigate();

    const [sets, setSets] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✅ MODAL STATE
    const [showModal, setShowModal] = useState(false);
    const [selectedSet, setSelectedSet] = useState(null);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-400">
                Loading sets...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] text-white px-6 py-10">

            {/* ================= HEADER ================= */}
            <div className="max-w-6xl mx-auto mb-10">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 text-sm text-slate-400 hover:text-white transition flex items-center gap-2"
                >
                    ← Back
                </button>

                <h1 className="text-3xl font-bold mb-2 tracking-tight">
                    Choose Your Challenge 🚀
                </h1>

                <p className="text-slate-400 max-w-md">
                    Easy & Medium are free. Hard requires premium access.
                </p>
            </div>

            {/* ================= GRID ================= */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">

                {sets.map((set) => {
                    const level = (set.name || "").toLowerCase();
                    const isDisabled = set.questionCount === 0;
                    const isHard = level === "hard";

                    const styles = {
                        easy: "from-green-500/10 to-green-800/10 border-green-400/20",
                        medium: "from-yellow-500/10 to-yellow-800/10 border-yellow-400/20",
                        hard: "from-red-500/10 to-red-800/10 border-red-400/20",
                    };

                    const icons = {
                        easy: "🟢",
                        medium: "🟡",
                        hard: "🔴",
                    };

                    return (
                        <div
                            key={set._id}
                            onClick={() => {
                                if (isDisabled) return;

                                // 🔐 LOGIN CHECK
                                if (!isLoggedIn()) {
                                    navigate("/login");
                                    return;
                                }

                                // 🔒 PREMIUM CHECK
                                if (isHard && !isPremiumUser()) {
                                    setSelectedSet(set);
                                    setShowModal(true);
                                    return;
                                }

                                navigate(`/quiz/${set._id}`);
                            }}
                            className={`
                relative
                p-6 rounded-2xl border backdrop-blur-md transition-all duration-300
                ${isDisabled
                                    ? "bg-slate-800/40 border-slate-700 cursor-not-allowed opacity-50"
                                    : `cursor-pointer bg-gradient-to-br ${styles[level] ||
                                    "from-slate-700/10 to-slate-900/10"
                                    } hover:-translate-y-2 hover:shadow-2xl`
                                }
              `}
                        >

                            {/* 🔒 PREMIUM BADGE */}
                            {isHard && !isPremiumUser() && (
                                <div className="absolute top-3 right-3 text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
                                    🔒 Premium
                                </div>
                            )}

                            {/* ICON */}
                            <div className="text-3xl mb-4">
                                {icons[level] || "📘"}
                            </div>

                            {/* TITLE */}
                            <h2 className="text-xl font-semibold mb-1">
                                {(set.displayName || set.name || "Set").toUpperCase()}
                            </h2>

                            {/* SUBTEXT */}
                            <p className="text-sm text-slate-400">
                                {level === "easy" && "Beginner friendly questions"}
                                {level === "medium" && "Moderate difficulty questions"}
                                {level === "hard" && "Challenging advanced questions"}
                            </p>

                            {/* COUNT */}
                            <p className="text-xs mt-2 text-slate-500">
                                {set.questionCount} questions
                            </p>

                            {/* CTA */}
                            <div className="mt-4 text-sm">
                                {isDisabled ? (
                                    <span className="text-red-400">
                                        No questions available
                                    </span>
                                ) : (
                                    <span className="text-indigo-400">
                                        {isHard && !isPremiumUser()
                                            ? "Unlock Premium →"
                                            : "Start Test →"}
                                    </span>
                                )}
                            </div>

                        </div>
                    );
                })}
            </div>

            {/* ================= MODAL ================= */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">

                        <h2 className="text-2xl font-bold mb-3">
                            🔒 Premium Required
                        </h2>

                        <p className="text-slate-400 mb-6">
                            Hard level exams are for premium users only.
                            Upgrade to unlock advanced challenges.
                        </p>

                        <button
                            onClick={() => {
                                alert("💳 Payment integration here (Razorpay)");
                            }}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold"
                        >
                            Upgrade ₹9
                        </button>

                        <button
                            onClick={() => setShowModal(false)}
                            className="mt-3 text-slate-400 hover:text-white"
                        >
                            Cancel
                        </button>

                    </div>

                </div>
            )}
        </div>
    );
}
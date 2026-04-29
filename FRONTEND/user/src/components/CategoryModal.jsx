import { useEffect } from "react";

export default function CategoryModal({ category, onClose, navigate }) {
    if (!category) return null;

    useEffect(() => {
        // 🔥 SAVE CURRENT SCROLL POSITION
        const scrollY = window.scrollY;

        // 🔥 LOCK SCROLL PROPERLY
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";

        return () => {
            // 🔥 RESTORE SCROLL POSITION
            const savedY = document.body.style.top;

            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.width = "";

            window.scrollTo(0, parseInt(savedY || "0") * -1);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">

            {/* BACKDROP */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* PANEL */}
            <div className="relative w-full sm:w-[480px] max-h-[85vh] bg-slate-900 rounded-t-3xl sm:rounded-2xl p-5 overflow-y-auto border border-white/10 shadow-2xl">

                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4"></div>

                <div className="flex justify-between items-center mb-5">
                    <div>
                        <h2 className="text-lg font-semibold">
                            {category.displayName}
                        </h2>
                        <p className="text-xs text-slate-400">
                            {category.subjects.length} subjects
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white text-xl"
                    >
                        ✕
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {category.subjects.map((sub) => (
                        <div
                            key={sub._id}
                            onClick={() => {
                                navigate(`/subject/${sub._id}`);
                                onClose();
                            }}
                            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-center cursor-pointer transition hover:scale-105"
                        >
                            {sub.displayName}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
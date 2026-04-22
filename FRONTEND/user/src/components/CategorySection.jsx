import { useNavigate } from "react-router-dom";

export default function CategorySection({ categories }) {
    const navigate = useNavigate();

    return (
        <section className="mt-12">
            <h2 className="text-xl font-semibold mb-6">
                🚀 Explore Categories
            </h2>

            <div className="space-y-10">
                {categories.map((cat) => {
                    const visibleSubjects = cat.subjects.slice(0, 4);

                    return (
                        <div
                            key={cat._id}
                            className="p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 shadow-lg"
                        >
                            {/* HEADER */}
                            <div className="flex justify-between items-center mb-5">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">
                                        {cat.displayName}
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        {cat.subjects.length} subjects
                                    </p>
                                </div>

                                <button
                                    onClick={() => navigate(`/category/${cat._id}`)}
                                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                                >
                                    View All →
                                </button>
                            </div>

                            {/* SUBJECT GRID */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {visibleSubjects.map((sub) => (
                                    <div
                                        key={sub._id}
                                        onClick={() => navigate(`/subject/${sub._id}`)}
                                        className="bg-[#0b1626] p-3 rounded-xl text-center text-white hover:bg-[#16263d] cursor-pointer transition-all hover:-translate-y-1"
                                    >
                                        {sub.displayName}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
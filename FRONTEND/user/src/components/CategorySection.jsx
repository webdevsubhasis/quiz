import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
// import CategoryModal from "./CategoryModal";

export default function CategorySection({
    categories,
    selectedCategory,
    setSelectedCategory,
}) {
    const navigate = useNavigate();

    return (
        <section className="mt-10 px-4 sm:px-6">

            <h2 className="text-lg sm:text-xl font-semibold text-white mb-6">
                🚀 Explore Categories
            </h2>

            <div className="space-y-6">

                {categories.map((cat, i) => (
                    <motion.div
                        key={cat._id}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4 sm:p-5 shadow-lg"
                    >

                        {/* HEADER */}
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-white">
                                    {cat.displayName}
                                </h3>

                                <p className="text-xs text-slate-400">
                                    {cat.subjects.length} subjects
                                </p>
                            </div>

                            <button
                                onClick={() => setSelectedCategory(cat)}
                                className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
                            >
                                View All →
                            </button>
                        </div>

                        {/* 🔥 SUBJECT CARDS ANIMATION */}
                        <motion.div
                            className="flex gap-3 overflow-x-auto"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={{
                                visible: {
                                    transition: { staggerChildren: 0.1 },
                                },
                            }}
                        >
                            {cat.subjects.map((sub) => (
                                <motion.div
                                    key={sub._id}
                                    onClick={() => navigate(`/subject/${sub._id}`)}
                                    variants={{
                                        hidden: { opacity: 0, scale: 0.8 },
                                        visible: { opacity: 1, scale: 1 },
                                    }}
                                    whileHover={{ scale: 1.08 }}
                                    className="min-w-[120px] px-4 py-3 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 text-center text-sm text-white cursor-pointer"
                                >
                                    {sub.displayName}
                                </motion.div>
                            ))}
                        </motion.div>

                    </motion.div>
                ))}
            </div>

            {/* <CategoryModal
                category={selectedCategory}
                onClose={() => setSelectedCategory(null)}
                navigate={navigate}
            /> */}
        </section>
    );
}
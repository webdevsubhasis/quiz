import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CategoryModal from "../components/CategoryModal";

import Header from "../components/Header";
import HeroSlider from "../components/HeroSlider";
import CategorySection from "../components/CategorySection";
import ExamSection from "../components/ExamSection";
import Loader from "../components/Loader";
import MotionWrapper from "../components/MotionWrapper"; // ✅ NEW

import { fetchCategories } from "../services/category.service";
import { getDashboard } from "../services/set.service";

import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const [categories, setCategories] = useState([]);
  const [recentExams, setRecentExams] = useState([]);
  const [popularExams, setPopularExams] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isLoggedIn =
    localStorage.getItem("user_token") ||
    sessionStorage.getItem("user_token");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoryData, dashboardData] = await Promise.all([
          fetchCategories(),
          getDashboard(),
        ]);

        setCategories(categoryData);
        setRecentExams(dashboardData.recentExams || []);
        setPopularExams(dashboardData.popularExams || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCategorySelect = (cat) => {
    const fullCategory = categories.find((c) => c._id === cat._id);
    setSelectedCategory(fullCategory || cat);

    document.getElementById("category-section")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  if (loading) return <Loader />;

  return (
    <>
      <Header onCategorySelect={handleCategorySelect} />

      <div className="bg-slate-950 min-h-screen text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-12">

          {/* 🔥 HERO */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <HeroSlider />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {recentExams.length > 0 ? (
              <ExamSection title="Continue Your Journey" exams={recentExams} />
            ) : isLoggedIn ? (
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-10 text-center shadow-lg">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                  🚀 Start Your First Exam
                </h2>

                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  You haven’t attempted any tests yet. Explore categories and begin your learning journey.
                </p>

                <button
                  onClick={() => {
                    document.getElementById("category-section")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold transition"
                >
                  Explore Categories
                </button>
              </div>
            ) : (
              <div className="relative  rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-slate-900/40 to-blue-500/10 backdrop-blur-xl p-8 sm:p-10 text-center shadow-[0_10px_40px_rgba(0,0,0,0.6)]">

                <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full"></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/20 blur-3xl rounded-full"></div>

                <div className="text-4xl mb-4 animate-pulse">🚀</div>

                <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                  Track Your Progress
                </h2>

                <p className="text-slate-400 mb-6 max-w-md mx-auto leading-relaxed">
                  Unlock insights, monitor your performance, and improve faster with personalized tracking.
                </p>

                <button
                  onClick={() => (window.location.href = "/login")}
                  className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-blue-500 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-indigo-500/30"
                >
                  Login & Start 🚀
                </button>
              </div>
            )}
          </motion.div>

          {/* 🔥 POPULAR */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {popularExams.length > 0 ? (
              <ExamSection title="🔥 Popular Exams" exams={popularExams} />
            ) : (
              <div className="text-center">No popular exams</div>
            )}
          </motion.div>


          {/* 🔥 CATEGORY */}
          <motion.div
            id="category-section"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}
          >
            <div>
              {error ? (
                <div className="text-center text-red-400">{error}</div>
              ) : (
                <CategorySection
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                />
              )}
            </div>
          </motion.div>

        </div>
      </div>
      <CategoryModal
        category={selectedCategory}
        onClose={() => setSelectedCategory(null)}
        navigate={navigate}
      />
    </>
  );
}
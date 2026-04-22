import { useEffect, useState } from "react";
import Header from "../components/Header";
import HeroSlider from "../components/HeroSlider";
import CategorySection from "../components/CategorySection";
import ExamSection from "../components/ExamSection";

import { fetchCategories } from "../services/category.service";
import { getDashboard } from "../services/set.service";

import "../styles/Home.css";

export default function Home() {
  const [search, setSearch] = useState("");

  const [categories, setCategories] = useState([]);
  const [recentExams, setRecentExams] = useState([]);
  const [popularExams, setPopularExams] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <>
      <Header onSearch={setSearch} />

      <div className="bg-slate-950 min-h-screen text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">

          {/* HERO */}
          <HeroSlider />

          {/* ================= CONTINUE JOURNEY ================= */}
          {recentExams.length > 0 ? (
            <ExamSection
              title="Continue Your Journey"
              exams={recentExams}
              type="recent"
            />
          ) : (
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-10 text-center shadow-lg">

              <h2 className="text-3xl font-bold mb-3">
                🚀 Start Your First Exam
              </h2>

              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                You haven’t attempted any tests yet. Explore categories and begin your learning journey.
              </p>

              {/* CTA BUTTON */}
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
          )}

          {/* ================= POPULAR EXAMS ================= */}
          {popularExams.length > 0 ? (
            <ExamSection
              title="🔥 Popular Exams"
              exams={popularExams}
              type="popular"
            />
          ) : (
            <div className="flex items-center justify-center py-6">
              <p className="text-slate-500 text-sm">
                No popular exams yet — your attempt will be the first 🔥
              </p>
            </div>
          )}

          {/* ================= CATEGORY ================= */}
          <div id="category-section">
            {loading ? (
              <div className="text-center text-slate-400">
                Loading categories...
              </div>
            ) : error ? (
              <div className="text-center text-red-400">
                {error}
              </div>
            ) : (
              <CategorySection categories={categories} />
            )}
          </div>

        </div>
      </div>
    </>
  );
}
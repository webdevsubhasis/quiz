import React, { useEffect, useRef, useState } from "react";
import SubjectCard from "../components/SubjectCard";
import Header from "../components/Header";
import toast from "react-hot-toast";
import "../styles/Home.css";
import { FiArrowUp } from "react-icons/fi";

const LIMIT = 8;

export default function Home() {
  const [subjects, setSubjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showTop, setShowTop] = useState(false);

  const pageRef = useRef(1);
  const fetchingRef = useRef(false);
  const observerRef = useRef(null);
  const isSearchingRef = useRef(false);

  /* 🔍 Detect search mode */
  useEffect(() => {
    isSearchingRef.current = search.trim().length > 0;
  }, [search]);

  /* 📡 Fetch subjects */
  const fetchSubjects = async ({ reset = false } = {}) => {
    if (fetchingRef.current || (!hasMore && !reset)) return;

    fetchingRef.current = true;
    setLoading(true);

    try {
      const page = reset ? 1 : pageRef.current;

      const res = await fetch(
        `http://127.0.0.1:8081/api/admin/subjects?page=${page}&limit=${LIMIT}&search=${encodeURIComponent(
          search
        )}`
      );

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();

      setSubjects(prev =>
        reset ? data.subjects : [...prev, ...data.subjects]
      );

      if (page >= data.totalPages) {
        setHasMore(false);
      } else {
        pageRef.current = page + 1;
      }
    } catch {
      toast.error("Failed to load subjects");
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  };

  /* 🚀 Initial load */
  useEffect(() => {
    fetchSubjects({ reset: true });
  }, []);

  /* 🔍 Search handler (IMPORTANT FIX) */
  useEffect(() => {
    pageRef.current = 1;
    setHasMore(true);
    setSubjects([]); // 🔥 CLEAR OLD DATA

    const delay = setTimeout(() => {
      fetchSubjects({ reset: true });
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  /* ♾ Infinite scroll (DISABLED during search) */
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (isSearchingRef.current) return; // 🔥 BLOCK APPEND
        fetchSubjects();
      },
      { threshold: 0.25 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore]);

  /* ⬆ Back to top */
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Header onSearch={setSearch} />

      <main className="home-page">
        <div className="home-container">
          <div className="home-hero">
            <h1>Choose Your Subject</h1>
            <p>Practice, improve & crack your exams 🚀</p>
          </div>

          <section className="subjects-grid">
            {subjects.map(sub => (
              <SubjectCard key={sub._id} subject={sub} search={search} />
            ))}
          </section>

          {loading && <div className="home-loading">Loading...</div>}

          {!loading && subjects.length === 0 && (
            <div className="home-loading">No subject found</div>
          )}

          {hasMore && !isSearchingRef.current && (
            <div ref={observerRef} className="scroll-sentinel" />
          )}
        </div>
      </main>

      {showTop && (
        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <FiArrowUp size={22} />
        </button>
      )}
    </>
  );
}

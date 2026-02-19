import React, { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function EditSubject() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const token =
    localStorage.getItem("admin_token") ||
    sessionStorage.getItem("admin_token");

  /* ===============================
     🔐 AUTH GUARD
  =============================== */
  useEffect(() => {
    if (!token) {
      toast.error("Session expired. Please login again.");
      navigate("/admin/login", { replace: true });
    }
  }, [token, navigate]);

  /* ===============================
     📥 LOAD SUBJECT
  =============================== */
  useEffect(() => {
    if (!token || !id) return;

    const controller = new AbortController();

    const loadSubject = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `https://quiz-backend-gamma.vercel.app/api/admin/subjects/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load subject");
        }

        setName(data.name || "");
        setDescription(data.description || "");
      } catch (err) {
        if (err.name !== "AbortError") {
          toast.error(err.message || "Unable to load subject");
          navigate("/subjects", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    loadSubject();
    return () => controller.abort();
  }, [id, token, navigate]);

  /* ===============================
     🔁 UPDATE SUBJECT
  =============================== */
  const updateSubject = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Subject name is required");
      return;
    }

    try {
      setUpdating(true);

      const res = await fetch(
        `https://quiz-backend-gamma.vercel.app/api/admin/subjects/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Update failed");
      }

      toast.success("Update Subject Successfully");

      /* 🔥 FORCE SUBJECT LIST REFRESH */
      navigate("/subjects", {
        replace: true,
        state: { refresh: true }, // ⭐ IMPORTANT
      });
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  /* ===============================
     ⏳ LOADING UI
  =============================== */
  if (loading) {
    return (
      <div className="layout">
        <Sidebar />
        <main className="main">
          <Topbar title="Edit Subject" />
          <div className="content">
            <div className="card-admin text-center">
              <h5>Loading subject...</h5>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ===============================
     🎨 UI
  =============================== */
  return (
    <div className="layout">
      <Sidebar />

      <main className="main">
        <Topbar title="Edit Subject" />

        <div className="content">
          <div className="card-admin">
            <h4>Edit Subject</h4>

            <form onSubmit={updateSubject} className="mt-3">
              <div className="mb-3">
                <label className="form-label fw-bold">
                  Subject Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter subject name"
                  autoFocus
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  Description
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Enter description"
                />
              </div>

              <button
                className="btn btn-primary"
                disabled={updating}
              >
                {updating ? "Updating..." : "Update Subject"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

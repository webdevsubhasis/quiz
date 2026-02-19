import React, { useState } from "react";
import Topbar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/addsubject.css";

export default function AddSubject() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return toast.error("Subject name required");

    try {
      setSaving(true);

      const res = await fetch(
        "https://quiz-frontend-psi-six.vercel.app/api/admin/subjects",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim().toLowerCase(),
            description,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      toast.success("Subject added");
      navigate("/subjects");
    } catch (err) {
      toast.error(err.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="layout">
      <Sidebar />

      <main className="main">
        <Topbar title="Add Subject" />

        <div className="content">
          <div className="card-admin add-subject-card">
            <h4>Add New Subject</h4>

            <form onSubmit={submit}>
              <label>Subject Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter subject name"
              />

              <label>Description</label>
              <textarea
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />

              <div className="form-actions">
                <button className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Submit"}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate("/subjects")}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

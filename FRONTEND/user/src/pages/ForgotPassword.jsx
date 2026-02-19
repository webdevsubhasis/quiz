import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; // 🔥 same toast lib as login
import "../styles/forgotPassword.css";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your registered email");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "http://127.0.0.1:8081/api/auth/forgot-password", // ✅ USER API
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to send OTP");
        return;
      }

      /* ✅ Store email safely for OTP page */
      sessionStorage.setItem("reset_email", email);
      sessionStorage.setItem("reset_type", "user");

      toast.success("OTP sent to your registered email 📩");

      setEmail("");
      navigate("/otp"); // ✅ SAME OTP PAGE
    } catch (error) {
      console.error(error);
      toast.error("Server error. Please try again later");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-wrapper">
      <div className="forgot-card">
        <h2 className="forgot-title">Forgot Password</h2>

        <p className="forgot-subtitle">
          Enter your registered email to receive an OTP
        </p>

        <form onSubmit={submit}>
          {/* EMAIL */}
          <div className="input-group">
            <label>Email address</label>
            <input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="forgot-btn"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP →"}
          </button>

          {/* BACK */}
          <div className="back-login">
            Remember your password?
            <span onClick={() => navigate("/login")}>
              {" "}Back to Login
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

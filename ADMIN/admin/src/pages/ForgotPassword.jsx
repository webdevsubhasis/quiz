import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/forgotPassword.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your registered email");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "https://quiz-backend-gamma.vercel.app/api/auth/forgot-password",
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
        setLoading(false);
        return;
      }

      // ✅ Store ONLY email (safe)
      sessionStorage.setItem("reset_email", email);

      toast.success("OTP sent to your registered email");

      setEmail("");
      navigate("/otp");
    } catch (err) {
      console.error(err);
      toast.error("Server error. Please try again");
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
          <div className="input-group">
            <label>Email address</label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="forgot-btn" disabled={loading}>
            {loading ? "Sending OTP..." : "Send OTP →"}
          </button>

          <div className="back-login">
            Remember your password?
            <span onClick={() => navigate("/login")}> Back to Login</span>
          </div>
        </form>
      </div>
    </div>
  );
}

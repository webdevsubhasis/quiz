import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../styles/resetPassword.css";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔐 TOKEN FROM OTP VERIFY STEP
  const resetToken = sessionStorage.getItem("reset_token");

  // 🚫 BLOCK DIRECT ACCESS
  useEffect(() => {
    if (!resetToken) {
      toast.error("Session expired. Please restart password reset");
      navigate("/forgot-password");
    }
  }, [resetToken, navigate]);

  // 🔐 PASSWORD STRENGTH CHECK
  const getStrength = () => {
    if (password.length < 6) return "Weak";
    if (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /\d/.test(password) &&
      /[@$!%*?&#]/.test(password)
    )
      return "Strong";
    return "Medium";
  };

  // 🔁 SUBMIT RESET
  const submit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    if (getStrength() === "Weak") {
      toast.error("Password is too weak");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:8081/api/auth/reset-password", // ✅ USER API
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resetToken}`,
          },
          body: JSON.stringify({ newPassword: password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Password reset failed");
      }

      // 🔥 CLEAR SESSION
      sessionStorage.removeItem("reset_token");
      sessionStorage.removeItem("reset_email");
      sessionStorage.removeItem("reset_type");

      toast.success("Password reset successful 🎉");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      toast.error(error.message || "Server error. Try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-wrapper">
      <div className="reset-card">
        <h2 className="reset-title">Reset Password</h2>
        <p className="reset-subtitle">
          Create a strong new password for your account
        </p>

        <form onSubmit={submit}>
          {/* NEW PASSWORD */}
          <div className="password-box">
            <label>New Password</label>

            <div className="password-input">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />

              <span
                className="eye-icon"
                onClick={() => setShow(!show)}
              >
                {show ? "🙈" : "👁️"}
              </span>
            </div>

            <div className={`strength ${getStrength().toLowerCase()}`}>
              Strength: {getStrength()}
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="password-box">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
              required
            />
          </div>

          <button className="reset-btn" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password →"}
          </button>
        </form>
      </div>
    </div>
  );
}

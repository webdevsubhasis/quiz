import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/otp.css";

export default function OtpVerification() {
  const navigate = useNavigate();
  const inputsRef = useRef([]);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(50);
  const [loading, setLoading] = useState(false);

  const email = sessionStorage.getItem("reset_email");

  // 🚫 Block direct access
  useEffect(() => {
    if (!email) {
      toast.error("Session expired. Please retry");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  /* ⏱ Countdown */
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* INPUT HANDLER */
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  /* VERIFY OTP */
  const submit = async (e) => {
    e.preventDefault();

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      toast.error("Enter full 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "https://quiz-backend-gamma.vercel.app/api/auth/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp: enteredOtp }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "OTP verification failed");
        return;
      }

      // ✅ SAVE RESET TOKEN (NOT EMAIL)
      sessionStorage.setItem("reset_token", data.resetToken);
      sessionStorage.removeItem("reset_email");

      toast.success("OTP verified");
      navigate("/reset-password");
    } catch {
      toast.error("Server error. Try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-wrapper">
      <div className="otp-card">
        <h2 className="otp-title">OTP Verification</h2>
        <p className="otp-subtitle">
          Enter the 6-digit OTP sent to your email
        </p>

        <form onSubmit={submit}>
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
          </div>

          <div className="timer">
            {timeLeft > 0
              ? `OTP expires in ${timeLeft}s`
              : "OTP expired"}
          </div>

          <button
            className="otp-btn"
            disabled={loading || timeLeft === 0}
          >
            {loading ? "Verifying..." : "Verify OTP →"}
          </button>
        </form>
      </div>
    </div>
  );
}

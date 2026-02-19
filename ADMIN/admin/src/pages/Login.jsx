import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser } from "../services/authApi";
import "../styles/login.css";

const TOKEN_EXPIRY_TIME = 60 * 60 * 1000; // ⏳ 1 hour

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  /* 🔁 Load remembered email + password on mount */
  useEffect(() => {
    const remembered = localStorage.getItem("admin_remember") === "true";

    if (remembered) {
      setEmail(localStorage.getItem("admin_email") || "");
      setPassword(localStorage.getItem("admin_password") || "");
      setRemember(true);
    }
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await loginUser({ email, password });

      if (response.status === 200) {
        const expiry = Date.now() + TOKEN_EXPIRY_TIME;

        /* 🔐 Save token + expiry */
        localStorage.setItem("admin_token", response.data.token);
        localStorage.setItem("admin_token_expiry", expiry);

        /* 💾 Remember credentials ONLY if checked */
        if (remember) {
          localStorage.setItem("admin_email", email);
          localStorage.setItem("admin_password", password);
          localStorage.setItem("admin_remember", "true");
        }

        toast.success("Welcome back Admin 🚀");
        navigate("/dashboard");
      } else {
        setError("Invalid email or password");
      }
    } catch {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-title">Admin Login</h2>

        <form onSubmit={submit}>
          {/* EMAIL */}
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

          {/* PASSWORD */}
          <div className="input-group">
            <label>Password</label>
            <div className="password-box">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          {/* OPTIONS */}
          <div className="options-row">
            <label className="remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setRemember(checked);

                  /* ❌ Remove ONLY when user unchecks */
                  if (!checked) {
                    localStorage.removeItem("admin_email");
                    localStorage.removeItem("admin_password");
                    localStorage.removeItem("admin_remember");
                  }
                }}
              />
              <span>Remember Me</span>
            </label>

            <span
              className="forgot"
              role="button"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </span>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" className="login-btn">
            Login →
          </button>
        </form>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import "../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  /* 🔁 Redirect if already logged in */
  useEffect(() => {
    const token =
      localStorage.getItem("user_token") ||
      sessionStorage.getItem("user_token");

    if (token) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  /* 🔁 Load remembered email only */
  useEffect(() => {
    const remembered = localStorage.getItem("remember_email") === "true";

    if (remembered) {
      setEmail(localStorage.getItem("remembered_email") || "");
      setRemember(true);
    }
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8081/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid email or password");
        return;
      }

      /* ✅ CHOOSE STORAGE BASED ON REMEMBER */
      const storage = remember ? localStorage : sessionStorage;

      /* 🧹 Clear both first (IMPORTANT) */
      localStorage.removeItem("user_token");
      sessionStorage.removeItem("user_token");

      /* 🔐 Save auth data */
      storage.setItem("user_token", data.token);
      storage.setItem("user_role", data.user.role);
      storage.setItem("user_name", data.user.fullname);
      storage.setItem("user_email", data.user.email);

      /* 💾 Remember email only */
      if (remember) {
        localStorage.setItem("remembered_email", email);
        localStorage.setItem("remember_email", "true");
      } else {
        localStorage.removeItem("remembered_email");
        localStorage.removeItem("remember_email");
      }

      toast.success(`Welcome back ${data.user.fullname} 🚀`);

      /* 🔁 Redirect */
      const redirectTo = location.state?.from || "/";
      navigate(redirectTo, { replace: true });

    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-title">User Login</h2>

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
                onChange={(e) => setRemember(e.target.checked)}
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

          <div className="register">
            Don’t have an account?
            <span onClick={() => navigate("/register")}> Register</span>
          </div>
        </form>
      </div>
    </div>
  );
}

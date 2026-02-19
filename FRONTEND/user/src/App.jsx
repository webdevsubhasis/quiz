import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

/* ================= USER PAGES ================= */
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Review from "./pages/Review";
import ForgotPassword from "./pages/ForgotPassword";
import OTP from "./pages/OtpVerification";
import ResetPassword from "./pages/ResetPassword";

/* ================= COMPONENTS ================= */
import Footer from "./components/Footer";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <>
      {/* ================= TOAST NOTIFICATIONS ================= */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1e293b",
            color: "#ffffff",
            fontSize: "14px",
          },
        }}
      />

      {/* ================= APP CONTENT ================= */}
      <div className="app-content">
        <div className="page-wrapper">
          <Routes>
            {/* ===== PUBLIC ROUTES ===== */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ===== PASSWORD RECOVERY ===== */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp" element={<OTP />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* ===== PROTECTED ROUTES ===== */}
            <Route
              path="/quiz/:subjectId"
              element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              }
            />

            <Route
              path="/result"
              element={
                <ProtectedRoute>
                  <Result />
                </ProtectedRoute>
              }
            />

            <Route
              path="/review"
              element={
                <ProtectedRoute>
                  <Review />
                </ProtectedRoute>
              }
            />

            {/* ===== FALLBACK ===== */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <Footer />
    </>
  );
}

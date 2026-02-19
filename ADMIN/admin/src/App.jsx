import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

/* Auth Pages */
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import OtpVerification from "./pages/OtpVerification";
import ResetPassword from "./pages/ResetPassword";

/* Admin Pages */
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import AddSubject from "./pages/AddSubject";
import EditSubject from "./pages/EditSubject";
import Questions from "./pages/Questions";
import AddQuestion from "./pages/AddQuestion";
import EditQuestion from "./pages/EditQuestion";
import Users from "./pages/Users";
import Settings from "./pages/Settings";

/* Protected Route */
import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <>
      {/* 🔥 REQUIRED FOR react-hot-toast */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          success: {
            duration: 3000,
          },
          error: {
            duration: 4000,
          },
        }}
      />

      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp" element={<OtpVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ================= ADMIN / PROTECTED ROUTES ================= */}

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Subjects */}
        <Route
          path="/subjects"
          element={
            <PrivateRoute>
              <Subjects />
            </PrivateRoute>
          }
        />

        <Route
          path="/subjects/add"
          element={
            <PrivateRoute>
              <AddSubject />
            </PrivateRoute>
          }
        />

        <Route
          path="/subjects/edit/:id"
          element={
            <PrivateRoute>
              <EditSubject />
            </PrivateRoute>
          }
        />

        {/* Questions */}
        <Route
          path="/questions"
          element={
            <PrivateRoute>
              <Questions />
            </PrivateRoute>
          }
        />

        <Route
          path="/questions/add"
          element={
            <PrivateRoute>
              <AddQuestion />
            </PrivateRoute>
          }
        />

        <Route
          path="/questions/edit/:id"
          element={
            <PrivateRoute>
              <EditQuestion />
            </PrivateRoute>
          }
        />

        {/* Users */}
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <Users />
            </PrivateRoute>
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

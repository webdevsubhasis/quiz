import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  // ✅ Support Remember Me (local + session)
  const token =
    localStorage.getItem("user_token") ||
    sessionStorage.getItem("user_token");

  console.log("ProtectedRoute token:", token);

  // ❌ Not logged in
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // ✅ Logged-in user can access quiz pages
  return children;
}

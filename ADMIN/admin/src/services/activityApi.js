import { getJSON } from "./authApi";

export async function getAdminActivity() {
  const token = localStorage.getItem("admin_token");

  const res = await fetch("https://quiz-backend-gamma.vercel.app/api/admin/activities", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to load activity");
  return res.json();
}

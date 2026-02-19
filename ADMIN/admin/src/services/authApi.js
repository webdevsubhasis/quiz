// src/services/authApi.js

const API_URL = "http://127.0.0.1:8081/api";


/* ================= TOKEN HELPERS ================= */
function getToken() {
  return (
    localStorage.getItem("admin_token") ||
    sessionStorage.getItem("admin_token") ||
    localStorage.getItem("user_token") ||
    sessionStorage.getItem("user_token")
  );
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ================= RESPONSE HANDLER ================= */
async function handleResponse(res) {
  if (res.status === 401) {
    logout(); // auto logout if token expired
    throw new Error("Unauthorized");
  }
  return res.json();
}

/* ================= AUTH ================= */
export async function registerUser(userData) {
  try {
    const res = await fetch(`${API_URL}/admin/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    return { status: res.status, data };
  } catch {
    return {
      status: 500,
      data: { message: "Server connection failed" },
    };
  }
}

export async function loginUser(credentials) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const data = await res.json();
  return { status: res.status, data };
}

export function logout() {
  localStorage.removeItem("admin_token");
  sessionStorage.removeItem("admin_token");
  localStorage.removeItem("user_token");
  sessionStorage.removeItem("user_token");
  localStorage.removeItem("user_role");
  sessionStorage.removeItem("user_role");

  window.location.href = "/login";
}

/* ================= API METHODS ================= */
export async function getJSON(path) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

export async function postJSON(path, data) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function putJSON(path, data) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function del(path) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  return handleResponse(res);
}

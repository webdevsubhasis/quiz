import { API_BASE_URL } from "../config/api";

const apiClient = async (endpoint, method = "GET", body = null) => {
    try {
        // 🔥 FIX: check BOTH storages
        const token =
            localStorage.getItem("user_token") ||
            sessionStorage.getItem("user_token");

        const res = await fetch(`${API_BASE_URL}/api${endpoint}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            ...(body && { body: JSON.stringify(body) }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "API Error");
        }

        return data;

    } catch (error) {
        console.error("API ERROR:", error.message);
        throw error;
    }
};

export default apiClient;
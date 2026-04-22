import apiClient from "./apiClient";

// ✅ submit exam
export const submitSet = async ({ setId, score, total }) => {
    return await apiClient("/sets/submit", "POST", {
        setId,
        score,
        total,
    });
};

// ✅ dashboard
export const getDashboard = async () => {
    return await apiClient("/sets/dashboard");
};

// ✅ recent
export const getRecentSets = async () => {
    return await apiClient("/sets/recent");
};

// ✅ popular
export const getPopularSets = async () => {
    return await apiClient("/sets/popular");
};

// ✅ subject sets
export const getSetsBySubject = async (subjectId) => {
    return await apiClient(`/sets/${subjectId}`);
};
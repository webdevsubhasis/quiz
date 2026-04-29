import apiClient from "./apiClient";

// 🔹 Get all categories with subjects
export const fetchCategories = async () => {
  return await apiClient("/categories/with-subjects");
};

export const getCategoryById = async (id) => {
  return await apiClient(`/categories/${id}`);
};
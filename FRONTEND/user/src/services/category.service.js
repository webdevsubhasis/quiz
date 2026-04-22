import apiClient from "./apiClient";

// 🔹 Get all categories with subjects
export const fetchCategories = async () => {
  return await apiClient("/categories/with-subjects");
};

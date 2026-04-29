import apiClient from "./apiClient";

export const searchAll = (query) =>
    apiClient(`/search?q=${query}`);
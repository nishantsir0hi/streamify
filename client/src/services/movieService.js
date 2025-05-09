import axios from "axios";

// Base API URL - using environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://streamify-2.onrender.com/api/movies";
console.log("📡 API URL:", API_BASE_URL);

/**
 * Get all movies.
 * @returns {Promise<Array>} Array of movie objects
 */
export const getMovies = async () => {
  try {
    console.log("📥 Fetching movies from:", API_BASE_URL);
    const response = await axios.get(API_BASE_URL);
    console.log("✅ Movies fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch movies:", error.message, error.response?.data);
    throw error;
  }
};

/**
 * Upload a new movie file with a title and thumbnail.
 * @param {string} title - Movie title
 * @param {File} file - Movie file (e.g., .mp4)
 * @param {File} thumbnail - Thumbnail image file
 * @returns {Promise<void>}
 */
export const uploadMovie = async (title, file, thumbnail) => {
  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);
    formData.append("thumbnail", thumbnail);

    const uploadUrl = `${API_BASE_URL}/upload`;
    console.log("⏫ Uploading movie to:", uploadUrl);

    const response = await axios.post(uploadUrl, formData, {
      headers: { 
        "Content-Type": "multipart/form-data"
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload Progress: ${percentCompleted}%`);
      }
    });

    console.log("✅ Movie uploaded successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Movie upload failed:", error.message, error.response?.data);
    throw error;
  }
};

/**
 * Delete a movie by ID.
 * @param {string} id - Movie ID
 * @returns {Promise<void>}
 */
export const deleteMovie = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`);
    console.log("✅ Movie deleted successfully");
  } catch (error) {
    console.error("❌ Movie deletion failed:", error.message);
    throw error;
  }
};

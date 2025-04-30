import axios from "axios";

// Base API URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL;
console.log("📡 API URL:", API_BASE_URL); // Debug log

/**
 * Get all movies.
 * @returns {Promise<Array>} Array of movie objects
 */
export const getMovies = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/movies`);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch movies:", error.message);
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

    const uploadUrl = `${API_BASE_URL}/movies/upload`;
    console.log("⏫ Uploading movie to:", uploadUrl);

    await axios.post(uploadUrl, formData, {
      headers: { 
        "Content-Type": "multipart/form-data"
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload Progress: ${percentCompleted}%`);
      }
    });

    console.log("✅ Movie uploaded successfully");
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
    await axios.delete(`${API_BASE_URL}/movies/${id}`);
    console.log("✅ Movie deleted successfully");
  } catch (error) {
    console.error("❌ Movie deletion failed:", error.message);
    throw error;
  }
};

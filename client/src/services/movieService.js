import axios from "axios";

// Base API URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL;
console.log("📡 API URL:", API_BASE_URL); // Debug log

/**
 * Fetch all movies from the API.
 * @returns {Promise<Array>} List of movies
 */
export const getMovies = async () => {
  try {
    console.log("📥 Fetching movies from:", API_BASE_URL);
    const response = await axios.get(API_BASE_URL);
    console.log("✅ Movies fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch movies:", error.message);
    throw error;
  }
};

/**
 * Upload a new movie file with a title.
 * @param {string} title - Movie title
 * @param {File} file - Movie file (e.g., .mp4)
 * @returns {Promise<void>}
 */
export const uploadMovie = async (title, file) => {
  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    const uploadUrl = `${API_BASE_URL}/upload`;
    console.log("⏫ Uploading movie to:", uploadUrl);

    await axios.post(uploadUrl, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("✅ Movie uploaded successfully");
  } catch (error) {
    console.error("❌ Movie upload failed:", error.message);
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
    const deleteUrl = `${API_BASE_URL}/${id}`;
    console.log("🗑 Deleting movie from:", deleteUrl);

    await axios.delete(deleteUrl);
    console.log("✅ Movie deleted successfully");
  } catch (error) {
    console.error("❌ Failed to delete movie:", error.message);
    throw error;
  }
};

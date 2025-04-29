import axios from "axios";

const API = import.meta.env.VITE_API_URL;
console.log("API URL:", API); // Debug log

export const getMovies = async () => {
  try {
    console.log("Fetching movies from:", API); // Debug log
    const res = await axios.get(API);
    console.log("Movies response:", res.data); // Debug log
    return res.data;
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw error;
  }
};

export const uploadMovie = async (title, file) => {
  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);
    console.log("Uploading movie to:", `${API}/upload`); // Debug log
    await axios.post(`${API}/upload`, formData);
  } catch (error) {
    console.error("Error uploading movie:", error);
    throw error;
  }
};

export const deleteMovie = async (id) => {
  try {
    console.log("Deleting movie from:", `${API}/${id}`); // Debug log
    await axios.delete(`${API}/${id}`);
  } catch (error) {
    console.error("Error deleting movie:", error);
    throw error;
  }
};

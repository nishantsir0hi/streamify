import { useEffect, useState } from "react";
import { uploadMovie, getMovies, deleteMovie } from "../services/movieService";

const AdminDashboard = () => {
  const [movies, setMovies] = useState([]);
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const data = await getMovies();
      setMovies(data);
    } catch (err) {
      setError("Failed to fetch movies. Check the console for details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !thumbnail || !title.trim()) {
      setError("Title, video file, and thumbnail are required.");
      return;
    }

    try {
      setLoading(true);
      await uploadMovie(title.trim(), file, thumbnail);
      setTitle("");
      setFile(null);
      setThumbnail(null);
      await fetchMovies();
    } catch (err) {
      setError("Upload failed. Check the console for details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;

    try {
      setLoading(true);
      await deleteMovie(id);
      await fetchMovies();
    } catch (err) {
      setError("Deletion failed. Check the console for details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-600 rounded shadow">
          {error}
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-4 mb-8 bg-gray-900 p-4 rounded shadow">
        <input
          type="text"
          placeholder="Movie title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 focus:outline-none"
        />
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Video File</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept="video/mp4,video/mov,video/avi,video/mkv"
            className="w-full p-2 bg-gray-700 rounded"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Thumbnail Image</label>
          <input
            type="file"
            onChange={(e) => setThumbnail(e.target.files[0])}
            accept="image/jpeg,image/png,image/webp"
            className="w-full p-2 bg-gray-700 rounded"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 bg-pink-600 rounded hover:bg-pink-700 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload Movie"}
        </button>
      </form>

      <h2 className="text-2xl font-semibold mb-4">Uploaded Movies</h2>

      {loading && movies.length === 0 ? (
        <div className="text-center">Loading movies...</div>
      ) : movies.length === 0 ? (
        <div className="text-center text-gray-400">No movies uploaded yet.</div>
      ) : (
        <div className="space-y-4">
          {movies.map((movie) => (
            <div key={movie._id} className="bg-gray-800 p-4 rounded shadow">
              <div className="flex items-center gap-4">
                <img
                  src={movie.thumbnailUrl}
                  alt={movie.title}
                  className="w-32 h-20 object-cover rounded"
                />
                <div className="flex-grow">
                  <h3 className="text-xl font-bold">{movie.title}</h3>
                  <p className="text-gray-400 text-sm">
                    {new Date(movie.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(movie._id)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-700 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;


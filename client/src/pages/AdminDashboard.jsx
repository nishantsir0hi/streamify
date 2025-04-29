import { useEffect, useState } from "react";
import { uploadMovie, getMovies, deleteMovie } from "../services/movieService";
import VideoPlayer from "../components/VideoPlayer";

const AdminDashboard = () => {
  const [movies, setMovies] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMovies();
      setMovies(data);
    } catch (err) {
      setError("Failed to fetch movies. Please check the console for details.");
      console.error("Error in fetchMovies:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return;
    try {
      setLoading(true);
      setError(null);
      await uploadMovie(title, file);
      setTitle("");
      setFile(null);
      await fetchMovies();
    } catch (err) {
      setError("Failed to upload movie. Please check the console for details.");
      console.error("Error in handleUpload:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await deleteMovie(id);
      await fetchMovies();
    } catch (err) {
      setError("Failed to delete movie. Please check the console for details.");
      console.error("Error in handleDelete:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-500 text-white rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleUpload} className="flex flex-col gap-4 mb-8">
        <input
          type="text"
          placeholder="Movie title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-2 rounded bg-gray-700 focus:outline-none"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          accept="video/mp4"
          className="p-2 bg-gray-700 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="p-3 bg-pink-600 rounded hover:bg-pink-700"
        >
          {loading ? "Uploading..." : "Upload Movie"}
        </button>
      </form>

      <h2 className="text-2xl font-semibold mb-4">Uploaded Movies</h2>
      {loading ? (
        <div className="text-center">Loading movies...</div>
      ) : movies.length === 0 ? (
        <div className="text-center">No movies uploaded yet</div>
      ) : (
        <div className="grid gap-8">
          {movies.map((movie) => (
            <div key={movie._id} className="bg-gray-800 p-4 rounded shadow">
              <h3 className="text-xl font-bold mb-2">{movie.title}</h3>
              <VideoPlayer filename={movie.filename} />
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => handleDelete(movie._id)}
                  className="px-3 py-1 bg-red-500 rounded hover:bg-red-700"
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

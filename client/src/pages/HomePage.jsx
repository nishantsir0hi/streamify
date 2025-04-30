import { useEffect, useState } from "react";
import { getMovies } from "../services/movieService";
import VideoPlayer from "../components/VideoPlayer";
import './HomePage.css';

const HomePage = () => {
  const [movies, setMovies] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const data = await getMovies();
        setMovies(data);
        // Set the first movie as featured
        if (data.length > 0) {
          setFeaturedMovie(data[0]);
        }
      } catch (err) {
        setError("Failed to fetch movies. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-text">{error}</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Video Player Section */}
      {selectedMovie && (
        <div className="video-player-section">
          <div className="video-player-container">
            <VideoPlayer videoUrl={selectedMovie.url} title={selectedMovie.title} />
            <button 
              className="close-button"
              onClick={() => setSelectedMovie(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      {featuredMovie && !selectedMovie && (
        <div className="hero-section">
          <div className="hero-overlay" />
          <VideoPlayer videoUrl={featuredMovie.url} title={featuredMovie.title} />
          <div className="hero-content">
            <h1 className="hero-title">{featuredMovie.title}</h1>
            <div className="hero-buttons">
              <button className="play-button">▶ Play</button>
              <button className="info-button">ℹ More Info</button>
            </div>
          </div>
        </div>
      )}

      {/* Movie Rows */}
      <div className="movie-sections">
        {/* Trending Now */}
        <section className="movie-row">
          <h2 className="movie-row-title">Trending Now</h2>
          <div className="movie-grid">
            {movies.map((movie) => (
              <div 
                key={movie._id} 
                className="movie-card"
                onClick={() => handleMovieClick(movie)}
              >
                <img
                  src={movie.thumbnailUrl}
                  alt={movie.title}
                  className="movie-thumbnail"
                />
                <div className="movie-overlay">
                  <button className="play-button">Play</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Continue Watching */}
        <section className="movie-row">
          <h2 className="movie-row-title">Continue Watching</h2>
          <div className="movie-grid">
            {movies.slice(5, 10).map((movie) => (
              <div 
                key={movie._id} 
                className="movie-card"
                onClick={() => handleMovieClick(movie)}
              >
                <img
                  src={movie.thumbnailUrl}
                  alt={movie.title}
                  className="movie-thumbnail"
                />
                <div className="movie-overlay">
                  <button className="play-button">Play</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular on Streamify */}
        <section className="movie-row">
          <h2 className="movie-row-title">Popular on Streamify</h2>
          <div className="movie-grid">
            {movies.slice(10, 15).map((movie) => (
              <div 
                key={movie._id} 
                className="movie-card"
                onClick={() => handleMovieClick(movie)}
              >
                <img
                  src={movie.thumbnailUrl}
                  alt={movie.title}
                  className="movie-thumbnail"
                />
                <div className="movie-overlay">
                  <button className="play-button">Play</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage; 
import { useRef, useEffect, useState } from "react";

const VideoPlayer = ({ filename }) => {
  const videoRef = useRef();
  const [currentTime, setCurrentTime] = useState(
    localStorage.getItem(filename) ? parseFloat(localStorage.getItem(filename)) : 0
  );
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleTimeUpdate = () => {
    localStorage.setItem(filename, videoRef.current.currentTime);
  };

  const handleError = (e) => {
    console.error('Video error:', e);
    setError('Error loading video. Please try again later.');
    setLoading(false);
  };

  const handleLoadStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleLoadedData = () => {
    setLoading(false);
  };

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="text-white">Loading video...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-50">
          <div className="text-white">{error}</div>
        </div>
      )}
      <video
        ref={videoRef}
        controls
        onTimeUpdate={handleTimeUpdate}
        onError={handleError}
        onLoadStart={handleLoadStart}
        onLoadedData={handleLoadedData}
        className="w-full rounded"
      >
        <source src={`https://streamify-backend.onrender.com/uploads/${filename}`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;

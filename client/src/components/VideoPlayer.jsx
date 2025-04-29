import { useRef, useEffect, useState } from "react";

const VideoPlayer = ({ filename }) => {
  const videoRef = useRef();
  const [currentTime, setCurrentTime] = useState(
    localStorage.getItem(filename) ? parseFloat(localStorage.getItem(filename)) : 0
  );
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

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
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.load();
        }
      }, 1000 * retryCount); // Exponential backoff
    } else {
      setError('Error loading video. Please try refreshing the page or check your internet connection.');
      setLoading(false);
    }
  };

  const handleLoadStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleLoadedData = () => {
    setLoading(false);
    setRetryCount(0);
  };

  const handleStalled = () => {
    console.log('Video stalled, attempting to recover...');
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const handleWaiting = () => {
    setLoading(true);
  };

  const handlePlaying = () => {
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
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onError={handleError}
        onLoadStart={handleLoadStart}
        onLoadedData={handleLoadedData}
        onStalled={handleStalled}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        className="w-full rounded"
      >
        <source 
          src={`https://streamify-2.onrender.com/uploads/${filename}`} 
          type="video/mp4" 
        />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;

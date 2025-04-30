import { useRef, useEffect, useState } from "react";
import "./VideoPlayer.css";

const VideoPlayer = ({ videoUrl, title }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [networkState, setNetworkState] = useState("UNKNOWN");

  const localStorageKey = `videoTime_${videoUrl}`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    console.log('Video URL:', videoUrl); // Debug log

    const networkStates = ["EMPTY", "IDLE", "LOADING", "NO_SOURCE"];

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
      console.log('Video loading started');
    };

    const handleLoadedMetadata = () => {
      console.log('Video metadata loaded');
      setDuration(video.duration || 0);
      const savedTime = parseFloat(localStorage.getItem(localStorageKey));
      if (!isNaN(savedTime)) {
        video.currentTime = savedTime;
      }
    };

    const handleCanPlay = () => {
      console.log('Video can play');
      setIsLoading(false);
    };

    const handlePlaying = () => {
      console.log('Video playing');
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      localStorage.setItem(localStorageKey, video.currentTime);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const percent = (bufferedEnd / video.duration) * 100;
        setBufferedPercent(isNaN(percent) ? 0 : percent);
      }
    };

    const handleError = (e) => {
      const err = e?.target?.error;
      console.error('Video error:', err);
      setError(`Video error: ${err?.message || "Unknown error"}`);
      setIsLoading(false);
    };

    const handleNetworkChange = () => {
      const state = video.networkState;
      console.log('Network state changed:', networkStates[state] || "UNKNOWN");
      setNetworkState(networkStates[state] || "UNKNOWN");
    };

    // Event listeners
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("progress", handleProgress);
    video.addEventListener("error", handleError);
    video.addEventListener("stalled", handleNetworkChange);
    video.addEventListener("waiting", handleNetworkChange);

    return () => {
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("error", handleError);
      video.removeEventListener("stalled", handleNetworkChange);
      video.removeEventListener("waiting", handleNetworkChange);
    };
  }, [videoUrl]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.error("Play error:", err);
          setError("Unable to play the video. Try again.");
        });
      }
    }

    setIsPlaying(!isPlaying);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="video-player">
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <p>Network: {networkState}</p>
          <p>URL: {videoUrl}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {isLoading && <div className="loading">Loading video...</div>}

      <video
        ref={videoRef}
        src={videoUrl}
        preload="auto"
        playsInline
        crossOrigin="anonymous"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="video-element"
        onError={(e) => {
          console.error('Video error:', e.target.error);
          setError(`Video error: ${e.target.error?.message || 'Failed to load video'}`);
        }}
      />

      <div className="video-controls">
        <button onClick={togglePlay} className="play-toggle">
          {isPlaying ? "⏸ Pause" : "▶ Play"}
        </button>
        <div className="time-info">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        <div className="buffer-progress">
          <div className="buffer-bar" style={{ width: `${bufferedPercent}%` }} />
        </div>
      </div>

      <div className="video-title">
        <h2>{title}</h2>
      </div>
    </div>
  );
};

export default VideoPlayer;


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
  const [canPlay, setCanPlay] = useState(false);
  const [networkState, setNetworkState] = useState(null);

  const localStorageKey = `videoTime_${videoUrl}`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const states = ['NETWORK_EMPTY', 'NETWORK_IDLE', 'NETWORK_LOADING', 'NETWORK_NO_SOURCE'];

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      const savedTime = parseFloat(localStorage.getItem(localStorageKey));
      if (!isNaN(savedTime)) {
        video.currentTime = savedTime;
      }
    };

    const handleCanPlay = () => {
      setCanPlay(true);
      setIsLoading(false);
    };

    const handlePlaying = () => {
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      localStorage.setItem(localStorageKey, video.currentTime);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBufferedPercent((bufferedEnd / video.duration) * 100);
      }
    };

    const handleError = (e) => {
      const err = e?.target?.error;
      console.error("Video error:", err);
      setError(`Video playback error: ${err?.message || 'Unknown error'}`);
      setIsLoading(false);
    };

    const handleNetworkChange = () => {
      setNetworkState(states[video.networkState] || "UNKNOWN");
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
          setError("Unable to play video. Try again.");
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
          {networkState && <p>Network State: {networkState}</p>}
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {isLoading && !canPlay && <div className="loading">Loading video...</div>}

      <video
        ref={videoRef}
        src={videoUrl}
        controls
        preload="auto"
        playsInline
        crossOrigin="anonymous"
        className="video-element"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div className="video-info">
        <h2>{title}</h2>
        <div className="time-info">
          <span>{formatTime(currentTime)}</span>
          <span> / </span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="buffer-progress">
          <div className="buffer-bar" style={{ width: `${bufferedPercent}%` }} />
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;


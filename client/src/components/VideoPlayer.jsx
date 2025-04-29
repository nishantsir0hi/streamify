import { useRef, useEffect, useState } from "react";
import "./VideoPlayer.css";

const VideoPlayer = ({ videoUrl, title }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [networkState, setNetworkState] = useState(null);
  const [buffered, setBuffered] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Preload video metadata
    video.preload = "metadata";

    const handleError = (e) => {
      console.error('Video error:', e.target.error);
      setError(`Error loading video: ${e.target.error?.message || 'Unknown error'}`);
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      console.log('Video load started');
      setIsLoading(true);
      setError(null);
    };

    const handleLoadedMetadata = () => {
      console.log('Video metadata loaded');
      setIsLoading(false);
      setDuration(video.duration);
      
      // Restore previous time after metadata is loaded
      const savedTime = localStorage.getItem(`videoTime_${videoUrl}`);
      if (savedTime) {
        video.currentTime = parseFloat(savedTime);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      localStorage.setItem(`videoTime_${videoUrl}`, video.currentTime);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100);
      }
    };

    const handleNetworkStateChange = () => {
      const states = ['NETWORK_EMPTY', 'NETWORK_IDLE', 'NETWORK_LOADING', 'NETWORK_NO_SOURCE'];
      setNetworkState(states[video.networkState]);
      console.log('Network state:', states[video.networkState]);
    };

    // Add event listeners
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('networkstatechange', handleNetworkStateChange);

    // Cleanup
    return () => {
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('networkstatechange', handleNetworkStateChange);
    };
  }, [videoUrl]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
          setError('Error playing video. Please try again.');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-player">
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <p>Network State: {networkState}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}
      {isLoading && <div className="loading">Loading video...</div>}
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="video-element"
        crossOrigin="anonymous"
        playsInline
        preload="metadata"
      />
      <div className="video-info">
        <h2>{title}</h2>
        <div className="time-info">
          <span>{formatTime(currentTime)}</span>
          <span> / </span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="buffer-progress">
          <div 
            className="buffer-bar" 
            style={{ width: `${buffered}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

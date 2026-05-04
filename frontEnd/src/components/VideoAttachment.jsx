import { useRef, useState, useEffect } from "react";
import downloadIco from "../assets/icons/audioPlayer/download.svg";
import playIco from "../assets/icons/audioPlayer/play.svg";
import pauseIco from "../assets/icons/audioPlayer/pause.svg";
import fullscreenIco from "../assets/icons/openInNewTab.svg";

function formatTime(time) {
  if (isNaN(time)) return "00:00";
  const mins = Math.floor(time / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(time % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

export default function VideoAttachment({ fileUrl }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0); // درصد بافر شده
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setIsBuffering(false);
      updateBuffered();
    };

    const onLoadedMetadata = () => {
      setDuration(video.duration);
      updateBuffered();
    };

    const onProgress = () => {
      updateBuffered();
    };

    const onWaiting = () => {
      setIsBuffering(true);
    };

    const onPlaying = () => {
      setIsBuffering(false);
    };

    function updateBuffered() {
      if (!video.buffered || video.buffered.length === 0) {
        setBuffered(0);
        return;
      }
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const bufferedPercent = (bufferedEnd / video.duration) * 100;
      setBuffered(bufferedPercent);
    }

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("progress", onProgress);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("progress", onProgress);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video.paused || video.ended) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleProgressChange = (e) => {
    const video = videoRef.current;
    const value = Number(e.target.value);
    video.currentTime = value;
    setCurrentTime(value);
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) {
      video.msRequestFullscreen();
    }
  };

  if (!fileUrl) return null;

  return (
    <div className="flex flex-col items-start gap-3 mt-2 p-3 rounded-xl bg-white dark:bg-zinc-900 shadow-md border border-zinc-200 dark:border-zinc-700 max-w-sm w-full relative">
      <div className="w-full overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700 relative">
        <video
          ref={videoRef}
          src={fileUrl}
          preload="metadata"
          className="w-full max-h-96 rounded"
        />

        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
            <svg
              className="animate-spin h-8 w-8 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 w-full">
        {/* Progress bar container */}
        <div
          className="relative w-full h-2 rounded bg-gray-300 dark:bg-zinc-700 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newTime = (clickX / rect.width) * duration;
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
          }}
        >
          {/* Buffered bar */}
          <div
            className="absolute top-0 left-0 h-full bg-gray-400 dark:bg-zinc-500 rounded"
            style={{ width: `${buffered}%` }}
          />
          {/* Played bar */}
          <div
            className="absolute top-0 left-0 h-full bg-blue-600 rounded"
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          />
        </div>

        {/* Times */}
        <div className="flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex justify-between">
          <button
            onClick={togglePlay}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer"
            title={isPlaying ? "Pause" : "Play"}
          >
            <img
              src={isPlaying ? pauseIco : playIco}
              alt="play/pause"
              className="w-4"
            />
          </button>

          <div className="flex gap-2">
            <a
              href={fileUrl}
              download
              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full"
              title="Download"
            >
              <img src={downloadIco} alt="download" className="w-4" />
            </a>
            <button
              onClick={handleFullscreen}
              className="bg-zinc-600 hover:bg-zinc-700 text-white p-2 rounded-full cursor-pointer"
              title="Fullscreen"
            >
              <img src={fullscreenIco} alt="fullscreen" className="w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

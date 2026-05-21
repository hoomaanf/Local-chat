import { useRef, useState, useEffect } from "react";
import { Download, Play, Pause, Maximize, Loader2 } from "lucide-react";

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
  const [buffered, setBuffered] = useState(0);
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

    const onProgress = () => updateBuffered();
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);

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
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 w-full">
        {/* نوار پیشرفت */}
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
          <div
            className="absolute top-0 left-0 h-full bg-gray-400 dark:bg-zinc-500 rounded"
            style={{ width: `${buffered}%` }}
          />
          <div
            className="absolute top-0 left-0 h-full bg-blue-600 rounded"
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          />
        </div>

        {/* زمان */}
        <div className="flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* دکمه‌ها */}
        <div className="flex justify-between">
          <button
            onClick={togglePlay}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>

          <div className="flex gap-2">
            <a
              href={fileUrl}
              download
              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={handleFullscreen}
              className="bg-zinc-600 hover:bg-zinc-700 text-white p-2 rounded-full cursor-pointer transition"
              title="Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

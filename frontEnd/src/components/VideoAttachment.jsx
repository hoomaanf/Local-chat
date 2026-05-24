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
      setBuffered((bufferedEnd / video.duration) * 100);
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
    videoRef.current?.requestFullscreen?.() ||
      videoRef.current?.webkitRequestFullscreen?.() ||
      videoRef.current?.msRequestFullscreen?.();
  };

  if (!fileUrl) return null;

  return (
    <div className="mt-2 rounded-xl overflow-hidden bg-gray-800/50 border border-gray-700/50 max-w-sm w-full shadow-lg">
      {/* ویدیو */}
      <div className="relative bg-black">
        <video
          ref={videoRef}
          src={fileUrl}
          preload="metadata"
          className="w-full max-h-72 object-contain"
          playsInline
        />
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* کنترل‌ها */}
      <div className="p-3 space-y-3">
        {/* نوار پیشرفت */}
        <div
          className="relative w-full h-1.5 bg-gray-700 rounded-full cursor-pointer group/progress"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newTime = (clickX / rect.width) * duration;
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
          }}
        >
          <div
            className="absolute top-0 left-0 h-full bg-gray-500 rounded-full"
            style={{ width: `${buffered}%` }}
          />
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          />
        </div>

        {/* زمان */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* دکمه‌ها */}
        <div className="flex items-center justify-between">
          <button
            onClick={togglePlay}
            className="w-9 h-9 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center transition shadow-lg shadow-blue-500/20 cursor-pointer"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>

          <div className="flex items-center gap-1.5">
            <a
              href={fileUrl}
              download
              className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-full flex items-center justify-center transition cursor-pointer"
              title="Download"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={handleFullscreen}
              className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-full flex items-center justify-center transition cursor-pointer"
              title="Fullscreen"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Download, Loader2 } from "lucide-react";

export default function AudioPlayer({ fileUrl }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };
    const handleTimeUpdate = () => {
      if (!audio.duration) return;
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
      if (audio.buffered.length) {
        setBuffered(
          (audio.buffered.end(audio.buffered.length - 1) / audio.duration) *
            100,
        );
      }
      setIsLoading(false);
    };
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const seekTime = (e.target.value / 100) * audio.duration;
    audio.currentTime = seekTime;
    setProgress(e.target.value);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="mt-2 rounded-xl bg-gray-800/50 border border-gray-700/50 p-3 max-w-xl min-w-md w-full shadow-lg">
      <audio ref={audioRef} src={fileUrl} preload="metadata" />

      <div className="flex items-center gap-3">
        {/* دکمه Play/Pause */}
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="w-10 h-10 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 transition shadow-lg shadow-blue-500/20 cursor-pointer"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-white ml-0.5" />
          )}
        </button>

        {/* نوار پیشرفت + زمان */}
        <div className="flex-1 min-w-0">
          <div
            className="relative w-full h-1.5 bg-gray-700 rounded-full cursor-pointer group/progress mb-1"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const pct = (clickX / rect.width) * 100;
              handleSeek({ target: { value: pct } });
            }}
          >
            <div
              className="absolute top-0 left-0 h-full bg-gray-500 rounded-full"
              style={{ width: `${buffered}%` }}
            />
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* دکمه دانلود */}
        <a
          href={fileUrl}
          download
          className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-full flex items-center justify-center flex-shrink-0 transition cursor-pointer"
          title="Download"
        >
          <Download className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

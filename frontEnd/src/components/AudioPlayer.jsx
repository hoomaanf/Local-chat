import { useEffect, useRef, useState } from "react";
import playIco from "../assets/icons/audioPlayer/play.svg";
import pauseIco from "../assets/icons/audioPlayer/pause.svg";
import downloadIco from "../assets/icons/audioPlayer/download.svg";

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
        const lastBuffered = audio.buffered.end(audio.buffered.length - 1);
        setBuffered((lastBuffered / audio.duration) * 100);
      }
      setIsLoading(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
    };

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
    <div className="bg-zinc-900 text-white p-2  flex items-center rounded-xl shadow-md w-full">
      <audio ref={audioRef} src={fileUrl} preload="metadata" />
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={togglePlay}
          className="bg-zinc-700 hover:bg-zinc-600 p-2 cursor-pointer rounded-full flex items-center justify-center w-10 h-10"
          disabled={isLoading}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isLoading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
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
          ) : isPlaying ? (
            <img src={pauseIco} alt="pause" className="w-4" />
          ) : (
            <img src={playIco} alt="play" className="w-4" />
          )}
        </button>

        <div className="flex-1">
          <div className="relative h-2 w-full rounded-md bg-zinc-700 overflow-hidden mb-1">
            <div
              className="absolute top-0 left-0 h-full bg-zinc-500"
              style={{ width: `${buffered}%` }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full h-2 opacity-0 z-10 relative cursor-pointer"
              disabled={isLoading}
            />
            <div
              className="absolute top-0 left-0 h-full bg-blue-500 pointer-events-none"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-300 flex justify-between">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <a
          href={fileUrl}
          download
          className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full"
          title="Download"
        >
          <img src={downloadIco} alt="download" className="w-4" />
        </a>
      </div>
    </div>
  );
}

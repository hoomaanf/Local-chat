import { useMemo } from "react";
import AudioPlayer from "../components/AudioPlayer";
import ImageAttachment from "../components/ImageAttachment";
import VideoAttachment from "../components/VideoAttachment";
import { Download } from "lucide-react";

export default function useRenderFile(fileUrl, serverIp) {
  return useMemo(() => {
    if (!fileUrl) return null;

    const fullUrl = encodeURI(fileUrl);
    const ext = fileUrl.split(".").pop().toLowerCase();
    const fileName = decodeURIComponent(
      fileUrl
        .split("/")
        .pop()
        .replace(/^\d+-\d+-/, ""),
    );

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return <ImageAttachment fileUrl={fullUrl} />;
    }

    if (["mp3", "wav", "ogg"].includes(ext)) {
      return <AudioPlayer fileUrl={fullUrl} />;
    }

    if (["mp4", "webm", "mov"].includes(ext)) {
      return <VideoAttachment fileUrl={fullUrl} />;
    }

    // فایل ناشناخته - دکمه دانلود با اسم فایل
    return (
      <div className="mt-2">
        <a
          href={fullUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl border border-gray-600/50 transition-all cursor-pointer group"
          title={`دانلود ${fileName}`}
        >
          <Download className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
          <span className="text-sm truncate max-w-[200px]">{fileName}</span>
        </a>
      </div>
    );
  }, [fileUrl, serverIp]);
}

import { useMemo } from "react";
import AudioPlayer from "../components/AudioPlayer";
import ImageAttachment from "../components/ImageAttachment";
import VideoAttachment from "../components/VideoAttachment";

export default function useRenderFile(fileUrl, serverIp) {
  return useMemo(() => {
    if (!fileUrl) return null;

    const fullUrl = encodeURI(fileUrl);
    const ext = fileUrl.split(".").pop().toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return <ImageAttachment fileUrl={fullUrl} />;
    }

    if (["mp3", "wav", "ogg"].includes(ext)) {
      return <AudioPlayer fileUrl={fullUrl} ext={ext} />;
    }

    if (["mp4", "webm", "mov"].includes(ext)) {
      return <VideoAttachment fileUrl={fullUrl} />;
    }

    const downloadBtnClasses =
      "inline-block px-3 py-1.5 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition-colors duration-200 select-none";

    return (
      <div className="mt-2">
        <a
          href={fullUrl}
          download
          className={downloadBtnClasses}
          target="_blank"
          rel="noopener noreferrer"
          title="Download file"
        >
          📎 Download File
        </a>
      </div>
    );
  }, [fileUrl, serverIp]);
}

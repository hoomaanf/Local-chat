import { Download, ExternalLink } from "lucide-react";

function ImageAttachment({ fileUrl, alt = "Image attachment" }) {
  if (!fileUrl) return null;

  return (
    <div className="mt-2 rounded-xl overflow-hidden bg-gray-800/50 border border-gray-700/50 max-w-sm w-full shadow-lg">
      {/* تصویر */}
      <div className="w-full max-h-72 overflow-hidden">
        <img
          src={fileUrl}
          alt={alt}
          className="w-full h-auto object-cover"
          loading="lazy"
        />
      </div>

      {/* دکمه‌ها */}
      <div className="flex items-center gap-1.5 p-2">
        <a
          href={fileUrl}
          download
          className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-full flex items-center justify-center transition cursor-pointer"
          title="Download"
        >
          <Download className="w-3.5 h-3.5" />
        </a>

        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-full flex items-center justify-center transition cursor-pointer"
          title="Open in new tab"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

export default ImageAttachment;

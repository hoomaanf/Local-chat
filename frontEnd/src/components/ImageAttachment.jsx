import downloadIco from "../assets/icons/audioPlayer/download.svg";
import openInNewTab from "../assets/icons/openInNewTab.svg";

function ImageAttachment({ fileUrl, alt = "Image attachment" }) {
  if (!fileUrl) return null;

  return (
    <div className="flex flex-col items-start gap-3 mt-2 p-3 rounded-xl bg-white dark:bg-zinc-900 shadow-md border border-zinc-200 dark:border-zinc-700 max-w-sm">
      <div className="w-full max-h-96 overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
        <img
          src={fileUrl}
          alt={alt}
          className="w-full h-auto object-contain rounded"
        />
      </div>

      <div className="flex gap-3">
        {/* Download Button */}
        <a
          href={fileUrl}
          download
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full"
          title="Download"
        >
          <img src={downloadIco} alt="download" className="w-4" />
        </a>

        {/* Open in new tab */}
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700 text-black dark:text-white p-2 rounded-full"
          title="Open in new tab"
        >
          <img src={openInNewTab} alt="open" className="w-4" />
        </a>
      </div>
    </div>
  );
}

export default ImageAttachment;

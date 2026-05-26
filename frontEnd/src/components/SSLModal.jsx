import { useState, useEffect } from "react";
import { ShieldCheck, ShieldX, ExternalLink } from "lucide-react";

function SSLModal() {
  const serverIp = window.location.hostname;
  const [showModal, setShowModal] = useState(false);
  const [urlsOk, setUrlsOk] = useState({});

  const urlsToCheck = [
    { name: "Backend", url: `https://${serverIp}:3000/` },
    { name: "PeerJS", url: `https://${serverIp}:9000/myapp/peerjs/id` },
    { name: "Frontend", url: `https://${serverIp}:5173` },
  ];

  const checkUrl = async (url) => {
    try {
      await fetch(url, { method: "HEAD" });
      return true;
    } catch {
      return false;
    }
  };

  const checkAllUrls = async () => {
    const results = {};
    for (const item of urlsToCheck) {
      results[item.name] = await checkUrl(item.url);
    }
    setUrlsOk(results);

    const allOk = Object.values(results).every((v) => v === true);
    setShowModal(!allOk);
  };

  useEffect(() => {
    checkAllUrls();
  }, []);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <ShieldX className="w-8 h-8 text-red-400" />
          <h2 className="text-white text-xl font-bold">
            SSL Certificate Not Trusted
          </h2>
        </div>

        <p className="text-gray-300 text-sm mb-6" dir="auto">
          برای استفاده از تماس صوتی و چت، باید گواهی‌های امنیتی زیر رو تأیید
          کنی. روی هر لینک کلیک کن و <strong>Accept Risk</strong> رو بزن.
        </p>

        <div className="space-y-3 mb-6">
          {urlsToCheck.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-gray-700 rounded-xl hover:bg-gray-600 transition"
            >
              <div className="flex items-center gap-3">
                {urlsOk[item.name] ? (
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                ) : (
                  <ShieldX className="w-5 h-5 text-red-400" />
                )}
                <span className="text-white text-sm">{item.name}</span>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
          ))}
        </div>

        <button
          onClick={checkAllUrls}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition"
        >
          بررسی
        </button>
      </div>
    </div>
  );
}

export default SSLModal;

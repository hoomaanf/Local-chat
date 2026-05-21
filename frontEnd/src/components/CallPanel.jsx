import { useRef, useEffect, useState } from "react";
import { Phone, Mic, MicOff } from "lucide-react";
import { useWebSocket } from "../context/WebSocketContext";

function CallPanel({ partner, remoteStream, onHangup, onToggleAudio }) {
  const remoteAudioRef = useRef(null);
  const [micOn, setMicOn] = useState(true);
  const { onlineUsers } = useWebSocket();

  // اسم کاربر رو از onlineUsers پیدا کن
  const partnerUser = onlineUsers.find((u) => {
    const peerId = typeof u === "object" ? u.peerId : null;
    return peerId === partner;
  });

  const partnerName = partnerUser
    ? typeof partnerUser === "object"
      ? partnerUser.username
      : partnerUser
    : partner;

  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream || null;
    }
    return () => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = null;
      }
    };
  }, [remoteStream]);

  const handleToggleMic = () => {
    onToggleAudio();
    setMicOn(!micOn);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-800 rounded-2xl p-4 shadow-2xl border border-gray-700 flex items-center gap-4">
      {/* اسم مخاطب */}
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
        <span className="text-white text-sm font-bold">{partnerName}</span>
      </div>

      {/* دکمه قطع/وصل میکروفون */}
      <button
        onClick={handleToggleMic}
        className={`p-2 rounded-full transition ${
          micOn
            ? "bg-blue-500 hover:bg-blue-600"
            : "bg-gray-500 hover:bg-gray-600"
        }`}
        title={micOn ? "قطع میکروفون" : "وصل میکروفون"}
      >
        {micOn ? (
          <Mic className="w-4 h-4 text-white" />
        ) : (
          <MicOff className="w-4 h-4 text-white" />
        )}
      </button>

      {/* دکمه قطع تماس */}
      <button
        onClick={onHangup}
        className="p-2 rounded-full bg-red-500 hover:bg-red-600 transition"
        title="قطع تماس"
      >
        <Phone className="w-4 h-4 text-white rotate-[135deg]" />
      </button>

      <audio ref={remoteAudioRef} autoPlay playsInline />
    </div>
  );
}

export default CallPanel;

import { Phone, PhoneOff } from "lucide-react";
import { useWebSocket } from "../context/WebSocketContext";

function IncomingCall({ callerId, onAccept, onReject }) {
  const { onlineUsers } = useWebSocket();

  const callerUser = onlineUsers.find((u) => {
    const peerId = typeof u === "object" ? u.peerId : null;
    return peerId === callerId;
  });

  const callerName = callerUser
    ? typeof callerUser === "object"
      ? callerUser.username
      : callerUser
    : callerId;

  const callerProfileUrl = callerUser?.profileUrl || null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 text-center space-y-6 w-80 border border-gray-700/50 shadow-2xl shadow-purple-500/10">
        {/* آواتار */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-lg opacity-50 animate-pulse" />

          {callerProfileUrl ? (
            <img
              src={callerProfileUrl}
              alt={callerName}
              className="relative w-24 h-24 object-cover rounded-full border-2 border-white/20 shadow-xl"
            />
          ) : (
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold shadow-xl">
              {callerName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div>
          <p className="text-gray-400 text-sm animate-pulse">تماس ورودی</p>
          <p className="text-white text-xl font-bold mt-2">{callerName}</p>
        </div>

        <div className="flex gap-6 justify-center">
          <button
            onClick={onReject}
            className="group relative w-16 h-16 bg-red-500/20 hover:bg-red-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer"
          >
            <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity" />
            <PhoneOff className="w-7 h-7 text-red-400 group-hover:text-white relative z-10" />
          </button>

          <button
            onClick={onAccept}
            className="group relative w-16 h-16 bg-green-500/20 hover:bg-green-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer"
          >
            <div className="absolute inset-0 bg-green-500 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity" />
            <Phone className="w-7 h-7 text-green-400 group-hover:text-white relative z-10" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncomingCall;

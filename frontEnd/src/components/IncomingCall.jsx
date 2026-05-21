import { Phone, PhoneOff } from "lucide-react";
import { useWebSocket } from "../context/WebSocketContext";

function IncomingCall({ callerId, onAccept, onReject }) {
  const { onlineUsers } = useWebSocket();

  // اسم کاربر رو از onlineUsers پیدا کن
  const callerUser = onlineUsers.find((u) => {
    const peerId = typeof u === "object" ? u.peerId : null;
    return peerId === callerId;
  });

  const callerName = callerUser
    ? typeof callerUser === "object"
      ? callerUser.username
      : callerUser
    : callerId;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-8 text-center space-y-6 w-80">
        {/* آواتار */}
        <div className="w-20 h-20 mx-auto bg-blue-500 rounded-full flex items-center justify-center text-3xl font-bold">
          {callerName.charAt(0).toUpperCase()}
        </div>

        <div>
          <p className="text-gray-400 text-sm">تماس ورودی...</p>
          <p className="text-white text-xl font-bold mt-1">{callerName}</p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={onAccept}
            className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition"
          >
            <Phone className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={onReject}
            className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition"
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncomingCall;

import { Phone } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../context/WebSocketContext";

function OnlineUsers({ onCall, inCall }) {
  const { username } = useAuth();
  const { onlineUsers } = useWebSocket();
  const otherUsers = Array.isArray(onlineUsers)
    ? onlineUsers.filter((u) => {
        const name = typeof u === "string" ? u : u.username;
        return name !== username;
      })
    : [];

  return (
    <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
      <h3 className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">
        کاربران آنلاین
      </h3>

      {otherUsers.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-2">
          کسی آنلاین نیست
        </p>
      ) : (
        <div className="space-y-1">
          {otherUsers.map((user) => {
            const name = typeof user === "string" ? user : user.username;
            const peerId = typeof user === "object" ? user.peerId : null;

            return (
              <div
                key={name}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/50 transition"
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-gray-800 rounded-full"></span>
                  </div>
                  <span className="text-white text-sm">{name}</span>
                </div>

                {peerId && (
                  <button
                    onClick={() => onCall(peerId)}
                    disabled={inCall}
                    className={`p-2 rounded-full transition ${
                      inCall
                        ? "bg-gray-600 cursor-not-allowed opacity-50"
                        : "bg-green-600 hover:bg-green-500"
                    }`}
                    title={inCall ? "در تماس هستید" : `تماس با ${name}`}
                  >
                    <Phone className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OnlineUsers;

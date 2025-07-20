import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

function MessageInput() {
  const { username, serverIp, login, logout } = useAuth();
  const [text, setText] = useState("");
  const textInputRef = useRef(null);
  const sendMessageToServer = (message) => {
    fetch(`http://${serverIp}:3000/api/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        text: message,
      }),
    });
  };

  const handleSend = () => {
    if (text.trim()) {
      sendMessageToServer(text);
      setText("");
      textInputRef.current.focus();
    }
  };

  return (
    <div className="flex gap-2">
      <input
        autoFocus
        type="text"
        className="flex-1 border border-blue-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Type your message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        ref={textInputRef}
      />
      <button
        onClick={handleSend}
        className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
      >
        Send
      </button>
    </div>
  );
}

export default MessageInput;

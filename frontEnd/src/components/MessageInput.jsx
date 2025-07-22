import { useRef, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import sendIco from "../assets/icons/send.svg";
import closeIco from "../assets/icons/close.svg";

function MessageInput({ scrollBottom, messageToEdit, setReplyTo, replyTo }) {
  const { username, serverIp } = useAuth();
  const [text, setText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const textInputRef = useRef(null);

  const sendMessageToServer = (message, replyToId = null) => {
    fetch(`http://${serverIp}:3000/api/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        text: message,
        replyToId,
      }),
    });
  };

  const sendEditedMessageToServer = (message) => {
    fetch(`http://${serverIp}:3000/api/message/${message.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message.text }),
    });
  };

  const handleSend = () => {
    if (text.trim()) {
      if (isEditing) {
        sendEditedMessageToServer({ id: messageToEdit.id, text });
        setIsEditing(false);
      } else {
        sendMessageToServer(text, replyTo?.id || null);
      }
      setText("");
      setReplyTo(null);
      resizeTextarea();
      textInputRef.current.focus();
      scrollBottom();
    }
  };

  const resizeTextarea = () => {
    const el = textInputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 150) + "px";
  };

  useEffect(() => {
    resizeTextarea();
  }, [text]);

  useEffect(() => {
    if (messageToEdit) {
      setText(messageToEdit.text);
      textInputRef.current.focus();
      setIsEditing(true);
    }
  }, [messageToEdit]);

  useEffect(() => {
    if (replyTo) {
      setText("");
      setIsEditing(false);
      textInputRef.current.focus();
    }
  }, [replyTo]);

  return (
    <div className="flex flex-col gap-2">
      {replyTo && (
        <div className="p-2 px-3 rounded bg-gray-700 text-sm text-gray-200 flex justify-between items-center">
          <div className="truncate max-w-[80%]">
            <span className="font-semibold text-blue-400 flex flex-col">
              Reply to {replyTo.username}:
            </span>
            <span className="italic">{replyTo.text}</span>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="text-red-400 hover:text-red-600 ml-2"
            title="Cancel Reply"
          >
            <img src={closeIco} alt="closeIco" className="w-6 cursor-pointer" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-3 p-3 bg-gray-900 border border-gray-700 rounded-2xl shadow-xl">
        <textarea
          ref={textInputRef}
          autoFocus
          rows={1}
          className="flex-1 overflow-y-scroll no-scrollbar bg-gray-800 text-white placeholder-gray-400 border-none rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all duration-200 overflow-hidden"
          placeholder="Write Your Message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            } else if (e.key === "Escape") {
              setIsEditing(false);
              setReplyTo(null);
              textInputRef.current.focus();
            }
          }}
          style={{ maxHeight: "150px" }}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition duration-200 shadow-md cursor-pointer"
        >
          <img src={sendIco} alt="Send" className="w-6" />
        </button>
      </div>
    </div>
  );
}

export default MessageInput;

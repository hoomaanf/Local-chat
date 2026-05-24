import { useRef, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../context/WebSocketContext";
import { Send, X, Paperclip, Mic } from "lucide-react";

function MessageInput({
  scrollBottom,
  messageToEdit,
  setMessageToEdit,
  setReplyTo,
  replyTo,
}) {
  const { username, serverIp } = useAuth();
  const { sendMessage, isConnected, handleEditMessage, sendTyping } =
    useWebSocket();

  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const textInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const handler = () => textInputRef.current?.focus();
    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler); // پاک‌سازی
  }, []);

  const uploadFile = (file) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);
      xhr.open("POST", `https://${serverIp}:3000/api/upload`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        setUploadProgress(0);
        if (xhr.status === 200) resolve(JSON.parse(xhr.responseText).url);
        else reject(new Error("Upload failed"));
      };

      xhr.onerror = () => {
        setUploadProgress(0);
        reject(new Error("Network error"));
      };

      xhr.send(formData);
    });
  };

  const handleSend = async () => {
    if ((!text.trim() && !file) || !isConnected) return;

    try {
      if (isEditing && messageToEdit) {
        await handleEditMessage({ messageId: messageToEdit.id, text });
        setMessageToEdit(null);
        setIsEditing(false);
      } else {
        let fileUrl = null;
        if (file) fileUrl = await uploadFile(file);

        sendMessage({
          username,
          text,
          fileUrl,
          replyToId: replyTo?.id || null,
        });
      }

      setText("");
      setFile(null);
      setReplyTo(null);
      resizeTextarea();
      textInputRef.current?.focus();
      scrollBottom();
    } catch (error) {
      alert(error.message);
    }
  };

  const resizeTextarea = () => {
    const el = textInputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 150) + "px";
  };

  useEffect(() => resizeTextarea(), [text]);

  useEffect(() => {
    if (messageToEdit) {
      setText(messageToEdit.text);
      setIsEditing(true);
      textInputRef.current?.focus();
    }
  }, [messageToEdit]);

  useEffect(() => {
    if (replyTo) {
      setText("");
      setIsEditing(false);
      textInputRef.current?.focus();
    }
  }, [replyTo]);

  const handleTyping = () => {
    sendTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 1500);
  };

  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const hasContent = text.trim() || file;

  return (
    <div className="flex flex-col gap-2">
      {/* Connection Status */}
      {!isConnected && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-xs text-yellow-400">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          Connecting to server...
        </div>
      )}

      {/* Reply Preview */}
      {replyTo && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex-1 min-w-0">
            <span className="text-xs text-blue-400 font-medium">
              Reply to {replyTo.username}
            </span>
            <p className="text-sm text-gray-300 truncate">{replyTo.text}</p>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Edit Preview */}
      {isEditing && (
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <div className="flex-1">
            <span className="text-xs text-yellow-400 font-medium">
              Editing message...
            </span>
            <p className="text-sm text-gray-300 truncate">{text}</p>
          </div>
          <button
            onClick={() => {
              setMessageToEdit(null);
              setIsEditing(false);
              setText("");
            }}
            className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress > 0 && (
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2 p-2 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-lg focus-within:border-blue-500/50 focus-within:shadow-blue-500/10 transition-all duration-300">
        {/* File Button */}
        <input
          type="file"
          id="fileUpload"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
          disabled={!isConnected}
        />
        <label
          htmlFor="fileUpload"
          className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
            isConnected
              ? "text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 cursor-pointer"
              : "opacity-40 cursor-not-allowed"
          } ${file ? "text-blue-400 bg-blue-500/10" : ""}`}
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </label>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textInputRef}
            rows={1}
            className="w-full bg-transparent text-white placeholder-gray-500 px-2 py-2.5 focus:outline-none resize-none overflow-hidden text-sm"
            placeholder={
              isConnected ? "پیام خود را بنویسید..." : "Connecting..."
            }
            dir="auto"
            value={text}
            onChange={(e) => setText(e.target.value, handleTyping())}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={!isConnected}
            style={{ maxHeight: "150px" }}
          />
        </div>

        {/* File Name Badge */}
        {file && (
          <div className="absolute -top-8 left-12 bg-gray-700 text-xs text-gray-300 px-2 py-1 rounded-lg flex items-center gap-1">
            <Paperclip className="w-3 h-3" />
            <span className="max-w-[120px] truncate">{file.name}</span>
            <button
              onClick={() => setFile(null)}
              className="text-gray-400 hover:text-red-400 ml-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!isConnected || !hasContent}
          className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
            hasContent && isConnected
              ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105 cursor-pointer"
              : "bg-gray-700 text-gray-500 cursor-not-allowed"
          }`}
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default MessageInput;

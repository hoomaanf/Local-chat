import { useRef, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../context/WebSocketContext";
import sendIco from "../assets/icons/send.svg";
import closeIco from "../assets/icons/close.svg";
import attachIco from "../assets/icons/attach.svg";

function MessageInput({
  scrollBottom,
  messageToEdit,
  setMessageToEdit,
  setReplyTo,
  replyTo,
}) {
  const { username, serverIp } = useAuth();
  const { sendMessage, isConnected, handleEditMessage } = useWebSocket();

  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const textInputRef = useRef(null);

  const uploadFile = (file) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);

      xhr.open("POST", `http://${serverIp}:3000/api/upload`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          setUploadProgress(0);
          const res = JSON.parse(xhr.responseText);
          resolve(res.url);
        } else {
          setUploadProgress(0);
          reject(new Error("Upload failed"));
        }
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
        await handleEditMessage({
          messageId: messageToEdit.id,
          text: text,
        });

        setMessageToEdit(null);
        setIsEditing(false);
      } else {
        let fileUrl = null;
        if (file) {
          fileUrl = await uploadFile(file);
        }

        // ارسال از طریق WebSocket
        sendMessage({
          username,
          text: text,
          fileUrl,
          replyToId: replyTo?.id || null,
        });
      }

      // پاک کردن فرم
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

  return (
    <div className="flex flex-col gap-2">
      {/* Connection Status */}
      {!isConnected && (
        <div className="text-xs text-yellow-500 px-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          Connecting to server...
        </div>
      )}

      {/* Reply Preview */}
      {replyTo && (
        <div className="p-2 px-3 rounded bg-gray-700 text-sm text-gray-200 flex justify-between items-center">
          <div className="truncate max-w-[80%]">
            <span className="font-semibold text-blue-400">
              Reply to {replyTo.username}:
            </span>
            <span className="italic ml-2">{replyTo.text}</span>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="text-red-400 hover:text-red-600"
          >
            <img src={closeIco} alt="close" className="w-4" />
          </button>
        </div>
      )}

      {/* Edit Preview */}
      {isEditing && (
        <div className="p-2 px-3 rounded bg-yellow-800 bg-opacity-20 text-sm text-white flex justify-between items-center border border-yellow-600">
          <span>Editing message...</span>
          <button
            onClick={() => {
              setMessageToEdit(null);
              setIsEditing(false);
              setText("");
            }}
            className="text-red-400 hover:text-red-600"
          >
            <img src={closeIco} alt="cancel" className="w-4" />
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress > 0 && (
        <div className="w-full bg-gray-700 rounded h-5 relative overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold">
            {uploadProgress}%
          </span>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2 p-2 bg-gray-900 border border-gray-700 rounded-2xl">
        <textarea
          ref={textInputRef}
          rows={1}
          className="flex-1 bg-gray-800 text-white placeholder-gray-400 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden"
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={!isConnected}
          style={{ maxHeight: "150px" }}
        />

        {/* File Input */}
        <input
          type="file"
          id="fileUpload"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
          disabled={!isConnected}
        />
        <label
          htmlFor="fileUpload"
          className={`cursor-pointer p-2 rounded-full ${
            isConnected ? "hover:bg-gray-800" : "opacity-50 cursor-not-allowed"
          }`}
        >
          <img src={attachIco} alt="Attach" className="w-6" />
        </label>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!isConnected || (!text.trim() && !file)}
          className={`bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition duration-200 ${
            !isConnected || (!text.trim() && !file)
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer"
          }`}
        >
          <img src={sendIco} alt="Send" className="w-4" />
        </button>
      </div>

      {/* File Name */}
      {file && <div className="text-xs text-gray-300 px-2">📎 {file.name}</div>}
    </div>
  );
}

export default MessageInput;

import { useRef, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../context/WebSocketContext";
import { Send, X, Paperclip, Check, Square, SquareX } from "lucide-react";

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
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const textInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const xhrRef = useRef(null);

  useEffect(() => {
    const handler = () => textInputRef.current?.focus();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const cancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    setUploading(false);
    setUploadProgress(0);
    setFile(null);
  };

  const uploadFile = (file) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;
      const formData = new FormData();
      formData.append("file", file);
      xhr.open("POST", `https://${serverIp}:3000/api/upload`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        xhrRef.current = null;
        if (xhr.status === 200) {
          setUploadProgress(100);
          setUploadDone(true);
          setTimeout(() => resolve(JSON.parse(xhr.responseText).url), 400);
        } else {
          reject(new Error("Upload failed"));
        }
      };
      xhr.onerror = () => {
        xhrRef.current = null;
        reject(new Error("Network error"));
      };
      xhr.onabort = () => {
        xhrRef.current = null;
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
        if (file) {
          setUploading(true);
          setUploadProgress(0);
          setUploadDone(false);
          fileUrl = await uploadFile(file);
          setUploading(false);
        }

        sendMessage({
          username,
          text,
          fileUrl,
          replyToId: replyTo?.id || null,
        });
      }

      setText("");
      setFile(null);
      setUploading(false);
      setUploadProgress(0);
      setUploadDone(false);
      setReplyTo(null);
      resizeTextarea();
      textInputRef.current?.focus();
      scrollBottom();
    } catch (error) {
      if (error.message !== "Upload canceled") {
        alert(error.message);
      }
      setUploading(false);
      setUploadProgress(0);
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
    typingTimeoutRef.current = setTimeout(() => sendTyping(false), 1500);
  };

  useEffect(() => {
    return () => clearTimeout(typingTimeoutRef.current);
  }, []);

  const hasContent = text.trim() || file;

  return (
    <div className="flex flex-col gap-2">
      {!isConnected && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-xs text-yellow-400">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          در حال اتصال ...
        </div>
      )}

      {replyTo && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex-1 min-w-0">
            <span className="text-xs text-blue-400 font-medium">
              پاسخ به {replyTo.username}
            </span>
            <p className="text-sm text-gray-300 truncate">{replyTo.text}</p>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="p-1 text-gray-400 hover:text-red-400 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isEditing && (
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <div className="flex-1">
            <span className="text-xs text-yellow-400 font-medium">
              ویرایش پیام ...
            </span>
            <p className="text-sm text-gray-300 truncate">{text}</p>
          </div>
          <button
            onClick={() => {
              setMessageToEdit(null);
              setIsEditing(false);
              setText("");
            }}
            className="p-1 text-gray-400 hover:text-red-400 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="relative flex items-end gap-2 p-2 bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-lg focus-within:border-blue-500/50 transition-all duration-300">
        <input
          type="file"
          id="fileUpload"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
          disabled={!isConnected}
        />
        <label
          htmlFor="fileUpload"
          className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all flex-shrink-0 ${
            isConnected
              ? "text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 cursor-pointer"
              : "opacity-40 cursor-not-allowed"
          } ${file ? "text-blue-400 bg-blue-500/10" : ""}`}
        >
          <Paperclip className="w-5 h-5" />
        </label>

        <div className="flex-1">
          {file && (
            <div className="px-2 pb-1.5">
              <div className="flex items-center gap-2 text-xs">
                {uploadDone ? (
                  <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                ) : (
                  <Paperclip className="w-3 h-3 text-blue-400 flex-shrink-0" />
                )}
                <span
                  className={`truncate ${uploadDone ? "text-green-400" : "text-gray-300"}`}
                >
                  {file.name}
                </span>
                {!uploading && !uploadDone && (
                  <button
                    onClick={() => setFile(null)}
                    className="text-gray-500 hover:text-red-400 ml-auto flex-shrink-0 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                {uploadDone && (
                  <span className="text-green-400 text-[10px] ml-auto flex-shrink-0">
                    آماده
                  </span>
                )}
              </div>
              {uploading && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 w-8 text-left flex-shrink-0">
                    {uploadProgress}%
                  </span>

                  <button
                    onClick={cancelUpload}
                    className="text-gray-400 hover:text-red-400 transition flex-shrink-0"
                    title="لغو آپلود"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          <textarea
            ref={textInputRef}
            rows={1}
            className="w-full bg-transparent text-white placeholder-gray-500 px-2 py-2.5 focus:outline-none resize-none overflow-hidden text-sm"
            placeholder="پیام خود را بنویسید"
            dir="auto"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleTyping();
            }}
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

        <button
          onClick={handleSend}
          disabled={!isConnected || !hasContent || uploading}
          className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all flex-shrink-0 ${
            hasContent && isConnected && !uploading
              ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/20 hover:scale-105 cursor-pointer"
              : "bg-gray-700 text-gray-500 cursor-not-allowed"
          }`}
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export default MessageInput;

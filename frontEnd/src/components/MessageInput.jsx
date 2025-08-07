import { useRef, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import sendIco from "../assets/icons/send.svg";
import closeIco from "../assets/icons/close.svg";
import attachIco from "../assets/icons/attach.svg";

function MessageInput({ scrollBottom, messageToEdit, setReplyTo, replyTo }) {
  const { username, serverIp } = useAuth();
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
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadProgress(0);
          const res = JSON.parse(xhr.responseText);
          resolve(res.url);
        } else {
          setUploadProgress(0);
          reject(new Error("File upload failed"));
        }
      };

      xhr.onerror = () => {
        setUploadProgress(0);
        reject(new Error("Network error"));
      };

      xhr.send(formData);
    });
  };

  const sendMessage = async (messageText, fileUrl = null) => {
    const body = {
      username,
      text: messageText,
      replyToId: replyTo?.id || null,
    };
    if (fileUrl) {
      body.fileUrl = fileUrl;
    }

    const res = await fetch(`http://${serverIp}:3000/api/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Send message failed");
    }
  };

  const sendEditedMessageToServer = async () => {
    const res = await fetch(
      `http://${serverIp}:3000/api/message/${messageToEdit.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      }
    );
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Edit message failed");
    }
  };

  const handleSend = async () => {
    if (!text.trim() && !file) return;

    try {
      if (isEditing) {
        await sendEditedMessageToServer();
        setIsEditing(false);
      } else {
        let fileUrl = null;
        if (file) {
          fileUrl = await uploadFile(file);
        }
        await sendMessage(text, fileUrl);
      }

      setText("");
      setFile(null);
      setReplyTo(null);
      resizeTextarea();
      textInputRef.current.focus();
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

      <div>
        {uploadProgress > 0 && (
          <div className="w-full bg-gray-700 rounded h-5 mt-2 relative overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-semibold select-none">
              {uploadProgress}%
            </span>
          </div>
        )}
      </div>
      <div className="flex items-end gap-3 p-3 bg-gray-900 border border-gray-700 rounded-2xl shadow-xl relative">
        <textarea
          ref={textInputRef}
          autoFocus
          rows={1}
          className="flex-1 overflow-y-scroll no-scrollbar bg-gray-800 text-white placeholder-gray-400 border-none rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all duration-200 overflow-hidden"
          placeholder="Write your message or attach a file..."
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

        <input
          type="file"
          id="fileUpload"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
        />
        <label htmlFor="fileUpload" className="cursor-pointer text-white mr-2">
          <img
            src={attachIco}
            alt="Attach"
            className="w-10"
            title="Attach file"
          />
        </label>

        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition duration-200 shadow-md cursor-pointer"
        >
          <img src={sendIco} alt="Send" className="w-6" />
        </button>
      </div>

      {file && (
        <div className="text-xs text-gray-300 px-2">
          Attached: <strong>{file.name}</strong>
        </div>
      )}
    </div>
  );
}

export default MessageInput;

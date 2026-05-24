import { useAuth } from "../context/AuthContext";
import { toJalaali } from "jalaali-js";
import { Trash2, Pencil, Copy, Reply, User } from "lucide-react";
import useRenderFile from "../hooks/useRenderFile";
import { useWebSocket } from "../context/WebSocketContext";

function DeleteBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-5 h-5 cursor-pointer text-gray-500 hover:text-red-400 transition"
      title="Delete message"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}

function EditBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-5 h-5 cursor-pointer text-gray-500 hover:text-blue-400 transition"
      title="Edit message"
    >
      <Pencil className="w-3.5 h-3.5" />
    </button>
  );
}

function CopyBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-5 h-5 cursor-pointer text-gray-500 hover:text-green-400 transition"
      title="Copy message"
    >
      <Copy className="w-3.5 h-3.5" />
    </button>
  );
}

function ReplyBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-5 h-5 cursor-pointer text-gray-500 hover:text-white transition"
      title="Reply to message"
    >
      <Reply className="w-3.5 h-3.5" />
    </button>
  );
}

function UserMessage({
  user,
  serverIp,
  editFunction,
  handleReplyClick,
  allMessages,
}) {
  const { deleteMessage } = useWebSocket();
  const { serverIp: ip } = useAuth();

  const repliedMessage = user.replyToId
    ? allMessages.find((msg) => msg.id === user.replyToId)
    : null;

  const handleDeleteClick = async () => {
    await deleteMessage(user.id, serverIp || ip);
  };

  const handleEditClick = () => {
    editFunction(user.id);
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(user.text);
  };

  const scrollToMessage = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("highlight-flash");
      setTimeout(() => el.classList.remove("highlight-flash"), 1500);
    }
  };

  return (
    <div className="flex justify-end message-item gap-2 group/message">
      <div className="flex flex-col items-end max-w-lg">
        {/* اسم فرستنده */}
        <span className="text-xs text-gray-400 mb-1 mr-1">You</span>

        <div
          className="bg-gradient-to-br from-rose-500 to-pink-600 text-white p-3 rounded-2xl rounded-tr-sm shadow-lg shadow-violet-500/10 relative w-full"
          dir="auto"
          id={user.id}
        >
          {/* ریپلای */}
          {repliedMessage && (
            <div
              className="mb-2 p-2 border-r-4 border-blue-400 bg-gray-500/50 rounded text-sm text-white/80 cursor-pointer"
              onClick={() => scrollToMessage(repliedMessage.id)}
            >
              <p className="font-semibold text-xs">
                {repliedMessage.username || "..."}
              </p>
              <p className="truncate text-xs">{repliedMessage.text}</p>
            </div>
          )}

          {/* فایل */}
          {useRenderFile(user.fileUrl, serverIp || ip)}

          {/* متن */}
          {user.text && (
            <div className="text-[15px] whitespace-pre-wrap break-words">
              {user.text.includes("http") ? (
                <a
                  href={user.text}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-300"
                >
                  {user.text}
                </a>
              ) : (
                user.text
              )}
            </div>
          )}
        </div>

        {/* فوتر: زمان + دکمه‌ها */}
        <div className="flex items-center gap-1 mt-1 mr-1 flex-row-reverse">
          <span className="text-[11px] text-gray-500 ml-1">{user.time}</span>

          <DeleteBtn onClick={handleDeleteClick} />
          <EditBtn onClick={handleEditClick} />
          <CopyBtn onClick={handleCopyClick} />
          <ReplyBtn onClick={() => handleReplyClick(user)} />
        </div>
      </div>

      {/* آواتار */}
      {user.profileUrl ? (
        <img
          src={user.profileUrl}
          alt={user.username}
          className="w-10 h-10 object-cover rounded-full border-2 border-gray-400 flex-shrink-0 mt-1"
        />
      ) : (
        <div className="w-10 h-10 bg-gray-500 rounded-full border-2 border-gray-400 flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
}

export default UserMessage;

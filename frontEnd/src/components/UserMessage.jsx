import { useAuth } from "../context/AuthContext";
import { toJalaali } from "jalaali-js";
import { Trash2, Pencil, Copy, Reply, User } from "lucide-react";
import useRenderFile from "../hooks/useRenderFile";
import { useWebSocket } from "../context/WebSocketContext";

function DeleteBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-5 h-5 cursor-pointer text-gray-300 hover:text-red-400 transition"
      title="Delete message"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

function EditBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-5 h-5 cursor-pointer text-gray-300 hover:text-blue-400 transition"
      title="Edit message"
    >
      <Pencil className="w-4 h-4" />
    </button>
  );
}

function CopyBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-5 h-5 cursor-pointer text-gray-300 hover:text-green-400 transition"
      title="Copy message"
    >
      <Copy className="w-4 h-4" />
    </button>
  );
}

function ReplyBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-5 h-5 cursor-pointer text-gray-300 hover:text-white transition"
      title="Reply to message"
    >
      <Reply className="w-4 h-4" />
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
  const jDate = toJalaali(new Date(user.date));

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
    <div className="flex justify-end max-w-fit ml-auto flex-row-reverse items-end gap-2 message-item">
      {/* آواتار */}
      {user.profileUrl ? (
        <img
          src={user.profileUrl}
          alt={user.username}
          className="w-10 h-10 object-cover object-center rounded-full border-2 border-gray-400"
        />
      ) : (
        <div className="w-10 h-10 bg-gray-500 rounded-full border-2 border-gray-400 flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      )}

      <div
        className="bg-gray-600 text-white p-3 rounded-xl shadow-lg flex-grow max-w-lg"
        id={user.id}
      >
        <div className="text-sm font-semibold">YOU</div>

        {/* ریپلای */}
        {repliedMessage && (
          <div
            className="bg-gray-500/40 border-r-4 border-blue-400 pr-2 pl-3 py-1 mb-2 rounded text-sm text-blue-100 max-w-xs cursor-pointer"
            onClick={() => scrollToMessage(repliedMessage.id)}
          >
            <span className="block font-semibold text-blue-200 mb-1">
              Replying to {repliedMessage.username}:
            </span>
            <span className="line-clamp-2">{repliedMessage.text}</span>
          </div>
        )}

        {/* فایل */}
        {useRenderFile(user.fileUrl, serverIp || ip)}

        {/* متن */}
        <div className="text-base mt-1 whitespace-pre-wrap">
          {user.text.includes("http") ? (
            <a href={user.text} target="_blank" rel="noopener noreferrer">
              {user.text}
            </a>
          ) : (
            user.text
          )}
        </div>

        {/* زمان + دکمه‌ها */}
        <div className="text-xs text-right text-blue-200 mt-1 flex flex-row-reverse gap-8 justify-between items-center">
          <div className="flex gap-2 items-center">
            <p>{user.time}</p>
            <p>{`${jDate.jy}/${jDate.jm}/${jDate.jd}`}</p>
          </div>
          <div className="flex gap-1 items-center">
            <DeleteBtn onClick={handleDeleteClick} />
            <EditBtn onClick={handleEditClick} />
            <CopyBtn onClick={handleCopyClick} />
            <ReplyBtn onClick={() => handleReplyClick(user)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserMessage;

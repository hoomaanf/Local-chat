import useDeleteMessage from "../hooks/useDeleteMessage";
import { useAuth } from "../context/AuthContext";
import { toJalaali } from "jalaali-js";
import trashIco from "../assets/icons/trash.svg";
import editIco from "../assets/icons/edit.svg";
import copyIco from "../assets/icons/copy.svg";
import replyIco from "../assets/icons/reply.svg";
import useRenderFile from "../hooks/useRenderFile";

function DeleteBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-5 h-5 cursor-pointer"
      title="Delete message"
    >
      <img src={trashIco} alt="Delete message" />
    </button>
  );
}
function EditBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-6 h-6 cursor-pointer"
      title="Edit message"
    >
      <img src={editIco} alt="Edit message" />
    </button>
  );
}
function CopyBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-5 h-5 cursor-pointer"
      title="Copy message"
    >
      <img src={copyIco} alt="Copy message" />
    </button>
  );
}
function ReplyBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-4 h-4 cursor-pointer"
      title="Reply to message"
    >
      <img src={replyIco} alt="Reply to message" />
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
  const { serverIp: ip } = useAuth(); // optional if not passed as prop
  const jDate = toJalaali(new Date(user.date));

  const repliedMessage = user.replyToId
    ? allMessages.find((msg) => msg.id === user.replyToId)
    : null;

  const handleDeleteClick = async () => {
    await useDeleteMessage(user.id, serverIp || ip);
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
      <img
        src={user.profileUrl}
        alt={user.username}
        className="w-10 h-10 object-cover object-center rounded-full border-2 border-gray-400"
      />
      <div
        className="bg-gray-600 text-white p-3 rounded-xl shadow-lg flex-grow max-w-lg"
        id={user.id}
      >
        <div className="text-sm font-semibold">YOU</div>

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

        {useRenderFile(user.fileUrl, serverIp || ip)}
        <div className="text-base mt-1 whitespace-pre-wrap">
          {user.text.includes("http") ? (
            <a href={user.text} target="_blank">
              {user.text}
            </a>
          ) : (
            user.text
          )}
        </div>

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

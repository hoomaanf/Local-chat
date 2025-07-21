import useDeleteMessage from "../hooks/useDeleteMessage";
import { useAuth } from "../context/AuthContext";
import { toJalaali } from "jalaali-js";
import trashIco from "../assets/icons/trash.svg";
import editIco from "../assets/icons/edit.svg";
import copyIco from "../assets/icons/copy.svg";
import replyIco from "../assets/icons/reply.svg";

function DeleteBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-5 h-5 cursor-pointer"
      title="Delete message"
      aria-label="Delete message"
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
      aria-label="Edit message"
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
      aria-label="Copy message"
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
      aria-label="Reply to message"
    >
      <img src={replyIco} alt="Reply to message" />
    </button>
  );
}

function UserMessage({ user, editFunction, handleReplyClick }) {
  const { serverIp } = useAuth();
  const handleDeleteClick = async () => {
    await useDeleteMessage(user.id, serverIp);
  };
  const handleEditClick = async () => {
    editFunction(user.id);
  };
  const handleCopyClick = () => {
    navigator.clipboard.writeText(user.text);
  };
  const jDate = toJalaali(new Date(user.date));

  return (
    <div className="flex justify-end max-w-fit ml-auto message-item">
      <div className="bg-gray-600 text-white p-3 rounded-xl shadow-lg flex-grow">
        <div className="text-sm font-semibold">YOU</div>
        <div className="text-base mt-1">{user.text}</div>
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

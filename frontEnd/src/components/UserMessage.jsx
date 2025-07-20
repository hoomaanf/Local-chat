import deleteMessage from "../composables/deleteMessage";
import { useAuth } from "../context/AuthContext";
import { toJalaali } from "jalaali-js";

function DeleteBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-8  h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-colors duration-200"
      title="Delete message"
      aria-label="Delete message"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 7L5 7M10 11L10 17M14 11L14 17M5 7L6 19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19L19 7M9 7V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V7"
        />
      </svg>
    </button>
  );
}

function UserMessage({ user }) {
  const { serverIp } = useAuth();
  const handleDeleteClick = async (e) => {
    await deleteMessage(user.id, serverIp);
    e.preventDefault();
  };
  const jDate = toJalaali(new Date(user.date));

  return (
    <div className="flex justify-end max-w-fit ml-auto message-item">
      <div className="bg-gray-600 text-white p-3 rounded-xl shadow-lg flex-grow">
        <div className="text-sm font-semibold">YOU</div>
        <div className="text-base mt-1">{user.text}</div>
        <div className="text-xs text-right text-blue-200 mt-1 flex flex-row-reverse gap-4 items-center justify-between">
          <p>{user.time}</p>
          <p>{`${jDate.jy}/${jDate.jm}/${jDate.jd}`}</p>
          <DeleteBtn onClick={handleDeleteClick} />
        </div>
      </div>
    </div>
  );
}

export default UserMessage;

import { toJalaali } from "jalaali-js";
import replyIco from "../assets/icons/reply.svg";

function ReplyBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-4 h-4 cursor-pointer"
      title="Reply to message"
      aria-label="Reply to message"
    >
      <img src={replyIco} alt="Reply to message" className="text-rose-50" />
    </button>
  );
}

function MembersMessage({ member, handleReplyClick }) {
  const jDate = toJalaali(new Date(member.date));
  return (
    <div className="flex justify-start message-item ">
      <div className="bg-[#2b5378] text-white p-3 rounded-xl max-w-sm shadow-md border border-blue-100">
        <div className="text-sm font-semibold ">{member.username}</div>
        <div className="text-base mt-1">{member.text}</div>
        <div className="text-xs text-gray-100 mt-1 gap-2 flex items-center justify-between">
          <div className="flex gap-2 items-center">
            <p>{member.time}</p>
            <p>{`${jDate.jy}/${jDate.jm}/${jDate.jd}`}</p>
          </div>
          <ReplyBtn onClick={() => handleReplyClick(member)} />
        </div>
      </div>
    </div>
  );
}

export default MembersMessage;

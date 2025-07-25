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

function MembersMessage({ member, handleReplyClick, allMessages }) {
  const jDate = toJalaali(new Date(member.date));
  const repliedMessage = member.replyToId
    ? allMessages.find((msg) => msg.id === member.replyToId)
    : null;

  const scrollToMessage = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      el.classList.add("highlight-flash");

      setTimeout(() => {
        el.classList.remove("highlight-flash");
      }, 1500);
    }
  };

  return (
    <div className="flex justify-start message-item ">
      <div
        className="bg-[#2b5378] text-white p-3 rounded-xl max-w-sm shadow-md border border-blue-100"
        id={member.id}
      >
        <div className="text-sm font-semibold ">{member.username}</div>

        {repliedMessage && (
          <div
            className="mb-2 p-2 border-l-4 border-white/40 bg-white/10 rounded text-sm text-white/80 cursor-pointer"
            onClick={() => scrollToMessage(repliedMessage.id)}
          >
            <p className="font-semibold">{repliedMessage.username || "..."}</p>
            <p className="truncate">{repliedMessage.text}</p>
          </div>
        )}

        <div className="text-base mt-1 whitespace-pre-wrap">{member.text}</div>
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

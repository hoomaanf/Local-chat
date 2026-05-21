import { toJalaali } from "jalaali-js";
import { Reply, User, Smile } from "lucide-react";
import useRenderFile from "../hooks/useRenderFile";
import ReactionBox from "./ReactionsBox";
import { useState } from "react";
import UserReactionBox from "./UserReactionBox";
import { useAuth } from "../context/AuthContext";

function ReplyBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-5 h-5 cursor-pointer text-gray-300 hover:text-white transition"
      title="Reply to message"
      aria-label="Reply to message"
    >
      <Reply className="w-4 h-4" />
    </button>
  );
}

function MembersMessage({
  member,
  handleReplyClick,
  allMessages,
  serverIp,
  handleReaction,
  handleClickReaction,
}) {
  const { username } = useAuth();
  const [showReactionBox, setShowReactionBox] = useState(false);
  const jDate = toJalaali(new Date(member.date));
  const repliedMessage = member.replyToId
    ? allMessages.find((msg) => msg.id === member.replyToId)
    : null;

  const scrollToMessage = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("highlight-flash");
      setTimeout(() => el.classList.remove("highlight-flash"), 1500);
    }
  };

  return (
    <div className="flex justify-start message-item gap-2">
      {/* آواتار */}
      {member.profileUrl ? (
        <img
          src={member.profileUrl}
          alt={member.username}
          className="w-10 h-10 object-cover object-center rounded-full border-2 border-gray-400"
        />
      ) : (
        <div className="w-10 h-10 bg-gray-500 rounded-full border-2 border-gray-400 flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      )}

      <div
        className="bg-[#2b5378] text-white p-3 rounded-xl max-w-lg shadow-md border border-blue-100"
        id={member.id}
      >
        <div className="text-sm font-semibold">{member.username}</div>

        {/* ریپلای */}
        {repliedMessage && (
          <div
            className="mb-2 p-2 border-l-4 border-white/40 bg-white/10 rounded text-sm text-white/80 cursor-pointer max-w-72"
            onClick={() => scrollToMessage(repliedMessage.id)}
          >
            <p className="font-semibold">{repliedMessage.username || "..."}</p>
            <p className="truncate">{repliedMessage.text}</p>
          </div>
        )}

        {/* فایل */}
        {useRenderFile(member.fileUrl, serverIp)}

        {/* متن */}
        <div className="text-base mt-1 whitespace-pre-wrap">
          {member.text.includes("http") ? (
            <a href={member.text} target="_blank" rel="noopener noreferrer">
              {member.text}
            </a>
          ) : (
            member.text
          )}
        </div>

        {/* زمان + دکمه ریپلای */}
        <div className="text-xs text-gray-100 mt-1 gap-2 flex items-center justify-between">
          <div className="flex gap-2 items-center">
            <p>{member.time}</p>
            <p>{`${jDate.jy}/${jDate.jm}/${jDate.jd}`}</p>
          </div>
          <ReplyBtn onClick={() => handleReplyClick(member)} />
        </div>

        {/* ری‌اکشن‌ها */}
        {showReactionBox && (
          <ReactionBox
            messageId={member.id}
            onSelect={(emoji) => {
              handleReaction({
                messageId: member.id,
                reactions: emoji,
                userReacted: username,
              });
              setShowReactionBox(false);
            }}
          />
        )}

        {member.reactions.length ? (
          <UserReactionBox
            reactions={member.reactions}
            selectReact={handleClickReaction}
            id={member.id}
          />
        ) : (
          <button
            onClick={() => setShowReactionBox((prev) => !prev)}
            className="text-gray-300 hover:text-yellow-400 transition"
            title="Add reaction"
          >
            <Smile className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default MembersMessage;

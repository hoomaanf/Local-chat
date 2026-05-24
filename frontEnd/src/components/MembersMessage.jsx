import { toJalaali } from "jalaali-js";
import { Reply, User, Smile } from "lucide-react";
import useRenderFile from "../hooks/useRenderFile";
import ReactionBox from "./ReactionsBox";
import { useState, useEffect, useRef } from "react";
import UserReactionBox from "./UserReactionBox";
import { useAuth } from "../context/AuthContext";

function ReplyBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-7 h-7 cursor-pointer text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition"
      title="Reply to message"
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
  const reactionBoxRef = useRef(null);
  const jDate = toJalaali(new Date(member.date));
  const repliedMessage = member.replyToId
    ? allMessages.find((msg) => msg.id === member.replyToId)
    : null;

  // بستن باکس با کلیک بیرون
  useEffect(() => {
    if (!showReactionBox) return;

    const handleClickOutside = (e) => {
      if (
        reactionBoxRef.current &&
        !reactionBoxRef.current.contains(e.target)
      ) {
        setShowReactionBox(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showReactionBox]);

  const scrollToMessage = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("highlight-flash");
      setTimeout(() => el.classList.remove("highlight-flash"), 1500);
    }
  };

  const hasReactions = member.reactions && member.reactions.length > 0;

  return (
    <div className="flex justify-start message-item gap-2 group/message">
      {/* آواتار */}
      {member.profileUrl ? (
        <img
          src={member.profileUrl}
          alt={member.username}
          className="w-10 h-10 object-cover rounded-full border-2 border-gray-400 flex-shrink-0 mt-1"
        />
      ) : (
        <div className="w-10 h-10 bg-gray-500 rounded-full border-2 border-gray-400 flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-5 h-5 text-white" />
        </div>
      )}

      <div className="flex flex-col max-w-lg">
        {/* اسم فرستنده */}
        <span className="text-xs text-gray-400 mb-1 ml-1">
          {member.username}
        </span>

        <div
          className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-3 rounded-2xl rounded-tl-sm shadow-md shadow-emerald-500/10 relative"
          dir="auto"
          id={member.id}
        >
          {/* ریپلای */}
          {repliedMessage && (
            <div
              className="mb-2 p-2 border-l-4 border-white/40 bg-white/10 rounded text-sm text-white/80 cursor-pointer"
              onClick={() => scrollToMessage(repliedMessage.id)}
            >
              <p className="font-semibold text-xs">
                {repliedMessage.username || "..."}
              </p>
              <p className="truncate text-xs">{repliedMessage.text}</p>
            </div>
          )}

          {/* فایل */}
          {useRenderFile(member.fileUrl, serverIp)}

          {/* متن */}
          {member.text && (
            <div className="text-[15px] whitespace-pre-wrap break-words">
              {member.text.includes("http") ? (
                <a
                  href={member.text}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-300"
                >
                  {member.text}
                </a>
              ) : (
                member.text
              )}
            </div>
          )}

          {/* ری‌اکشن‌ها */}
          {hasReactions && (
            <div className="mt-1.5">
              <UserReactionBox
                reactions={member.reactions}
                selectReact={handleClickReaction}
                id={member.id}
              />
            </div>
          )}
        </div>

        {/* فوتر: زمان + دکمه‌ها */}
        <div className="flex items-center gap-1 mt-1 ml-1">
          <span className="text-[11px] text-gray-500 mr-1">{member.time}</span>

          <div className="relative flex items-center" ref={reactionBoxRef}>
            <button
              onClick={() => setShowReactionBox((prev) => !prev)}
              className="text-gray-500 hover:text-yellow-400 transition flex items-center justify-center w-5 h-5"
              title="Add reaction"
            >
              <Smile className="w-4 h-4" />
            </button>
            {showReactionBox && (
              <div className="absolute bottom-full left-0 mb-2 z-50 scale-75 origin-bottom-left">
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
              </div>
            )}
          </div>

          <ReplyBtn onClick={() => handleReplyClick(member)} />
        </div>
      </div>
    </div>
  );
}

export default MembersMessage;

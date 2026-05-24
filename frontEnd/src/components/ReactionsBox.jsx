import { useState } from "react";

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢"];

export default function ReactionBox({ messageId, onSelect }) {
  const [selected, setSelected] = useState();

  const handleClick = (emoji) => {
    setSelected(emoji);
    onSelect(emoji, messageId);
  };

  return (
    <div className="flex items-center gap-1 bg-gray-800/95 backdrop-blur-sm px-2 py-1.5 rounded-2xl border border-gray-600/50 shadow-xl shadow-black/20">
      {REACTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => handleClick(emoji)}
          className={`
            text-xl p-1 rounded-xl
            transition-all duration-150
            hover:scale-125 hover:bg-gray-700/50
            ${selected === emoji ? "scale-110 bg-gray-700/50" : ""}
          `}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

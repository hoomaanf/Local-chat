import { useState } from "react";

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢"];

export default function ReactionBox({ messageId, onSelect }) {
  const [selected, setSelected] = useState();

  const handleClick = (emoji) => {
    setSelected(emoji);
    onSelect(emoji, messageId);
  };

  return (
    <div className="flex items-center space-x-2 bg-gray-600 px-2 py-1.5 rounded-2xl border absolute mt-2">
      {REACTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => handleClick(emoji)}
          className={`
            text-2xl
            transition
            hover:scale-110
            ${selected === emoji ? "opacity-70" : "opacity-100"}
          `}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

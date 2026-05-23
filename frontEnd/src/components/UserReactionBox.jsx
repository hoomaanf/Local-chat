export default function UserReactionBox({ reactions, selectReact, id }) {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 mt-2">
      {reactions.map((reactionData, idx) => (
        <button
          key={idx}
          onClick={() => {
            selectReact({
              react: reactionData.reactions,
              user: reactionData.user,
              id,
            });
          }}
          type="button"
          className="
            group
            relative
            flex items-center gap-1
            bg-gray-700/60 hover:bg-gray-600
            border border-gray-600 hover:border-gray-500
            px-2.5 py-1
            rounded-full
            text-sm
            transition-all
            hover:scale-105
            cursor-pointer
          "
          title={`${reactionData.user}: ${reactionData.reactions}`}
        >
          <span className="text-base leading-none">
            {reactionData.reactions}
          </span>
          <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
            {reactionData.user}
          </span>
        </button>
      ))}
    </div>
  );
}

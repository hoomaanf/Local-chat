export default function UserReactionBox({ reactions, selectReact, id }) {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 mt-1.5">
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
            bg-black/50 hover:bg-black/60
            ring-1 ring-white/10 hover:ring-white/25
            px-1 py-1
            rounded-lg
            text-sm
            transition-all duration-150
            hover:scale-105
            cursor-pointer
          "
          title={`${reactionData.user}: ${reactionData.reactions}`}
        >
          <span className="text-sm leading-none">{reactionData.reactions}</span>
          <span className="text-[10px] text-gray-300 group-hover:text-white transition-colors">
            {reactionData.user}
          </span>
        </button>
      ))}
    </div>
  );
}

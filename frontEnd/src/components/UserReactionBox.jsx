export default function UserReactionBox({ reactions, selectReact, id }) {
  return (
    <div className="flex items-center w-fit space-x-2 bg-gray-600 px-2 py-1.5 mt-4 rounded-2xl border ">
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
          className={`
            flex items-center
            text-2xl
            transition
            hover:scale-110
            px-2 py-1.5
            rounded-xl
            hover:bg-gray-500
            cursor-pointer
          `}
        >
          <span className="mr-1 text-sm">{reactionData.reactions}</span>
          <span
            className="text-sm
           text-gray-300"
          >
            {reactionData.user}
          </span>
        </button>
      ))}
    </div>
  );
}

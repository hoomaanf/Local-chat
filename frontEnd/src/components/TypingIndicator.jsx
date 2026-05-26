function TypingIndicator({ users }) {
  if (!users || users.length === 0) return null;

  const names = users.map((u) => u.username);
  const text =
    names.length === 1
      ? `${names[0]} در حال نوشتن`
      : names.length === 2
        ? `${names[0]} و ${names[1]} در حال نوشتن`
        : `${names.length} نفر در حال نوشتن`;

  return (
    <div className="flex items-center justify-end gap-2 px-4 py-1 text-xs text-gray-400">
      <div className="flex items-center gap-1">
        <span
          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <span className="truncate" dir="rtl">
        {text}
      </span>
    </div>
  );
}

export default TypingIndicator;

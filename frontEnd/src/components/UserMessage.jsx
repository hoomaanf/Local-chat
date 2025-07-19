function UserMessage({ user }) {
  return (
    <div className="flex justify-end">
      <div className="bg-blue-600 text-white p-3 rounded-xl max-w-sm shadow-lg">
        <div className="text-sm font-semibold">{user.name}</div>
        <div className="text-base mt-1">{user.message}</div>
        <div className="text-xs text-right text-blue-200 mt-1">{user.time}</div>
      </div>
    </div>
  );
}

export default UserMessage;

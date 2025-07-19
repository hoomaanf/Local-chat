function MembersMessage({ member }) {
  return (
    <div className="flex justify-start">
      <div className="bg-white text-gray-800 p-3 rounded-xl max-w-sm shadow-md border border-blue-100">
        <div className="text-sm font-semibold text-blue-600">{member.name}</div>
        <div className="text-base mt-1">{member.message}</div>
        <div className="text-xs text-gray-400 mt-1">{member.time}</div>
      </div>
    </div>
  );
}

export default MembersMessage;

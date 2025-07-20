import { toJalaali } from "jalaali-js";

function MembersMessage({ member }) {
  const jDate = toJalaali(new Date(member.date));
  return (
    <div className="flex justify-start message-item">
      <div className="bg-gray-100 text-gray-800 p-3 rounded-xl max-w-sm shadow-md border border-blue-100">
        <div className="text-sm font-semibold text-blue-600">
          {member.username}
        </div>
        <div className="text-base mt-1">{member.text}</div>
        <div className="text-xs text-gray-400 mt-1 flex items-center justify-between">
          <p>{member.time}</p>
          <p>{`${jDate.jy}/${jDate.jm}/${jDate.jd}`}</p>
        </div>
      </div>
    </div>
  );
}

export default MembersMessage;

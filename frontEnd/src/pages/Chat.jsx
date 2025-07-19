import { useEffect, useState } from "react";
import MembersMessage from "../components/MembersMessage";
import MessageInput from "../components/MessageInput";
import UserMessage from "../components/UserMessage";
import { useAuth } from "../context/AuthContext"; // برای تشخیص نام کاربر

function Chat() {
  const [messages, setMessages] = useState([]);
  const { username, serverIp } = useAuth();

  // گرفتن پیام‌ها از سرور هر ۲ ثانیه
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://${serverIp}:3000/api/messages`);
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("خطا در دریافت پیام‌ها:", err);
      }
    };

    fetchMessages(); // بار اول
    const interval = setInterval(fetchMessages, 2000); // هر ۲ ثانیه

    return () => clearInterval(interval); // پاک‌سازی
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="p-4 bg-white shadow-md text-center text-xl font-bold text-blue-700 border-b border-blue-200">
        💬 Local Chat
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) =>
          msg.username === username ? (
            <UserMessage key={msg.id} user={msg} />
          ) : (
            <MembersMessage key={msg.id} member={msg} />
          )
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white shadow-inner border-t border-blue-200">
        <MessageInput />
      </div>
    </div>
  );
}

export default Chat;

import { useEffect, useRef, useState } from "react";
import MembersMessage from "../components/MembersMessage";
import MessageInput from "../components/MessageInput";
import UserMessage from "../components/UserMessage";
import { useAuth } from "../context/AuthContext";

function Chat() {
  const [messages, setMessages] = useState([]);
  const { username, serverIp } = useAuth();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

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

    fetchMessages();
    const interval = setInterval(fetchMessages, 500);
    return () => clearInterval(interval);
  }, [serverIp]);

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) return;

    const handleScroll = () => {
      const threshold = 50;
      const position =
        container.scrollHeight - container.scrollTop - container.clientHeight;

      setIsAtBottom(position < threshold);
    };

    container.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      <header className="p-4 bg-gray-900 shadow-md text-center text-xl font-bold text-blue-400 border-b border-gray-700">
        💬 Local Chat
      </header>

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg) =>
          msg.username === username ? (
            <UserMessage key={msg.id} user={msg} />
          ) : (
            <MembersMessage key={msg.id} member={msg} />
          )
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-gray-900 shadow-inner border-t border-gray-700">
        <MessageInput />
      </div>
    </div>
  );
}

export default Chat;

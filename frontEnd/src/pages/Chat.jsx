import { useEffect, useRef, useState } from "react";
import MembersMessage from "../components/MembersMessage";
import MessageInput from "../components/MessageInput";
import UserMessage from "../components/UserMessage";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../context/WebSocketContext";
import chatIco from "../assets/icons/favico.svg";

function Chat() {
  const { username, serverIp, logout } = useAuth();
  const { messages, isConnected, logout: wsLogout } = useWebSocket();

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [messageToEdit, setMessageToEdit] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [lastSeenMessageId, setLastSeenMessageId] = useState(null);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const threshold = 50;
    const position =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    setIsAtBottom(position < threshold);
  };

  const scrollBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      scrollBottom();
    }
  }, [messages, isAtBottom]);

  const handleEditClick = (id) => {
    const messageToEdit = messages.find((msg) => msg.id === id);
    if (messageToEdit) {
      setMessageToEdit(messageToEdit);
    }
  };

  const showNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: chatIco,
      });
    }
  };

  const handleReplyClick = (message) => {
    setReplyTo(message);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsPageVisible(visible);

      if (visible && isAtBottom && messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        setLastSeenMessageId(lastMsg.id);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [messages, isAtBottom]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!isPageVisible && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];

      if (lastMsg.id !== lastSeenMessageId) {
        setLastSeenMessageId(lastMsg.id);

        if (lastMsg.username !== username) {
          showNotification(lastMsg.username, lastMsg.text || "📎 Sent a file");
        }
      }
    }
    console.log(messages);
  }, [messages, isPageVisible, lastSeenMessageId, username]);

  return (
    <div className="flex flex-col h-dvh bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      <header className="p-4 bg-gray-900 shadow-md text-center text-xl font-bold text-blue-400 border-b border-gray-700 flex items-center justify-between gap-2">
        <div className="flex items-center justify-center gap-2">
          <img src={chatIco} alt="chatIco" className="w-8" />
          <span>Local Chat</span>
          {/* وضعیت اتصال */}
          {!isConnected && (
            <span className="text-xs text-yellow-500 ml-2">
              (Connecting...)
            </span>
          )}
        </div>
        <button
          className="text-base text-white font-normal cursor-pointer"
          onClick={() => {
            logout();
            wsLogout();
          }}
        >
          LOGOUT
        </button>
      </header>

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 modern-scrollBar"
      >
        {messages.map((msg) =>
          msg.username === username ? (
            <UserMessage
              key={msg.id}
              user={msg}
              allMessages={messages}
              serverIp={serverIp}
              editFunction={handleEditClick}
              handleReplyClick={handleReplyClick}
            />
          ) : (
            <MembersMessage
              key={msg.id}
              member={msg}
              allMessages={messages}
              handleReplyClick={handleReplyClick}
              serverIp={serverIp}
            />
          ),
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-gray-900 shadow-inner border-t border-gray-700">
        <MessageInput
          scrollBottom={scrollBottom}
          messageToEdit={messageToEdit}
          setMessageToEdit={setMessageToEdit}
          setReplyTo={setReplyTo}
          replyTo={replyTo}
        />
      </div>
    </div>
  );
}

export default Chat;

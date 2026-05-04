import { useEffect, useRef, useState } from "react";
import MembersMessage from "../components/MembersMessage";
import MessageInput from "../components/MessageInput";
import UserMessage from "../components/UserMessage";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../context/WebSocketContext";
import chatIco from "../assets/icons/favico.svg";
import { useVideoCall } from "../context/VideoCallContext";
import VideoCallModal from "../components/VideoCallModal";

function Chat() {
  const { username, serverIp, logout } = useAuth();
  const {
    messages,
    isConnected,
    logout: wsLogout,
    onlineUsers,
    handleReaction,
  } = useWebSocket();

  const { startCall, activeCall } = useVideoCall();

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [messageToEdit, setMessageToEdit] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [lastSeenMessageId, setLastSeenMessageId] = useState(null);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);

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

  const handleClickReaction = (reac) => {
    handleReaction({
      messageId: reac.id,
      reactions: reac.react,
      userReacted: username,
    });
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
  }, [messages, isPageVisible, lastSeenMessageId, username]);

  // بستن منو وقتی بیرون کلیک کنی
  useEffect(() => {
    const handleClickOutside = () => setShowOnlineUsers(false);
    if (showOnlineUsers) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showOnlineUsers]);

  return (
    <div className="flex flex-col h-dvh bg-linear-to-br from-gray-900 to-gray-800 text-gray-100 relative">
      <header className="p-4 bg-gray-900 shadow-md text-center text-xl font-bold text-blue-400 border-b border-gray-700 flex items-center justify-between gap-2">
        <div className="flex items-center justify-center gap-2">
          <img src={chatIco} alt="chatIco" className="w-8" />
          <span>Local Chat</span>
          {!isConnected && (
            <span className="text-xs text-yellow-500 ml-2">
              (Connecting...)
            </span>
          )}
        </div>
        <div>
          Online: <span className="text-white">{onlineUsers.length}</span>
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowOnlineUsers(!showOnlineUsers);
            }}
            className="bg-green-600 hover:bg-green-700 py-2 px-4 rounded-lg cursor-pointer transition"
          >
            📞 Call
          </button>

          {showOnlineUsers && (
            <div className="absolute top-12 right-0 bg-gray-800 rounded-lg shadow-xl z-50 w-64">
              <div className="p-2 border-b border-gray-700 font-bold text-center">
                Select a user
              </div>
              {onlineUsers.filter((user) => user !== username).length === 0 ? (
                <div className="p-3 text-gray-400 text-center">
                  No other users online
                </div>
              ) : (
                onlineUsers
                  .filter((user) => user !== username)
                  .map((user) => (
                    <button
                      key={user}
                      onClick={() => {
                        startCall(user, true);
                        setShowOnlineUsers(false);
                      }}
                      className="w-full text-left p-3 hover:bg-gray-700 transition flex items-center gap-2"
                    >
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {user}
                    </button>
                  ))
              )}
            </div>
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

      <VideoCallModal />

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
              handleReaction={handleReaction}
              handleClickReaction={handleClickReaction}
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

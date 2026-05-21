import { useEffect, useRef, useState } from "react";
import MembersMessage from "../components/MembersMessage";
import MessageInput from "../components/MessageInput";
import UserMessage from "../components/UserMessage";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../context/WebSocketContext";
import { usePeerCall } from "../hooks/usePeerCall";
import OnlineUsers from "../components/OnlineUsers";
import IncomingCall from "../components/IncomingCall";
import CallPanel from "../components/CallPanel";
import { Users, LogOut, MessageCircle, Wifi, WifiOff } from "lucide-react";

function Chat() {
  const { username, serverIp, logout } = useAuth();
  const {
    messages,
    isConnected,
    logout: wsLogout,
    onlineUsers,
    handleReaction,
  } = useWebSocket();

  const {
    incomingCall,
    inCall,
    callPartner,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    hangup,
    toggleAudio,
  } = usePeerCall(username, serverIp);

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
      new Notification(title, { body });
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

  return (
    <div className="flex flex-col h-dvh bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      {/* Header */}
      <header className="p-4 bg-gray-900 shadow-md border-b border-gray-700 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-7 h-7 text-blue-400" />
          <div>
            <h1 className="text-lg font-bold text-blue-400">Local Chat</h1>
            {!isConnected ? (
              <span className="text-xs text-yellow-500 flex items-center gap-1">
                <WifiOff className="w-3 h-3" /> Connecting...
              </span>
            ) : (
              <span className="text-xs text-green-400 flex items-center gap-1">
                <Wifi className="w-3 h-3" /> Connected
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* دکمه کاربران آنلاین */}
          <button
            onClick={() => setShowOnlineUsers(!showOnlineUsers)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition text-sm font-medium ${
              showOnlineUsers
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{onlineUsers.length}</span>
          </button>

          {/* دکمه خروج */}
          <button
            onClick={() => {
              logout();
              wsLogout();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white transition text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج</span>
          </button>
        </div>
      </header>

      {/* محتوای اصلی */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* بخش چت */}
        <div className="flex-1 flex flex-col">
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

        {/* پنل کاربران آنلاین */}
        {showOnlineUsers && (
          <div className="w-64 border-l border-gray-700 bg-gray-900 p-3 overflow-y-auto">
            <OnlineUsers onCall={startCall} inCall={inCall} />
          </div>
        )}
      </div>

      {/* تماس ورودی */}
      {incomingCall && (
        <IncomingCall
          callerId={incomingCall.peer}
          onAccept={acceptCall}
          onReject={rejectCall}
        />
      )}

      {/* پنل تماس */}
      {inCall && (
        <CallPanel
          partner={callPartner}
          remoteStream={remoteStream}
          onHangup={hangup}
          onToggleAudio={toggleAudio}
        />
      )}
    </div>
  );
}

export default Chat;

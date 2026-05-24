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
import {
  Users,
  LogOut,
  MessageCircle,
  Wifi,
  WifiOff,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useSound } from "../hooks/useSound";

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

  const { play, stop } = useSound();

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [messageToEdit, setMessageToEdit] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [lastSeenMessageId, setLastSeenMessageId] = useState(null);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);

  useEffect(() => {
    const unlockSound = () => {
      const tmp = new Audio();
      tmp.play().catch(() => {});
      document.removeEventListener("click", unlockSound);
    };
    document.addEventListener("click", unlockSound);
  }, []);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const threshold = 50;
    const position =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const atBottom = position < threshold;
    setIsAtBottom(atBottom);
    if (atBottom) setNewMessagesCount(0);
  };

  const scrollBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    setNewMessagesCount(0);
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // اسکرول خودکار فقط وقتی کاربر پایینه
  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  // شمارش پیام‌های جدید وقتی کاربر بالا رو می‌بینه
  useEffect(() => {
    if (!isAtBottom && messages.length > 0) {
      setNewMessagesCount((prev) => prev + 1);
      play("newMessage");
    }
  }, [messages.length]);

  useEffect(() => {
    if (incomingCall) {
      console.log("object");
      play("incomingCall", true);
    } else {
      stop("incomingCall");
    }
  }, [incomingCall]);

  const handleEditClick = (id) => {
    const msg = messages.find((m) => m.id === id);
    if (msg) setMessageToEdit(msg);
  };

  const showNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  const handleReplyClick = (message) => setReplyTo(message);

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
        setLastSeenMessageId(messages[messages.length - 1].id);
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
          showNotification(lastMsg.username, lastMsg.text || "ارسال فایل");
        }
      }
    }
  }, [messages, isPageVisible, lastSeenMessageId, username]);

  return (
    <div className="flex flex-col h-dvh bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-gray-100 relative overflow-hidden">
      {/* پس‌زمینه موج */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[128px] animate-pulse" />
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-xl bg-gray-900/70 border-b border-gray-700/50 px-4 py-3 flex items-center justify-between gap-2 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Local Chat
            </h1>
            {!isConnected ? (
              <span className="text-[11px] text-yellow-500 flex items-center gap-1">
                <WifiOff className="w-3 h-3" /> درحال اتصال...
              </span>
            ) : (
              <span className="text-[11px] text-green-400 flex items-center gap-1">
                <Wifi className="w-3 h-3" /> متصل
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOnlineUsers(!showOnlineUsers)}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 text-sm font-medium cursor-pointer ${
              showOnlineUsers
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:shadow-lg"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{onlineUsers.length}</span>
          </button>

          <button
            onClick={() => {
              logout();
              wsLogout();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800/50 text-gray-300 hover:bg-red-600/80 hover:text-white hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 text-sm font-medium cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج</span>
          </button>
        </div>
      </header>

      {/* محتوای اصلی */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        <div className="flex-1 flex flex-col relative">
          {/* پیام‌ها */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 pb-2 space-y-3 modern-scrollBar"
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
                <Sparkles className="w-12 h-12 text-gray-600 animate-pulse" />
                <p className="text-sm">هنوز پیامی ارسال نشده</p>
                <p className="text-xs text-gray-600">اولین پیام رو تو بفرست!</p>
              </div>
            )}
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

          {/* دکمه اسکرول به پایین (مثل تلگرام) */}
          {!isAtBottom && (
            <button
              onClick={scrollBottom}
              className="absolute bottom-24 right-6 z-20 w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center transition-all duration-300 cursor-pointer"
              title="برو به آخر"
            >
              <ChevronDown className="w-5 h-5" />
              {newMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                  {newMessagesCount > 99 ? "99+" : newMessagesCount}
                </span>
              )}
            </button>
          )}

          {/* Input */}
          <div className="relative z-10 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent px-4 pb-4 pt-2">
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
          <div className="w-72 border-l border-gray-700/50 bg-gray-900/80 backdrop-blur-sm p-4 overflow-y-auto animate-slideInRight">
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

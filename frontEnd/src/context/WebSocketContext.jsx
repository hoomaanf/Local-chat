import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { username, serverIp } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const messageHandlers = useRef(new Set());

  const connectWebSocket = useCallback(() => {
    if (!username || !serverIp) return;

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    const ws = new WebSocket(`ws://${serverIp}:3000`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      setIsConnected(true);

      ws.send(
        JSON.stringify({
          type: "login",
          data: { username },
        }),
      );

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "initial_messages":
            setMessages(message.data);
            break;

          case "new_message":
            setMessages((prev) => {
              if (prev.some((msg) => msg.id === message.data.id)) {
                return prev;
              }
              return [...prev, message.data];
            });

            messageHandlers.current.forEach((handler) => {
              handler(message.data);
            });
            break;

          case "message_updated":
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === message.data.id ? message.data : msg,
              ),
            );
            break;

          case "online_users":
            setOnlineUsers(message.data);
            break;

          case "login_success":
            console.log("✅ Login successful");
            break;

          default:
            console.log("Unknown message type:", message.type);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    ws.onclose = () => {
      console.log("❌ WebSocket disconnected");
      setIsConnected(false);
      setOnlineUsers([]);

      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("🔄 Reconnecting...");
          connectWebSocket();
        }, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }, [username, serverIp]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "logout",
            data: { username },
          }),
        );
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket, username]);

  const sendMessage = (messageData) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "new_message",
          data: messageData,
        }),
      );
      return true;
    }
    return false;
  };

  const deleteMessage = (messageId) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "delete_message",
          data: { messageId },
        }),
      );
      return true;
    }
    return false;
  };

  const logout = (user) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "logout",
          data: user,
        }),
      );
      return true;
    }
    return false;
  };

  const handleEditMessage = (message) => {
    console.log(message);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "edit_message",
          data: message,
        }),
      );
      return true;
    }
    return false;
  };

  const onNewMessage = (handler) => {
    messageHandlers.current.add(handler);
    return () => messageHandlers.current.delete(handler);
  };

  const value = {
    isConnected,
    onlineUsers,
    messages,
    sendMessage,
    onNewMessage,
    deleteMessage,
    logout,
    handleEditMessage,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

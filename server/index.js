const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "messages.json");
const USERS_FILE = path.join(__dirname, "users.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");
const PROFILE_DIR = path.join(UPLOADS_DIR, "profiles");
const FILES_DIR = path.join(UPLOADS_DIR, "files");

// ایجاد پوشه‌ها
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
if (!fs.existsSync(PROFILE_DIR)) fs.mkdirSync(PROFILE_DIR);
if (!fs.existsSync(FILES_DIR)) fs.mkdirSync(FILES_DIR);

// ذخیره اتصالات کاربران
const clients = new Map(); // username => WebSocket

// ==================== توابع کمکی ====================

function loadMessages() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveMessages(messages) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
}

function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ==================== Multer Setup ====================

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PROFILE_DIR),
  filename: (req, file, cb) => {
    const username = req.body.username;
    const ext = path.extname(file.originalname);
    cb(null, username + ext);
  },
});
const uploadProfile = multer({ storage: profileStorage });

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, FILES_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const uploadFile = multer({ storage: fileStorage });

app.use("/uploads", express.static(UPLOADS_DIR));

// ==================== WebSocket Handlers ====================

function forwardToUser(username, message) {
  const targetWs = clients.get(username);
  if (targetWs && targetWs.readyState === WebSocket.OPEN) {
    targetWs.send(JSON.stringify(message));
  }
}

function broadcastMessage(message) {
  const messageStr = JSON.stringify(message);
  clients.forEach((clientWs) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(messageStr);
    }
  });
}

function broadcastUserList() {
  const onlineUsers = Array.from(clients.keys());
  broadcastMessage({
    type: "online_users",
    data: onlineUsers,
  });
}

// ==================== WebSocket Connection ====================

wss.on("connection", (ws, req) => {
  const messages = loadMessages();
  const users = loadUsers();
  const messagesWithProfiles = messages.map((msg) => {
    const user = users.find((u) => u.username === msg.username);
    return { ...msg, profileUrl: user ? user.profileUrl : null };
  });

  ws.send(
    JSON.stringify({
      type: "initial_messages",
      data: messagesWithProfiles,
    }),
  );

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case "login":
          handleLogin(ws, message.data);
          break;
        case "new_message":
          handleNewMessage(ws, message.data);
          break;
        case "edit_message":
          handleEditMessage(ws, message.data);
          break;
        case "react_message":
          handleReaction(message.data);
          break;
        case "delete_message":
          handleDeleteMessage(ws, message.data);
          break;
        case "logout":
          handleLogout(ws, message.data);
          break;

        // ========== WebRTC Signaling برای تماس صوتی/تصویری ==========
        case "call_offer":
          forwardToUser(message.target, {
            type: "call_offer",
            offer: message.offer,
            from: message.from,
          });
          break;

        case "call_answer":
          forwardToUser(message.target, {
            type: "call_answer",
            answer: message.answer,
            from: message.from,
          });
          break;

        case "ice_candidate":
          forwardToUser(message.target, {
            type: "ice_candidate",
            candidate: message.candidate,
            from: message.from,
          });
          break;

        case "end_call":
          forwardToUser(message.target, {
            type: "end_call",
            from: message.from,
          });
          break;
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", () => {
    for (let [username, clientWs] of clients.entries()) {
      if (clientWs === ws) {
        clients.delete(username);
        broadcastUserList();
        break;
      }
    }
  });
});

// ==================== WebSocket Message Handlers ====================

function handleLogin(ws, data) {
  const { username } = data;

  clients.set(username, ws);

  ws.send(
    JSON.stringify({
      type: "login_success",
      data: { username },
    }),
  );

  broadcastUserList();
}

function handleNewMessage(ws, data) {
  const { username, text, replyToId, fileUrl } = data;

  if (!username || (!text && !fileUrl)) return;

  const messages = loadMessages();
  const newMessage = {
    id: Date.now(),
    username,
    text: text || "",
    fileUrl: fileUrl || null,
    time: new Date().toTimeString().split(" ")[0],
    date: new Date().toLocaleDateString(),
    replyToId: replyToId || null,
    reactions: [],
  };

  messages.push(newMessage);
  saveMessages(messages);

  const users = loadUsers();
  const user = users.find((u) => u.username === username);

  const messageWithProfile = {
    ...newMessage,
    profileUrl: user ? user.profileUrl : null,
  };

  broadcastMessage({
    type: "new_message",
    data: messageWithProfile,
  });
}

function handleReaction(data) {
  const { userReacted, messageId, reactions } = data;
  if (!userReacted || !reactions.length || !messageId) return;

  const messages = loadMessages();
  const messageIndex = messages.findIndex((m) => m.id === messageId);

  if (messageIndex > -1) {
    const reactedMessage = messages[messageIndex].reactions.find(
      (react) => react.user == userReacted,
    );
    if (reactedMessage) {
      const removedReactionMessage = messages[messageIndex].reactions.filter(
        (react) => react.user != reactedMessage.user,
      );
      messages[messageIndex].reactions = removedReactionMessage;
    } else {
      messages[messageIndex].reactions.push({
        user: userReacted,
        reactions: reactions,
      });
    }
    saveMessages(messages);

    const messageReacted = {
      ...messages[messageIndex],
    };

    broadcastMessage({
      type: "react_message",
      data: messageReacted,
    });
  }
}

function handleEditMessage(ws, data) {
  const { messageId, text } = data;
  const messages = loadMessages();
  const messageIndex = messages.findIndex((m) => m.id === messageId);

  if (messageIndex > -1) {
    messages[messageIndex].text = text;
    messages[messageIndex].edited = true;
    saveMessages(messages);

    const users = loadUsers();
    const user = users.find(
      (u) => u.username === messages[messageIndex].username,
    );

    const messageWithProfile = {
      ...messages[messageIndex],
      profileUrl: user ? user.profileUrl : null,
    };

    broadcastMessage({
      type: "message_updated",
      data: messageWithProfile,
    });
  }
}

function handleDeleteMessage(ws, data) {
  const { messageId } = data;

  const messages = loadMessages();
  const filteredMessages = messages.filter((m) => m.id !== messageId);
  saveMessages(filteredMessages);

  broadcastMessage({
    type: "message_deleted",
    data: { id: messageId },
  });
}

function handleLogout(ws, data) {
  const { username } = data;
  clients.delete(username);
  broadcastUserList();
}

// ==================== REST endpoints ====================

app.post("/api/login", uploadProfile.single("profile"), (req, res) => {
  const { username } = req.body;
  if (!username || username.trim() === "") {
    return res.status(400).json({ error: "Username is required" });
  }

  let users = loadUsers();
  let profileUrl = null;

  if (req.file) {
    const protocol = req.protocol;
    const host = req.get("host");
    profileUrl = `${protocol}://${host}/uploads/profiles/${req.file.filename}`;
  } else {
    const existingUser = users.find((u) => u.username === username);
    profileUrl = existingUser ? existingUser.profileUrl : null;
  }

  const existingIndex = users.findIndex((u) => u.username === username);
  if (existingIndex > -1) {
    users[existingIndex].profileUrl = profileUrl;
  } else {
    users.push({ username, profileUrl });
  }
  saveUsers(users);

  res.json({ username, profileUrl });
});

app.post("/api/upload", uploadFile.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const protocol = req.protocol;
  const host = req.get("host");
  const fileUrl = `${protocol}://${host}/uploads/files/${req.file.filename}`;

  res.json({ url: fileUrl });
});

app.get("/api/messages", (req, res) => {
  const messages = loadMessages();
  const users = loadUsers();
  const messagesWithProfiles = messages.map((msg) => {
    const user = users.find((u) => u.username === msg.username);
    return { ...msg, profileUrl: user ? user.profileUrl : null };
  });
  res.json(messagesWithProfiles);
});

// ==================== شروع سرور ====================

server.listen(3000, "0.0.0.0", () => {
  console.log("✅ Server running on http://0.0.0.0:3000");
  console.log("✅ WebSocket server running on ws://0.0.0.0:3000");
  console.log("✅ Video/Audio call signaling ready");
});

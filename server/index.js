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

// مخصوص آپلود عکس پروفایل
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PROFILE_DIR),
  filename: (req, file, cb) => {
    const username = req.body.username;
    const ext = path.extname(file.originalname);
    cb(null, username + ext);
  },
});
const uploadProfile = multer({ storage: profileStorage });

// مخصوص آپلود فایل‌های پیام
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, FILES_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const uploadFile = multer({ storage: fileStorage });

// سرو فایل‌های استاتیک
app.use("/uploads", express.static(UPLOADS_DIR));

// ==================== WebSocket Handlers ====================

wss.on("connection", (ws, req) => {
  // ارسال پیام‌های قبلی به کاربر جدید
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

  // دریافت پیام از کلاینت
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
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  // وقتی کاربر قطع میشه
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

  // ذخیره اتصال کاربر
  clients.set(username, ws);

  // تایید لاگین
  ws.send(
    JSON.stringify({
      type: "login_success",
      data: { username },
    }),
  );

  // به‌روزرسانی لیست آنلاین برای همه
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
    reactions: [
      // {
      //   user: null,
      //   reactions: [],
      // },
    ],
  };

  messages.push(newMessage);
  saveMessages(messages);

  // گرفتن پروفایل کاربر
  const users = loadUsers();
  const user = users.find((u) => u.username === username);

  const messageWithProfile = {
    ...newMessage,
    profileUrl: user ? user.profileUrl : null,
  };

  // ارسال به همه کاربران آنلاین
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

    // اینجا باید به همه خبر بدی! 🔥
    broadcastMessage({
      type: "react_message", // یه تایپ جدید
      data: messageReacted,
    });
  }
}

function handleEditMessage(ws, data) {
  const { messageId, text } = data;
  const messages = loadMessages();
  const messageIndex = messages.findIndex((m) => m.id === messageId);

  if (messageIndex > -1) {
    // آپدیت پیام
    messages[messageIndex].text = text;
    messages[messageIndex].edited = true;
    saveMessages(messages);

    // گرفتن پروفایل کاربر
    const users = loadUsers();
    const user = users.find(
      (u) => u.username === messages[messageIndex].username,
    );

    const messageWithProfile = {
      ...messages[messageIndex],
      profileUrl: user ? user.profileUrl : null,
    };

    // اینجا باید به همه خبر بدی! 🔥
    broadcastMessage({
      type: "message_updated", // یه تایپ جدید
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

// ==================== REST endpoints (برای آپلود فایل) ====================

// آپلود عکس پروفایل
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

// آپلود فایل برای پیام
app.post("/api/upload", uploadFile.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const protocol = req.protocol;
  const host = req.get("host");
  const fileUrl = `${protocol}://${host}/uploads/files/${req.file.filename}`;

  res.json({ url: fileUrl });
});

// دریافت همه پیام‌ها (برای مواقع ضروری - مثلاً وقتی WebSocket وصل نیست)
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

server.listen(4000, "0.0.0.0", () => {
  console.log("✅ Server running on http://0.0.0.0:4000");
  console.log("✅ WebSocket server running on ws://0.0.0.0:4000");
});

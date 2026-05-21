const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const https = require("https");
const WebSocket = require("ws");

const app = express();
const options = {
  key: fs.readFileSync(path.join(__dirname, "..", "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "..", "cert.pem")),
};

const server = https.createServer(options, app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "messages.json");
const USERS_FILE = path.join(__dirname, "users.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");
const PROFILE_DIR = path.join(UPLOADS_DIR, "profiles");
const FILES_DIR = path.join(UPLOADS_DIR, "files");

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
if (!fs.existsSync(PROFILE_DIR)) fs.mkdirSync(PROFILE_DIR);
if (!fs.existsSync(FILES_DIR)) fs.mkdirSync(FILES_DIR);

const clients = new Map();

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

// ==================== Multer ====================

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PROFILE_DIR),
  filename: (req, file, cb) =>
    cb(null, req.body.username + path.extname(file.originalname)),
});
const uploadProfile = multer({ storage: profileStorage });

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, FILES_DIR),
  filename: (req, file, cb) =>
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        "-" +
        file.originalname,
    ),
});
const uploadFile = multer({ storage: fileStorage });

app.use("/uploads", express.static(UPLOADS_DIR));

// ==================== WebSocket چت ====================

wss.on("connection", (ws) => {
  const messages = loadMessages();
  const users = loadUsers();
  const messagesWithProfiles = messages.map((msg) => {
    const user = users.find((u) => u.username === msg.username);
    return { ...msg, profileUrl: user ? user.profileUrl : null };
  });
  ws.send(
    JSON.stringify({ type: "initial_messages", data: messagesWithProfiles }),
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
        case "peer_id":
          handlePeerId(ws, message.data);
          break;
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", () => {
    for (let [username, value] of clients.entries()) {
      if ((value?.ws || value) === ws) {
        value.ws = null; // فقط ws رو خالی کن، peerId بمونه
        broadcastUserList();
        break;
      }
    }
  });
});

// ==================== Handlers ====================

function handleLogin(ws, data) {
  const { username } = data;
  const existing = clients.get(username);

  if (existing) {
    // کاربر reconnect کرده → فقط ws رو آپدیت کن
    existing.ws = ws;
  } else {
    // کاربر جدید
    clients.set(username, { ws, peerId: null });
  }

  ws.send(JSON.stringify({ type: "login_success", data: { username } }));
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
  broadcastMessage({
    type: "new_message",
    data: { ...newMessage, profileUrl: user?.profileUrl || null },
  });
}

function handleReaction(data) {
  const { userReacted, messageId, reactions } = data;
  if (!userReacted || !reactions.length || !messageId) return;
  const messages = loadMessages();
  const idx = messages.findIndex((m) => m.id === messageId);
  if (idx === -1) return;
  const reacted = messages[idx].reactions.find((r) => r.user === userReacted);
  if (reacted) {
    messages[idx].reactions = messages[idx].reactions.filter(
      (r) => r.user !== userReacted,
    );
  } else {
    messages[idx].reactions.push({ user: userReacted, reactions });
  }
  saveMessages(messages);
  broadcastMessage({ type: "react_message", data: messages[idx] });
}

function handleEditMessage(ws, data) {
  const { messageId, text } = data;
  const messages = loadMessages();
  const idx = messages.findIndex((m) => m.id === messageId);
  if (idx === -1) return;
  messages[idx].text = text;
  messages[idx].edited = true;
  saveMessages(messages);
  const users = loadUsers();
  const user = users.find((u) => u.username === messages[idx].username);
  broadcastMessage({
    type: "message_updated",
    data: { ...messages[idx], profileUrl: user?.profileUrl || null },
  });
}

function handleDeleteMessage(ws, data) {
  const messages = loadMessages().filter((m) => m.id !== data.messageId);
  saveMessages(messages);
  broadcastMessage({ type: "message_deleted", data: { id: data.messageId } });
}

function handleLogout(ws, data) {
  const existing = clients.get(data.username);
  if (existing) {
    existing.ws = null; // فقط ws رو خالی کن
  }
  broadcastUserList();
}

function handlePeerId(ws, data) {
  const { username, peerId } = data;
  const existing = clients.get(username);
  if (existing) {
    existing.peerId = peerId;
  }
  broadcastMessage({ type: "peer_update", data: { username, peerId } });
}

function broadcastMessage(message) {
  const str = JSON.stringify(message);
  clients.forEach((value) => {
    const ws = value?.ws;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(str);
  });
}

function broadcastUserList() {
  const list = [];
  clients.forEach((value, username) => {
    if (value) {
      list.push({ username, peerId: value.peerId || null });
    }
  });
  broadcastMessage({ type: "online_users", data: list });
}

// ==================== REST ====================

app.post("/api/login", uploadProfile.single("profile"), (req, res) => {
  const { username } = req.body;
  if (!username?.trim())
    return res.status(400).json({ error: "Username is required" });
  let users = loadUsers();
  let profileUrl = null;
  if (req.file) {
    profileUrl = `${req.protocol}://${req.get("host")}/uploads/profiles/${req.file.filename}`;
  } else {
    profileUrl = users.find((u) => u.username === username)?.profileUrl || null;
  }
  const idx = users.findIndex((u) => u.username === username);
  if (idx > -1) users[idx].profileUrl = profileUrl;
  else users.push({ username, profileUrl });
  saveUsers(users);
  res.json({ username, profileUrl });
});

app.post("/api/upload", uploadFile.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({
    url: `${req.protocol}://${req.get("host")}/uploads/files/${req.file.filename}`,
  });
});

app.get("/api/messages", (req, res) => {
  const messages = loadMessages();
  const users = loadUsers();
  res.json(
    messages.map((msg) => ({
      ...msg,
      profileUrl:
        users.find((u) => u.username === msg.username)?.profileUrl || null,
    })),
  );
});

// ==================== شروع ====================

server.listen(3000, "0.0.0.0", () => {
  console.log("✅ Server running on https://0.0.0.0:3000");
  console.log("✅ WebSocket chat on wss://0.0.0.0:3000");
});

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "messages.json");
const USERS_FILE = path.join(__dirname, "users.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");
const PROFILE_DIR = path.join(UPLOADS_DIR, "profiles");

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
if (!fs.existsSync(PROFILE_DIR)) fs.mkdirSync(PROFILE_DIR);

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

// Multer setup for profile uploads
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PROFILE_DIR),
  filename: (req, file, cb) => {
    const username = req.body.username;
    const ext = path.extname(file.originalname);
    cb(null, username + ext);
  },
});
const uploadProfile = multer({ storage: profileStorage });

// Serve uploaded files statically
app.use("/uploads", express.static(UPLOADS_DIR));

// Login with profile upload
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

  // Update or add user
  const existingIndex = users.findIndex((u) => u.username === username);
  if (existingIndex > -1) {
    users[existingIndex].profileUrl = profileUrl;
  } else {
    users.push({ username, profileUrl });
  }
  saveUsers(users);

  res.json({ username, profileUrl });
});

// Get all messages with profile URLs
app.get("/api/messages", (req, res) => {
  const messages = loadMessages();
  const users = loadUsers();
  const messagesWithProfiles = messages.map((msg) => {
    const user = users.find((u) => u.username === msg.username);
    return { ...msg, profileUrl: user ? user.profileUrl : null };
  });
  res.json(messagesWithProfiles);
});

// Post message
app.post("/api/message", (req, res) => {
  const { username, text, replyToId, fileUrl } = req.body;
  if (!username || (!text && !fileUrl)) {
    return res
      .status(400)
      .json({ error: "username and (text or fileUrl) are required" });
  }

  const messages = loadMessages();
  const newMessage = {
    id: Date.now(),
    username,
    text: text || "",
    fileUrl: fileUrl || null,
    time: new Date().toTimeString().split(" ")[0],
    date: new Date().toLocaleDateString(),
    replyToId: replyToId || null,
  };

  messages.push(newMessage);
  saveMessages(messages);
  res.status(201).json(newMessage);
});

app.listen(3000, "0.0.0.0", () => {
  console.log("✅ Server running on http://0.0.0.0:3000");
});

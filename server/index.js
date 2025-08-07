const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "messages.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

function loadMessages() {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveMessages(messages) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
}

// Serve uploaded files statically
app.use("/uploads", express.static(UPLOADS_DIR));

// Ping
app.get("/api/ping", (req, res) => {
  res.status(200).json({ message: "pong" });
});

// Get all messages
app.get("/api/messages", (req, res) => {
  const messages = loadMessages();
  res.json(messages);
});

// Upload file
app.post("/api/upload", (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File size exceeds 100MB limit" });
      }
      return res.status(500).json({ error: "File upload error" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "File not provided" });
    }
    const protocol = req.protocol;
    const host = req.get("host");
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });
});

// Post message with optional fileUrl
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

// Edit a message
app.put("/api/message/:id", (req, res) => {
  const { text } = req.body;
  const id = parseInt(req.params.id);

  if (!text || !id) {
    return res.status(400).json({ error: "text and id are required" });
  }

  const messages = loadMessages();
  const messageIndex = messages.findIndex((msg) => msg.id === id);
  if (messageIndex === -1) {
    return res.status(404).json({ error: "message not found" });
  }

  messages[messageIndex].text = text;
  saveMessages(messages);
  res.json(messages[messageIndex]);
});

// Delete a message
app.delete("/api/message/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: "invalid id" });

  let messages = loadMessages();
  const index = messages.findIndex((msg) => msg.id === id);
  if (index === -1) return res.status(404).json({ error: "message not found" });

  const deleted = messages.splice(index, 1)[0];

  if (deleted.fileUrl) {
    try {
      const fileName = path.basename(deleted.fileUrl);
      const filePath = path.join(UPLOADS_DIR, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  }

  saveMessages(messages);
  res.json(deleted);
});

// Start Server
app.listen(3000, "0.0.0.0", () => {
  console.log("✅ Server running on http://0.0.0.0:3000");
});

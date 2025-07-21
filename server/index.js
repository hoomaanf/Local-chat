const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "messages.json");

// --- Utility Functions ---
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

// --- Routes ---

app.get("/api/ping", (req, res) => {
  res.status(200).json({ message: "pong" });
});

app.get("/api/messages", (req, res) => {
  const messages = loadMessages();
  res.json(messages);
});

app.post("/api/message", (req, res) => {
  const { username, text, replyToId } = req.body;

  if (!username || !text) {
    return res.status(400).json({ error: "username and text are required" });
  }

  const messages = loadMessages();
  const newMessage = {
    id: Date.now(),
    username,
    text,
    time: new Date().toTimeString().split(" ")[0],
    date: new Date().toLocaleDateString(),
    replyToId: replyToId || null, 
  };

  messages.push(newMessage);
  saveMessages(messages);
  res.status(201).json(newMessage);
});

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

app.delete("/api/message/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ error: "invalid id" });

  let messages = loadMessages();
  const index = messages.findIndex((msg) => msg.id === id);
  if (index === -1) return res.status(404).json({ error: "message not found" });

  const deleted = messages.splice(index, 1)[0];
  saveMessages(messages);
  res.json(deleted);
});

// --- Start Server ---
app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:3000");
});

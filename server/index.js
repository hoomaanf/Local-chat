const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const cors = require("cors");
app.use(cors());

app.use(express.json());

const DATA_FILE = path.join(__dirname, "messages.json");

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

app.get("/api/messages", (req, res) => {
  const messages = loadMessages();
  res.json(messages);
});

app.post("/api/message", (req, res) => {
  const { username, text } = req.body;
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
  };
  messages.push(newMessage);
  saveMessages(messages);

  res.status(201).json(newMessage);
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

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:3000");
});

const { PeerServer } = require("peer");
const fs = require("fs");

PeerServer({
  port: 9000,
  path: "/myapp",
  ssl: {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
  },
});

console.log("✅ PeerJS Server running on https://0.0.0.0:9000");

---

🗨️ Local Chat + Voice Call

A real-time chat + voice calling application that runs entirely on your local network (LAN). No internet required. Built with React, Express, WebSocket, and WebRTC (PeerJS).

---

✨ Features

Feature Description
💬 Text Chat Send, edit, delete, reply, and react to messages

📎 File Sharing Upload images, videos, audio, PDFs, and more

📞 Voice Calls Peer-to-peer audio calls via WebRTC (PeerJS)

👥 Online Users List See who's online and call them directly

🎙️ Mute/Unmute Toggle microphone during calls

😀 Emoji Reactions Add/remove reactions on messages (like Telegram)

🎨 Glassmorphism UI Modern gradient design with glass effects

📅 Date Dividers "Today", "Yesterday", and date separators

🔔 Sound Notifications Audio alert for new messages & incoming calls

🔔 Desktop Notifications Browser notifications when tab is inactive

🛡️ SSL Support Self-signed certificates for secure media access

🐳 Docker Ready Single command deployment

---

🛠️ Tech Stack

Layer Technology
Frontend React 19, Vite, TailwindCSS 4, Lucide Icons
Backend Express, WebSocket (ws), Multer
Voice Calls PeerJS (WebRTC)
Database JSON files (local storage)
Security HTTPS with self-signed certificates
Container Docker & Docker Compose

---

📁 Project Structure

```
Local-chat/
├── frontEnd/                  # React + Vite frontend
│   ├── src/
│   │   ├── assets/sounds/     # Notification sounds
│   │   ├── components/        # UI components (30+ components)
│   │   ├── context/           # AuthContext, WebSocketContext
│   │   ├── hooks/             # usePeerCall, useSound, useVoiceRecorder
│   │   └── pages/             # Login, Chat pages
│   ├── vite.config.js
│   └── package.json
├── server/                    # Express backend
│   ├── index.js               # Main server (chat + REST API)
│   ├── messages.json          # Message storage
│   ├── users.json             # User profiles storage
│   └── uploads/               # Uploaded files (images, videos, etc.)
├── peerServer.js              # PeerJS signaling server
├── gen-cert.js                # SSL certificate generator
├── Dockerfile                 # Docker build
├── docker-compose.yml         # Docker Compose config
└── README.md
```

---

🚀 Quick Start

With Docker (Recommended)

```bash
docker compose up -d --build
```

Then open: https://localhost:5173

Note: Accept the self-signed SSL certificate on first use.

---

Manual Setup

1. Generate SSL Certificates

```bash
node gen-cert.js
```

2. Start Backend Server

```bash
cd server && npm install && node index.js
# → https://localhost:3000
```

3. Start PeerJS Server

```bash
node peerServer.js
# → https://localhost:9000/myapp
```

4. Start Frontend

```bash
cd frontEnd && npm install && npm run dev
# → https://localhost:5173
```

---

🌐 LAN Setup

Both devices must be on the same local network.

1. Find your machine's local IP:
   ```bash
   ip addr show | grep "inet " | grep -v 127.0.0.1
   ```
2. Open frontend on other devices: https://YOUR_IP:5173
3. Enter the same IP in the Server IP field when logging in.
4. Accept the SSL certificate on each device.

---

📞 Making a Call

1. Login with your phone number + OTP code
2. Click the Users button (👥) to see online users
3. Click the Phone icon (📞) next to a user to call
4. Answer or reject incoming calls via the popup modal
5. Toggle microphone with the mic button during calls

---

🔐 Login System

Step Description
1 Enter your display name
2 Enter your phone number
3 Server generates a 4-digit code
4 Enter the code to verify
5 Logged in!

---

🐳 Docker

```bash
# Build & run with Compose
docker compose up -d --build

# Or build & run manually
docker build -t local-chat .
docker run -d --name local-chat -p 3000:3000 -p 5173:5173 -p 9000:9000 local-chat
```

---

📝 Notes

· SSL Certificates: Self-signed. Browsers will show a security warning. Accept it to proceed.
· Media Access: Camera/microphone require HTTPS or localhost.
· Firewall: Ensure ports 3000, 5173, and 9000 are allowed.
· Storage: Messages and user profiles are stored in JSON files.
· Audio Autoplay: Browsers block autoplay. First click anywhere on the page to unlock sounds.

---

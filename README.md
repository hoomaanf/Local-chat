# 🗨️ Local Chat + Voice Call

A **real-time chat + voice calling** application that runs entirely on your **local network (LAN)**. No internet required. Built with **React**, **Express**, **WebSocket**, and **WebRTC (PeerJS)**.

---

## ✨ Features

| Feature                      | Description                                      |
| :--------------------------- | :----------------------------------------------- |
| 💬 **Text Chat**             | Send, edit, delete, reply, and react to messages |
| 📎 **File Sharing**          | Upload images, videos, audio, PDFs, and more     |
| 📞 **Voice Calls**           | Peer-to-peer audio calls via WebRTC (PeerJS)     |
| 👥 **Online Users List**     | See who's online and call them directly          |
| 🎙️ **Mute/Unmute**           | Toggle microphone during calls                   |
| 🔔 **Desktop Notifications** | Get notified of new messages                     |
| 🛡️ **SSL Support**           | Self-signed certificates for secure media access |
| 🐳 **Docker Ready**          | Single command deployment                        |

---

## 🛠️ Tech Stack

| Layer           | Technology                             |
| :-------------- | :------------------------------------- |
| **Frontend**    | React, Vite, TailwindCSS, Lucide Icons |
| **Backend**     | Express, WebSocket (ws), Multer        |
| **Voice Calls** | PeerJS (WebRTC)                        |
| **Database**    | JSON files (local storage)             |
| **Security**    | HTTPS with self-signed certificates    |
| **Container**   | Docker & Docker Compose                |

---

## 📁 Project Structure

```
Local-chat/
├── frontEnd/               # React + Vite frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── context/        # Auth & WebSocket contexts
│   │   ├── hooks/          # Custom hooks (usePeerCall, useRenderFile)
│   │   └── pages/          # Login, Chat pages
│   ├── vite.config.js
│   └── package.json
├── server/                 # Express backend
│   ├── index.js            # Main server (chat + peer)
│   ├── messages.json       # Message storage
│   ├── users.json          # User profiles storage
│   └── uploads/            # Uploaded files
├── peerServer.js           # PeerJS signaling server
├── Dockerfile              # Docker build
├── docker-compose.yml      # Docker Compose config
└── README.md
```

---

## 🚀 Quick Start

### With Docker (Recommended)

```bash
# Build and run all services (Backend + Frontend + PeerJS)
docker compose up -d --build
```

Then open:

- **Frontend:** `https://localhost:5173`
- **Backend API:** `https://localhost:3000`
- **PeerJS Server:** `https://localhost:9000/myapp`

> **Note:** You need to **accept the self-signed SSL certificate** for each URL on first use.

---

### Manual Setup

#### 1. Generate SSL Certificates

```bash
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout key.pem -out cert.pem -days 365 \
  -subj "/CN=localhost"
```

#### 2. Start Backend Server

```bash
cd server
npm install
node index.js
```

Server starts at `https://localhost:3000`.

#### 3. Start PeerJS Server

```bash
node peerServer.js
```

PeerJS starts at `https://localhost:9000`.

#### 4. Start Frontend

```bash
cd frontEnd
npm install
npm run dev
```

Frontend starts at `https://localhost:5173`.

---

## 🌐 LAN Setup

Both devices must be on the **same local network**.

1. Find your machine's local IP:

   ```bash
   ip addr show | grep "inet " | grep -v 127.0.0.1
   ```

2. Open the frontend on other devices:

   ```
   https://YOUR_IP:5173
   ```

3. Enter the **same IP** when logging in (Server IP field).

---

## 📞 Making a Call

1. Login with a username
2. Click the **Users** button (👥) to see online users
3. Click the **Phone** icon (📞) next to a user to call
4. Answer or reject incoming calls via the popup modal

---

## 🔧 Configuration

### Default Ports

| Service      | Port | Config File               |
| :----------- | :--- | :------------------------ |
| **Frontend** | 5173 | `frontEnd/vite.config.js` |
| **Backend**  | 3000 | `server/index.js`         |
| **PeerJS**   | 9000 | `peerServer.js`           |

### Change Ports

- **Frontend:** Edit `port` in `vite.config.js`
- **Backend:** Edit `server.listen(3000)` in `server/index.js`
- **PeerJS:** Edit `port: 9000` in `peerServer.js`

---

## 🐳 Docker

```bash
# Build image
docker build -t local-chat .

# Run container
docker run -d \
  --name local-chat \
  -p 3000:3000 \
  -p 5173:5173 \
  -p 9000:9000 \
  local-chat

# Or use Docker Compose
docker compose up -d
```

---

## 📝 Notes

- **SSL Certificates:** Self-signed. Browsers will show a security warning. Accept it to proceed.
- **Media Access:** Camera/microphone require HTTPS or localhost. This app uses HTTPS with self-signed certs.
- **Firewall:** Ensure ports 3000, 5173, and 9000 are allowed on your network.
- **Storage:** Messages and user profiles are stored in JSON files inside the `server/` directory.

---

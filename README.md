# 🗨️ LAN Chat App (React + Node.js)

A lightweight real-time chat application built using **React** for the frontend and **Node.js** for the backend.  
Messages are saved in a local `messages.json` file. The app runs entirely on your **local network (LAN)** – no internet required.

---

## 📁 Project Structure

``` bash
project-root/
├── server/ # Node.js backend
│ ├── index.js # Entry point
│ └── messages.json # Message storage
│
└── frontend/ # React frontend (Vite)
```

---

## 🚀 How to Run

### 1. Start Backend Server

```bash
cd server
node index.js

This starts the server at http://localhost:3000
```

💡 You can access it from other devices on the same LAN by using your IP:  http://192.168.x.x

### 1. Start Frontend Server

``` bash
cd frontend
npm install
npm run dev

This starts the server at http://localhost:3000
```

💡 You can access it from other devices on the same LAN by using your IP:  http://192.168.x.x:3000

## 💬 Messages

Messages are stored locally in:
``` bash
server/messages.json
```

## 🌐 LAN Support

Both devices must be on the same Wi-Fi or local network.
In the frontend code, replace localhost with the local IP of the server if needed:
``` bash
fetch("http://192.168.x.x:3000/messages")
```


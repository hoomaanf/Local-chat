import { useState } from "react";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [serverIp, setServerIp] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && serverIp.trim()) {
      localStorage.setItem("username", username);
      localStorage.setItem("server_ip", serverIp);
      onLogin({ username, serverIp });
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg space-y-5 w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold text-center text-blue-600">
          🔐 Login
        </h2>

        <input
          type="text"
          placeholder="Enter your username"
          className="w-full border border-blue-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter server IP (e.g. http://192.168.1.10:3000)"
          className="w-full border border-blue-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={serverIp}
          onChange={(e) => setServerIp(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
        >
          Start Chatting
        </button>
      </form>
    </div>
  );
}

export default LoginPage;

import { useState } from "react";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [serverIp, setServerIp] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && serverIp.trim()) {
      onLogin({ username, serverIp });
    }
  };

  return (
    <div className="flex items-center justify-center h-dvh bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-8 rounded-2xl shadow-lg space-y-5 w-full max-w-sm border border-gray-700"
      >
        <h2 className="text-2xl font-bold text-center text-blue-400">
          🔐 Login
        </h2>

        <input
          type="text"
          placeholder="Enter your username"
          className="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter server IP (e.g. 192.168.1.10)"
          className="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-600 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

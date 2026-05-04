import { useState, useEffect } from "react";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [serverIp, setServerIp] = useState("");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const loginRequest = async (uname, ip, file = null) => {
    const formData = new FormData();
    formData.append("username", uname);
    if (file) formData.append("profile", file);

    setLoading(true);
    try {
      const res = await fetch(`http://${ip}:3000/api/login`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("username", uname);
        localStorage.setItem("serverIp", ip);
        onLogin({
          username: data.username,
          serverIp: ip,
          profileUrl: data.profileUrl,
        });
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      alert("Connection error");
    }
    setLoading(false);
  };

  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    const savedServerIp = localStorage.getItem("serverIp");

    if (savedUsername && savedServerIp) {
      loginRequest(savedUsername, savedServerIp);
    } else {
      if (savedUsername) setUsername(savedUsername);
      if (savedServerIp) setServerIp(savedServerIp);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !serverIp.trim()) return;
    loginRequest(username, serverIp, profile);
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

        <input
          type="file"
          accept="image/*"
          className="w-full bg-gray-800 text-white border border-gray-600 rounded-xl p-2 file:bg-gray-700 file:text-white file:border-0 file:px-3 file:py-1 file:rounded-lg file:hover:bg-gray-600"
          onChange={(e) => setProfile(e.target.files[0])}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Start Chatting"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;

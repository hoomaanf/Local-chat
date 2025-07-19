import { useState, useEffect } from "react";
import LoginPage from "./pages/Login";
import Chat from "./pages/Chat";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const username = localStorage.getItem("username");
    const serverIp = localStorage.getItem("server_ip");

    if (username && serverIp) {
      setUser({ username, serverIp });
    } else {
      setUser(null);
    }
  }, []); // فقط یک‌بار بعد از mount اجرا می‌شه

  const handleLogin = ({ username, serverIp }) => {
    localStorage.setItem("username", username);
    localStorage.setItem("server_ip", serverIp);
    setUser({ username, serverIp });
  };

  return (
    <>
      {!user ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <Chat username={user.username} serverIp={user.serverIp} />
      )}
    </>
  );
}

export default App;

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [username, setUsername] = useState("");
  const [serverIp, setServerIp] = useState("");

  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    const savedServerIp = localStorage.getItem("server_ip");
    if (savedUsername && savedServerIp) {
      setUsername(savedUsername);
      setServerIp(savedServerIp);
    }
  }, []);

  const login = (user, ip) => {
    localStorage.setItem("username", user);
    localStorage.setItem("server_ip", ip);
    setUsername(user);
    setServerIp(ip);
  };

  const logout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("server_ip");
    setUsername("");
    setServerIp("");
  };

  return (
    <AuthContext.Provider value={{ username, serverIp, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

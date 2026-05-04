import { createContext, useContext, useState, useEffect } from "react";
import useCheckPing from "../hooks/useCheckPing";
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [username, setUsername] = useState("");
  const [serverIp, setServerIp] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const checkStoredAuth = async () => {
      const storedUsername = localStorage.getItem("username");
      const storedServerIp = localStorage.getItem("serverIp");

      if (storedUsername && storedServerIp) {
        const res = await useCheckPing(storedServerIp);

        if (res) {
          setUsername(storedUsername);
          setServerIp(storedServerIp);
        }
      }
    };

    checkStoredAuth();
    setLoading(false);
  }, []);

  const login = (user, ip) => {
    setUsername(user);
    setServerIp(ip);
    localStorage.setItem("username", user);
    localStorage.setItem("serverIp", ip);
  };

  const logout = () => {
    setUsername("");
    setServerIp("");
    localStorage.removeItem("username");
    localStorage.removeItem("serverIp");
  };

  return (
    <AuthContext.Provider
      value={{ username, serverIp, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

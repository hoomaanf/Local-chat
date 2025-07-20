import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [username, setUsername] = useState("");
  const [serverIp, setServerIp] = useState("");

  const login = (user, ip) => {
    setUsername(user);
    setServerIp(ip);
  };

  const logout = () => {
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

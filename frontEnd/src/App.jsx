import LoginPage from "./pages/Login";
import Chat from "./pages/Chat";
import Loading from "./components/Loading";
import { useAuth } from "./context/AuthContext";
import { useEffect, useState } from "react";

function App() {
  const { login, username, serverIp, loading } = useAuth();

  const handleLogin = ({ username, serverIp }) => {
    login(username, serverIp);
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-screen bg-gray-900">
          <Loading />
        </div>
      ) : (
        <div>
          {!username ? (
            <LoginPage onLogin={handleLogin} />
          ) : (
            <Chat serverIp={serverIp} />
          )}
        </div>
      )}
    </>
  );
}

export default App;

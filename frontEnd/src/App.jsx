import LoginPage from "./pages/Login";
import Chat from "./pages/Chat";
import { useAuth } from "./context/AuthContext";

function App() {
  const { login, username, serverIp } = useAuth();

  const handleLogin = ({ username, serverIp }) => {
    login(username, serverIp);
  };

  return (
    <>
      {!username ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <Chat username={username} serverIp={serverIp} />
      )}
    </>
  );
}

export default App;

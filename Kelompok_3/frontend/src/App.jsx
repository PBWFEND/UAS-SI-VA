import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const [isLogin, setIsLogin] = useState(
    !!localStorage.getItem("token")
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLogin(false);
  };

  return (
    <>
      {isLogin ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLogin={() => setIsLogin(true)} />
      )}
    </>
  );
}

export default App;

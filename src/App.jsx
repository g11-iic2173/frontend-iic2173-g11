import { useState } from "react";
import AuthPage from "./pages/AuthPage";
import PropertiesPage from "./pages/PropertiesPage";

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  const handleLogin = () => {
    setLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
  };

  return loggedIn ? (
    <PropertiesPage onLogout={handleLogout} /> 
  ) : (
    <AuthPage onLogin={handleLogin} />
  );
}

export default App;

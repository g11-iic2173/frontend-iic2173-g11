import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import MyVisitsPage from "./pages/MyVisitsPage";
import ConfirmPurchasePage from "./pages/ConfirmPurchasePage";
import PurchaseCompletedPage from "./pages/PurchaseCompletedPage";

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  const handleLogin = () => {
    setLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
  };

    
  return (
    loggedIn ? (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PropertiesPage onLogout={handleLogout} />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/my-visits" element={<MyVisitsPage />} />
          <Route path="/confirm-purchase" element={<ConfirmPurchasePage />} />
          <Route path="/purchase-completed" element={<PurchaseCompletedPage />} />
          <Route path="/completed-purchase" element={<PurchaseCompletedPage />} />
          
        </Routes>
      </BrowserRouter>
    ) : (
      <AuthPage onLogin={handleLogin} />
    )
  );

}

export default App;

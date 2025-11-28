import { Routes, Route, useNavigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import MyVisitsPage from "./pages/MyVisitsPage";
import ReservedVisitsPage from "./pages/ReservedVisitsPage";
import ConfirmPurchasePage from "./pages/ConfirmPurchasePage";
import PurchaseCompletedPage from "./pages/PurchaseCompletedPage";
import RequireAuth from "./components/RequireAuth";
import ConfirmAdminSale from "./pages/ConfirmAdminSale";
import AdminSaleCompleted from "./pages/AdminSaleCompleted";

function App() {
  const navigate = useNavigate();

  const handleLogin = (data) => {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("username", data.username);

    if (data.role === "admin") navigate("/admin");
    else navigate("/");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth");
  };

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <PropertiesPage onLogout={handleLogout} />
          </RequireAuth>
        }
      />
      <Route
        path="/properties/:id"
        element={
          <RequireAuth>
            <PropertyDetailPage />
          </RequireAuth>
        }
      />
      <Route
        path="/my-visits"
        element={
          <RequireAuth>
            <MyVisitsPage />
          </RequireAuth>
        }
      />
      <Route path="/reserved-visits" element={<ReservedVisitsPage />} />
      <Route
        path="/confirm-purchase"
        element={
          <RequireAuth>
            <ConfirmPurchasePage />
          </RequireAuth>
        }
      />
      <Route
        path="/completed-purchase"
        element={
          <RequireAuth>
            <PurchaseCompletedPage />
          </RequireAuth>
        }
      />
      <Route
        path="/confirm-admin-sale/:id"
        element={
            <ConfirmAdminSale />
        }
      />
      <Route
        path="/admin-sale-completed"
        element={
            <AdminSaleCompleted />
        }
      />
    </Routes>
  );
}

export default App;

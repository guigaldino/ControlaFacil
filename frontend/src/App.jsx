import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { HeaderU } from "./components/HeaderU";
import { HomeU } from "./pages/HomeU";
import { LoginU } from "./pages/LoginU";
import { LandingPage } from "./pages/LandingPage";
import { Cadastro } from "./pages/Cadastro";
import { MeusDados } from "./pages/MeusDados";
import { CadastroParceiro } from "./pages/CadastroParceiro";
import { CadastroProduto } from "./pages/CadastroProduto";
import { Estoque } from "./pages/Estoque";
import { EmailConfirmation } from "./pages/EmailConfirmation";
import { EmailValidado } from "./pages/EmailValidado"
import { EmailValidationFailed } from "./pages/EmailValidationFailed";
import { DashboardEstoque } from "./pages/DashBoardEstoque";
import { MarketplaceIntegrations } from "./pages/MarketplaceIntegrations";
import { MarketplaceAuthSuccess } from "./pages/MarketplaceAuthSuccess";
import { MarketplaceAuthError } from "./pages/MarketplaceAuthError";
import { MarketplaceCallback } from "./pages/MarketplaceCallback";
import { Pedidos } from "./pages/Pedidos";
import { Relatorios } from "./pages/Relatorios";
import './global.css';

function LayoutWithHeader() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const hideHeaderOnRoutes = ["/", "/login", "/cadastro", "/email-confirmacao", "/email-validado", "/email-falha-validacao", "/ml-auth-success", "/ml-auth-error", "/ml-callback"];

  useEffect(() => {
    if (isSidebarCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }, [isSidebarCollapsed]);

  return (
    <div className="main-layout">
      {!hideHeaderOnRoutes.includes(location.pathname) && (
        <HeaderU 
          isCollapsed={isSidebarCollapsed} 
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
      )}
      <main className="content-wrapper">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginU />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/dashboard" element={<DashboardEstoque />} />
          <Route path="/home" element={<HomeU />} />
          <Route path="/meus-dados" element={<MeusDados />} />
          <Route path="/cadastro-parceiro" element={<CadastroParceiro />} />
          <Route path="/cadastro-produto" element={<CadastroProduto />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/marketplaces" element={<MarketplaceIntegrations />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/ml-auth-success" element={<MarketplaceAuthSuccess />} />
          <Route path="/ml-auth-error" element={<MarketplaceAuthError />} />
          <Route path="/ml-callback" element={<MarketplaceCallback />} />
          <Route path="/email-confirmacao" element={<EmailConfirmation />} />
          <Route path="/email-validado" element={<EmailValidado />} />
          <Route path="/email-falha-validacao" element={<EmailValidationFailed />} />
        </Routes>
      </main>
    </div>
  );
}

export function App() {
  return (
    <Router>
      <LayoutWithHeader />
    </Router>
  );
}

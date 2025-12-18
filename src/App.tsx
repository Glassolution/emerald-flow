import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import { AuthLayout } from "@/components/layout/AuthLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Public Pages
import Landing from "@/pages/Landing";
import Planos from "@/pages/Planos";
import Ajuda from "@/pages/Ajuda";

// Auth Pages
import Login from "@/pages/auth/Login";
import Cadastro from "@/pages/auth/Cadastro";
import RecuperarSenha from "@/pages/auth/RecuperarSenha";

// Onboarding
import Onboarding from "@/pages/Onboarding";

// App Pages
import Dashboard from "@/pages/app/Dashboard";
import ChatIA from "@/pages/app/ChatIA";
import Configuracoes from "@/pages/app/Configuracoes";
import AdminMetricas from "@/pages/app/admin/Metricas";

// Misc
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/planos" element={<Planos />} />
          <Route path="/ajuda" element={<Ajuda />} />
          
          {/* Auth Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="cadastro" element={<Cadastro />} />
            <Route path="recuperar-senha" element={<RecuperarSenha />} />
          </Route>

          {/* Onboarding */}
          <Route path="/onboarding" element={<Onboarding />} />

          {/* App Routes (Protected) */}
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="chat" element={<ChatIA />} />
            <Route path="configuracoes" element={<Configuracoes />} />
            
            {/* Admin Routes */}
            <Route path="admin/metricas" element={<AdminMetricas />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

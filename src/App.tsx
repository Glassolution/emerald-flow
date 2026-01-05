import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RouteTransitionLoader } from "@/components/ui/RouteTransitionLoader";

// Layouts
import { MobileLayout } from "@/components/layout/MobileLayout";

// Public Pages
import SplashPage from "@/pages/SplashPage";
import LoadingPage from "@/pages/LoadingPage";
import Onboarding from "@/pages/Onboarding";
import Welcome from "@/pages/auth/Welcome";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ProfileSetup from "@/pages/auth/ProfileSetup";

// App Pages (Protected - Main Navigation)
import Home from "@/pages/app/Home";
import Calc from "@/pages/app/Calc";
import Produtos from "@/pages/app/Produtos";
import Favoritos from "@/pages/app/Favoritos";
import Calculos from "@/pages/app/Calculos";
import Receitas from "@/pages/app/Receitas";
import CalculationDetails from "@/pages/app/CalculationDetails";
import Perfil from "@/pages/app/Perfil";
import OperacoesPage from "@/pages/app/OperacoesPage";
import OperationDetails from "@/pages/app/OperationDetails";

// App version for logging
const APP_VERSION = "2.0.0";
console.log(`🚀 [App] Calc v${APP_VERSION} iniciando...`);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RouteTransitionLoader />
          <Routes>
            {/* Root - SplashPage com lógica de roteamento */}
            <Route path="/" element={<SplashPage />} />
            
            {/* Loading page - aparece após login */}
            <Route path="/loading" element={<LoadingPage />} />
            
            {/* Welcome - tela inicial para novos usuários */}
            <Route path="/welcome" element={<Welcome />} />
            
            {/* Onboarding - segunda tela do fluxo inicial */}
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* Public Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            
            {/* Profile Setup - Protected but separate route */}
            <Route element={<ProtectedRoute />}>
              <Route path="/auth/profile-setup" element={<ProfileSetup />} />
            </Route>
            
            {/* Protected App Routes - requires login */}
            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<MobileLayout />}>
                {/* Default route - redireciona para home */}
                <Route index element={<Navigate to="/app/home" replace />} />
                
                {/* Bottom Navigation Routes */}
                <Route path="home" element={<Home />} />
                <Route path="calc" element={<Calc />} />
                <Route path="produtos" element={<Produtos />} />
                <Route path="favoritos" element={<Favoritos />} />
                <Route path="favoritos/:id" element={<CalculationDetails />} />
                <Route path="calculos" element={<Calculos />} />
                <Route path="receitas" element={<Receitas />} />
                <Route path="operacoes" element={<OperacoesPage />} />
                <Route path="operacoes/:id" element={<OperationDetails />} />
                <Route path="perfil" element={<Perfil />} />
              </Route>
            </Route>

            {/* Catch all - redirect to splash (decisão de rota lá) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

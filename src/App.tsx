import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Layouts
import { MobileLayout } from "@/components/layout/MobileLayout";

// Public Pages
import SplashPage from "@/pages/SplashPage";
import Onboarding from "@/pages/Onboarding";
import Welcome from "@/pages/auth/Welcome";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ProfileSetup from "@/pages/auth/ProfileSetup";

// App Pages (Protected - Main Navigation)
import Home from "@/pages/app/Home";
import Calc from "@/pages/app/Calc";
import Favoritos from "@/pages/app/Favoritos";
import Perfil from "@/pages/app/Perfil";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Root - Splash screen decides the flow */}
            <Route path="/" element={<SplashPage />} />
            
            {/* Onboarding - for first-time users */}
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* Public Auth Routes */}
            <Route path="/welcome" element={<Welcome />} />
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
                <Route path="favoritos" element={<Favoritos />} />
                <Route path="perfil" element={<Perfil />} />
              </Route>
            </Route>

            {/* Catch all - redirect to welcome */}
            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

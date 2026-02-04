import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth
import { AuthProvider } from "@/contexts/AuthContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SubscriptionGuard } from "@/components/auth/SubscriptionGuard";
import { RouteTransitionLoader } from "@/components/ui/RouteTransitionLoader";
import { I18nProvider } from "@/contexts/I18nContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";

// Layouts
import { MobileLayout } from "@/components/layout/MobileLayout";

// Public Pages
import SplashPage from "@/pages/SplashPage";
import LoadingPage from "@/pages/LoadingPage";
import Landing from "@/pages/Landing";
import Subscription from "@/pages/Subscription";
import QuizStep from "@/pages/onboarding/QuizStep";
import QuizCongrats from "@/pages/onboarding/QuizCongrats";
import QuizSuccess from "@/pages/onboarding/QuizSuccess";
import QuizLoading from "@/pages/onboarding/QuizLoading";
import PlanReady from "@/pages/onboarding/PlanReady";
import StartExperience from "@/pages/onboarding/StartExperience";
import Checkout from "@/pages/onboarding/Checkout";
import PaymentSelection from "@/pages/onboarding/PaymentSelection";
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
import Configuracoes from "@/pages/app/Configuracoes";
import Ajuda from "@/pages/Ajuda";
import OperacoesPage from "@/pages/app/OperacoesPage";
import OperationDetails from "@/pages/app/OperationDetails";
import "./App.css";

// App version for logging
const APP_VERSION = "2.0.0";
console.log(`🚀 [App] Calc v${APP_VERSION} iniciando...`);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <OnboardingProvider>
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
                <Route path="/landing" element={<Landing />} />
                
                {/* Welcome - redireciona para landing */}
                <Route path="/welcome" element={<Navigate to="/landing" replace />} />

                {/* Quiz Onboarding Flow */}
                <Route path="/onboarding/quiz" element={<QuizStep />} />
                <Route path="/onboarding/congrats" element={<QuizCongrats />} />
                <Route path="/onboarding/success" element={<QuizSuccess />} />
                <Route path="/onboarding/loading" element={<QuizLoading />} />
                <Route path="/onboarding/plan-ready" element={<PlanReady />} />
                <Route path="/onboarding/start-experience" element={<StartExperience />} />
                <Route path="/onboarding/payment-selection" element={<PaymentSelection />} />
                <Route path="/onboarding/checkout" element={<Checkout />} />
                
                {/* Public Auth Routes */}
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                
                {/* Profile Setup - Protected but separate route */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/auth/profile-setup" element={<ProfileSetup />} />
                  <Route path="/subscription" element={<Subscription />} />
                </Route>
                
                {/* Protected App Routes - requires login */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<SubscriptionGuard />}>
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
                      <Route path="configuracoes" element={<Configuracoes />} />
                      <Route path="ajuda" element={<Ajuda />} />
                    </Route>
                  </Route>
                </Route>

                {/* Catch all - redirect to splash */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
          </OnboardingProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;

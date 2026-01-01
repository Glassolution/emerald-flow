import { Link, Navigate, useNavigate } from "react-router-dom";
import { Plane, Droplets, Calculator, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { useEffect, useState } from "react";
import { SplashScreen } from "@/components/ui/SplashScreen";
import { HAS_SEEN_ONBOARDING_KEY } from "@/pages/Onboarding";
import { Chrome } from "lucide-react";

// Chave para marcar que o usuário acabou de fazer logout
const JUST_LOGGED_OUT_KEY = "calc_just_logged_out";

export default function Welcome() {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [forceShow, setForceShow] = useState(false);

  // Welcome é a tela inicial após onboarding
  // Não redirecionar automaticamente - deixar usuário escolher
  useEffect(() => {
    if (!loading) {
      const hasSeenOnboarding = localStorage.getItem(HAS_SEEN_ONBOARDING_KEY) === "1";
      
      // Se não viu onboarding ainda, redirecionar para onboarding
      if (!hasSeenOnboarding) {
        navigate("/onboarding", { replace: true });
        return;
      }
    }
  }, [loading, navigate]);

  // Force show content after max 1.5 seconds to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceShow(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading only if still loading AND not forced to show
  if (loading && !forceShow) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Logo size="lg" className="animate-pulse mb-4" />
          <div className="relative">
            <div className="w-8 h-8 border-2 border-green-500/20 rounded-full" />
            <div className="absolute inset-0 w-8 h-8 border-2 border-transparent border-t-green-500 rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // Redirect to app if already logged in
  // Welcome só deve aparecer para usuários deslogados (após logout)
  useEffect(() => {
    if (user && !loading) {
      const checkProfile = async () => {
        const { isProfileComplete } = await import("@/lib/userProfile");
        const profileComplete = await isProfileComplete();
        if (profileComplete) {
          navigate("/app/home", { replace: true });
        } else {
          navigate("/auth/profile-setup", { replace: true });
        }
      };
      checkProfile();
    }
  }, [user, loading, navigate]);

  // Se estiver logado, redirecionar (Welcome só para deslogados)
  if (user) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Pattern - Subtle geometric design */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 80% 70%, rgba(34, 197, 94, 0.08) 0%, transparent 50%),
                            linear-gradient(135deg, transparent 0%, rgba(34, 197, 94, 0.03) 50%, transparent 100%)`
        }} />
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-8">
        {/* Logo */}
        <div className="relative mb-8">
          <Logo size="xl" showText={true} />
        </div>

        {/* Tagline */}
        <p className="text-gray-400 text-lg font-medium text-center mb-12">
          Pulverização Agrícola com Drones
        </p>

        {/* Features Cards */}
        <div className="w-full max-w-md space-y-4 mb-12">
          <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
            <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
              <Plane size={28} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base mb-1">Drones Agrícolas</h3>
              <p className="text-sm text-gray-400">Pulverização precisa e eficiente</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
            <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
              <Calculator size={28} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base mb-1">Calculadora de Calda</h3>
              <p className="text-sm text-gray-400">Mistura perfeita para cada tanque</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
            <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
              <Droplets size={28} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base mb-1">Múltiplos Produtos</h3>
              <p className="text-sm text-gray-400">Gestão completa de defensivos</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="w-full max-w-md space-y-3">
          {/* Google Login Button */}
          <button
            onClick={async () => {
              const { error } = await signInWithGoogle();
              if (error) {
                console.error("Erro ao fazer login com Google:", error);
              }
            }}
            className="flex items-center justify-center gap-3 w-full h-16 bg-white text-[#1a1a1a] font-semibold rounded-2xl hover:bg-gray-100 active:scale-[0.98] transition-all text-lg shadow-lg"
          >
            <Chrome size={22} />
            Continuar com Google
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <Link
            to="/auth/login"
            className="flex items-center justify-center gap-2 w-full h-16 bg-[#22c55e] text-white font-semibold rounded-2xl hover:bg-[#16a34a] active:scale-[0.98] transition-all text-lg"
          >
            Entrar
            <ArrowRight size={22} />
          </Link>

          <Link
            to="/auth/register"
            className="flex items-center justify-center w-full h-16 bg-white/5 text-white font-semibold rounded-2xl hover:bg-white/10 active:scale-[0.98] transition-all border border-white/10 text-lg"
          >
            Criar conta
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-500">© 2025 Calc. Pulverização Agrícola.</p>
        </div>
      </div>
    </div>
  );
}

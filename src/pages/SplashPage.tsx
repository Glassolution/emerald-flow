import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logoCalc from "@/assets/logo-calc.png";
import { isProfileComplete } from "@/lib/userProfile";
import { HAS_SEEN_ONBOARDING_KEY } from "@/pages/Onboarding";

export default function SplashPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(HAS_SEEN_ONBOARDING_KEY) === "1";
    
    // Função para fazer o redirecionamento
    const doRedirect = async () => {
      setIsVisible(false);
      
      // Pequeno delay para animação de fade
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Se usuário está logado, redirecionar para app
      if (user) {
        try {
          const profileComplete = await isProfileComplete();
          if (profileComplete) {
            navigate("/app/home", { replace: true });
          } else {
            navigate("/auth/profile-setup", { replace: true });
          }
        } catch (error) {
          console.error("❌ [SplashPage] Erro ao verificar perfil:", error);
          // Em caso de erro, redirecionar para profile-setup
          navigate("/auth/profile-setup", { replace: true });
        }
      } else {
        // Se não está logado, verificar se é primeira vez
        if (!hasSeenOnboarding) {
          // Primeira vez: ir para Onboarding
          navigate("/onboarding", { replace: true });
        } else {
          // Já passou pelo onboarding: ir para login
          navigate("/auth/login", { replace: true });
        }
      }
    };

    // Se ainda está carregando, aguardar (mas com timeout de segurança)
    if (loading) {
      // Timeout de segurança: se loading demorar mais de 3 segundos, prosseguir mesmo assim
      const loadingTimeout = setTimeout(() => {
        console.warn("⚠️ [SplashPage] Loading demorou muito, prosseguindo...");
        doRedirect();
      }, 3000);
      
      return () => clearTimeout(loadingTimeout);
    }

    // Se não está mais carregando, fazer o redirecionamento após um delay mínimo
    // para mostrar a splash screen por pelo menos 1.5 segundos
    const minDisplayTime = setTimeout(() => {
      doRedirect();
    }, 1500);

    return () => {
      clearTimeout(minDisplayTime);
    };
  }, [navigate, user, loading]);

  return (
    <div
      className={`fixed inset-0 bg-[#22c55e] flex items-center justify-center z-50 transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`flex flex-col items-center transition-all duration-500 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Logo Container with Loading Ring */}
        <div className="relative mb-8">
          {/* Loading Ring Animation */}
          <svg
            className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] animate-spin-slow"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="2"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="72 216"
              className="origin-center"
            />
          </svg>
          
          {/* White Circle with Logo */}
          <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-lg">
            <img 
              src={logoCalc} 
              alt="Calc Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
        </div>
        
        {/* App Name */}
        <h1 className="text-3xl font-bold text-white tracking-wide">
          Calc
        </h1>
      </div>
    </div>
  );
}

// FIRST_RUN_KEY removido - usando HAS_SEEN_ONBOARDING_KEY do Onboarding


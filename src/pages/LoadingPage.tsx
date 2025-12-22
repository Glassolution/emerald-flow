import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logoCalc from "@/assets/logo-calc.png";
import { isProfileComplete } from "@/lib/userProfile";

/**
 * Página de loading que aparece após login
 * Mostra animação de splash e redireciona para o app ou onboarding
 */
export default function LoadingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Se ainda está carregando, aguardar
    if (loading) {
      return;
    }

    // Se não tem usuário, redirecionar para welcome
    if (!user) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          navigate("/welcome", { replace: true });
        }, 300);
      }, 1500); // Mostrar splash por 1.5s

      return () => clearTimeout(timer);
    }

    // Se tem usuário, verificar perfil e redirecionar
    const checkAndRedirect = async () => {
      setRedirecting(true);
      
      // Mostrar splash por pelo menos 1.5s
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const profileComplete = await isProfileComplete();
      
      setIsVisible(false);
      
      setTimeout(() => {
        if (profileComplete) {
          navigate("/app/home", { replace: true });
        } else {
          navigate("/auth/profile-setup", { replace: true });
        }
      }, 300);
    };

    checkAndRedirect();
  }, [user, loading, navigate]);

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
        
        {/* Loading Text */}
        {redirecting && (
          <p className="text-white/80 text-sm mt-4 animate-pulse">
            Entrando...
          </p>
        )}
      </div>
    </div>
  );
}



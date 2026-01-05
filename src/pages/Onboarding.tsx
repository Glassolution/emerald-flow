import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft } from "lucide-react";
import maoImage from "@/assets/mão.png";

export const HAS_SEEN_ONBOARDING_KEY = "calc_has_seen_onboarding";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log("📍 [Onboarding] Componente montado");
    console.log("📍 [Onboarding] User:", user ? "logado" : "não logado");
    console.log("📍 [Onboarding] Loading:", loading);
    setMounted(true);
  }, []);

  // Se usuário já está logado, redirecionar para o app
  useEffect(() => {
    if (!loading && user) {
      console.log("🔄 [Onboarding] Usuário logado, indo para /app/home");
      navigate("/app/home", { replace: true });
    }
  }, [loading, user, navigate]);

  const handleStart = () => {
    localStorage.setItem(HAS_SEEN_ONBOARDING_KEY, "1");
    console.log("✅ [Onboarding] Marcando onboarding como visto");
    console.log("✅ [Onboarding] Navegando para /auth/login");
    navigate("/auth/login");
  };

  const handleBack = () => {
    console.log("✅ [Onboarding] Voltando para /welcome");
    navigate("/welcome", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      {/* Header com indicador de progresso e botão voltar */}
      <div className="pt-12 pb-6 px-6">
        {/* Botão voltar */}
        <button 
          onClick={handleBack}
          className="absolute left-4 top-12 p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft size={28} />
        </button>

        {/* Indicador de progresso */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-1 bg-gray-200 rounded-full"></div>
          <div className="w-8 h-1 bg-[#22c55e] rounded-full"></div>
        </div>
      </div>

      {/* Conteúdo central */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* Ícone da mão */}
        <div 
          className={`mb-12 transition-all duration-600 ease-out ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <img 
            src={maoImage} 
            alt="Bem-vindo" 
            className="w-32 h-32 md:w-40 md:h-40 object-contain"
            style={{ filter: "drop-shadow(0 6px 22px #22c55e22)" }}
          />
        </div>

        {/* Título */}
        <h1 
          className={`text-3xl md:text-4xl font-semibold text-[#1D1D1F] mb-4 text-center transition-all duration-600 ease-out ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ 
            transitionDelay: '200ms',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
            letterSpacing: '-0.02em',
            fontWeight: 600
          }}
        >
          Conecte-se para continuar
        </h1>

        {/* Texto descritivo */}
        <p 
          className={`text-base text-[#6E6E73] text-center max-w-sm mb-16 leading-relaxed transition-all duration-600 ease-out ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ 
            transitionDelay: '400ms',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
            fontWeight: 400
          }}
        >
          Faça login ou crie sua conta Calc para usar todos os recursos!
        </p>

        {/* Botão Começar */}
        <button
          onClick={handleStart}
          className={`w-full max-w-sm py-4 px-8 bg-[#22c55e] hover:bg-[#16a34a] text-white text-base font-semibold rounded-full transition-all duration-300 ease-out active:scale-[0.98] ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ 
            transitionDelay: '600ms',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
            letterSpacing: '0.01em',
            fontWeight: 600
          }}
        >
          Começar
        </button>
      </div>
    </div>
  );
}

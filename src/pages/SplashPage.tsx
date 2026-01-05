import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logoCalc from "@/assets/logo-calc.png";

// Versão do Welcome - incrementar quando quiser forçar exibição novamente
const WELCOME_VERSION = "v2";
const WELCOME_STORAGE_KEY = "calc_welcome_seen_version";

export default function SplashPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const hasRedirected = useRef(false);
  const [progress, setProgress] = useState(0);

  // Log inicial
  useEffect(() => {
    const seenVersion = localStorage.getItem(WELCOME_STORAGE_KEY);
    console.log("🚀 [SplashPage] Iniciando...");
    console.log("📍 [SplashPage] Welcome version:", WELCOME_VERSION);
    console.log("📍 [SplashPage] Seen version:", seenVersion);
    console.log("📍 [SplashPage] Auth loading:", loading);
    console.log("📍 [SplashPage] User:", user ? "logado" : "não logado");
  }, []);

  // Animação de progresso
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        const increment = prev < 70 ? 3 : prev < 90 ? 5 : 10;
        return Math.min(100, prev + increment);
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Função de redirecionamento
  const doRedirect = () => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;

    const seenVersion = localStorage.getItem(WELCOME_STORAGE_KEY);
    const needsWelcome = seenVersion !== WELCOME_VERSION;

    console.log("🔄 [SplashPage] Redirecionando...");
    console.log("📍 [SplashPage] Needs Welcome:", needsWelcome);
    console.log("📍 [SplashPage] User:", user ? "logado" : "não logado");

    // Se usuário está logado
    if (user) {
      console.log("✅ [SplashPage] Usuário logado, indo para /app/home");
      navigate("/app/home", { replace: true });
      return;
    }

    // Se precisa mostrar Welcome (nova versão ou primeiro acesso)
    if (needsWelcome) {
      console.log("✅ [SplashPage] Mostrando Welcome (versão nova ou primeiro acesso)");
      navigate("/welcome", { replace: true });
      return;
    }

    // Se já viu Welcome e não está logado, vai para login
    console.log("✅ [SplashPage] Welcome já visto, indo para /auth/login");
    navigate("/auth/login", { replace: true });
  };

  // Safety timeout: SEMPRE redireciona após 2.5 segundos
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      console.warn("⚠️ [SplashPage] Safety timeout atingido");
      doRedirect();
    }, 2500);

    return () => clearTimeout(safetyTimer);
  }, [navigate, user]);

  // Redireciona quando loading terminar E progresso chegar a 100%
  useEffect(() => {
    if (loading || hasRedirected.current || progress < 100) return;
    doRedirect();
  }, [navigate, user, loading, progress]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      {/* Container central com logo e spinner */}
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Spinner circular ao redor da logo */}
        <svg
          className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)] animate-spin"
          style={{ animationDuration: "1.2s", animationTimingFunction: "linear" }}
          viewBox="0 0 136 136"
        >
          {/* Círculo de fundo (cinza claro) */}
          <circle
            cx="68"
            cy="68"
            r="64"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="3"
          />
          {/* Círculo animado (verde) */}
          <circle
            cx="68"
            cy="68"
            r="64"
            fill="none"
            stroke="#22c55e"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="100 302"
          />
        </svg>
        
        {/* Logo da Calc no centro */}
        <img 
          src={logoCalc} 
          alt="Calc" 
          className="w-24 h-24 object-contain z-10 rounded-2xl"
        />
      </div>
    </div>
  );
}

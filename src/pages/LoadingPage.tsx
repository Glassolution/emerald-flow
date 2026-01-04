import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BouncingBallsLoader } from "@/components/ui/BouncingBallsLoader";
import { isProfileComplete } from "@/lib/userProfile";

/**
 * Página de loading que aparece após login
 * Mostra animação e redireciona para o app ou completar perfil
 */
export default function LoadingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Evita múltiplos redirects (ex: auth state mudando rápido)
  const didNavigateRef = useRef(false);

  const safeNavigate = useCallback(
    (to: string) => {
      if (didNavigateRef.current) return;
      didNavigateRef.current = true;
      navigate(to, { replace: true });
    },
    [navigate]
  );

  // Timeout absoluto: nunca ficar preso aqui para sempre
  useEffect(() => {
    const hardTimeout = window.setTimeout(() => {
      if (didNavigateRef.current) return;
      console.warn("⚠️ [LoadingPage] Timeout absoluto - forçando redirecionamento");

      // Se tiver usuário, mandar para completar perfil (rota segura)
      if (user) {
        safeNavigate("/auth/profile-setup");
      } else {
        safeNavigate("/auth/login");
      }
    }, 8000);

    return () => window.clearTimeout(hardTimeout);
  }, [user, safeNavigate]);

  useEffect(() => {
    // Enquanto auth ainda carrega, aguardar
    if (loading) return;

    // Sem usuário: voltar para login
    if (!user) {
      const timer = window.setTimeout(() => {
        safeNavigate("/auth/login");
      }, 1500);

      return () => window.clearTimeout(timer);
    }

    // Com usuário: checar perfil e redirecionar
    const checkAndRedirect = async () => {
      try {
        // Mostrar splash por pelo menos 1.5s
        await new Promise((resolve) => window.setTimeout(resolve, 1500));

        const profileComplete = await isProfileComplete();
        safeNavigate(profileComplete ? "/app/home" : "/auth/profile-setup");
      } catch (err) {
        console.error("❌ [LoadingPage] Erro ao redirecionar:", err);
        safeNavigate("/auth/login");
      }
    };

    checkAndRedirect();
  }, [user, loading, safeNavigate]);

  return <BouncingBallsLoader />;
}


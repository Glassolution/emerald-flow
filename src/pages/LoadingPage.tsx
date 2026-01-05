import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { CircularLoader } from "@/components/ui/CircularLoader";
import { isProfileComplete } from "@/lib/userProfile";

/**
 * Página de loading que aparece após login (incluindo Google OAuth)
 * Mostra animação de splash e redireciona para o app ou profile-setup
 */
export default function LoadingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Log inicial
  useEffect(() => {
    console.log("📍 [LoadingPage] Componente montado");
    console.log("📍 [LoadingPage] URL atual:", window.location.href);
    console.log("📍 [LoadingPage] User:", user ? "logado" : "não logado");
    console.log("📍 [LoadingPage] Auth loading:", loading);
    
    // Verificar se veio do OAuth (tem hash na URL)
    if (window.location.hash) {
      console.log("📍 [LoadingPage] Hash detectado (provavelmente OAuth)");
    }
  }, [user, loading]);

  useEffect(() => {
    // Safety timeout - nunca ficar nesta página por mais de 5 segundos
    const safetyTimeout = setTimeout(() => {
      console.warn("⚠️ [LoadingPage] Safety timeout - forçando redirecionamento");
      if (!hasRedirected) {
        setHasRedirected(true);
        if (user) {
          console.log("✅ [LoadingPage] Timeout: indo para /app/home");
          navigate("/app/home", { replace: true });
        } else {
          console.log("✅ [LoadingPage] Timeout: indo para /auth/login");
          navigate("/auth/login", { replace: true });
        }
      }
    }, 5000);

    return () => clearTimeout(safetyTimeout);
  }, [user, navigate, hasRedirected]);

  useEffect(() => {
    // Se já redirecionou, não fazer nada
    if (hasRedirected) return;

    // Se ainda está carregando auth, aguardar
    if (loading) {
      console.log("📍 [LoadingPage] Aguardando auth...");
      return;
    }

    const doRedirect = async () => {
      // Pequeno delay para garantir que sessão OAuth foi processada
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (hasRedirected) return;
      setHasRedirected(true);

      // Se não tem usuário, redirecionar para login
      if (!user) {
        console.log("✅ [LoadingPage] Sem usuário, indo para /auth/login");
        navigate("/auth/login", { replace: true });
        return;
      }

      // Usuário autenticado - log de sucesso
      console.log("✅ [GoogleAuth] Sessão criada para:", user.email);
      console.log("📍 [LoadingPage] Provider:", user.app_metadata?.provider || "email");

      // Se tem usuário, verificar perfil e redirecionar
      try {
        console.log("🔍 [LoadingPage] Verificando perfil...");
        const profileComplete = await isProfileComplete();
        console.log("📍 [LoadingPage] Perfil completo:", profileComplete);
        
        if (profileComplete) {
          console.log("✅ [GoogleAuth] Redirecionando usuário para /app/home");
          navigate("/app/home", { replace: true });
        } else {
          console.log("✅ [GoogleAuth] Perfil incompleto, indo para /auth/profile-setup");
          navigate("/auth/profile-setup", { replace: true });
        }
      } catch (error) {
        console.error("❌ [LoadingPage] Erro ao verificar perfil:", error);
        // Em caso de erro, assumir perfil incompleto e ir para setup
        console.log("✅ [LoadingPage] Fallback: indo para /auth/profile-setup");
        navigate("/auth/profile-setup", { replace: true });
      }
    };

    doRedirect();
  }, [user, loading, navigate, hasRedirected]);

  return <CircularLoader />;
}

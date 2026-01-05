import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { isProfileComplete } from "@/lib/userProfile";
import { CircularLoader } from "@/components/ui/CircularLoader";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [profileChecked, setProfileChecked] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [forceRender, setForceRender] = useState(false);

  // Timeout de segurança: força renderização após 4 segundos
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      console.warn("⚠️ [ProtectedRoute] Timeout de segurança atingido, forçando renderização");
      setForceRender(true);
      setProfileChecked(true);
    }, 4000);
    return () => clearTimeout(safetyTimeout);
  }, []);

  // Check profile completion when user is available
  // Re-verifica sempre que o user muda (inclui quando refreshUser é chamado)
  useEffect(() => {
    if (!loading && user) {
      const checkProfile = async () => {
        try {
          console.log("🔍 [ProtectedRoute] Verificando perfil do usuário...");
          
          // Verifica diretamente do user_metadata (mais rápido e atualizado)
          const metadata = user.user_metadata || {};
          const complete = metadata.profile_completed === true;
          
          console.log("🔍 [ProtectedRoute] Perfil completo?", complete, "Path:", location.pathname);
          setProfileComplete(complete);
        } catch (err) {
          console.error("❌ [ProtectedRoute] Erro ao verificar perfil:", err);
          setProfileComplete(true); // Assume completo para evitar loop
        } finally {
          setProfileChecked(true);
        }
      };
      checkProfile();
    } else if (!loading && !user) {
      setProfileChecked(true);
    }
  }, [user, loading, location.pathname]);

  // Show loading while checking auth or profile (mas respeita timeout)
  if ((loading || !profileChecked) && !forceRender) {
    return <CircularLoader />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Se perfil incompleto e tentando acessar /app/*, redirecionar
  if (profileChecked && !profileComplete && location.pathname.startsWith("/app/")) {
    console.log("⚠️ [ProtectedRoute] Perfil incompleto, redirecionando para profile-setup");
    return <Navigate to="/auth/profile-setup" replace />;
  }

  // Se perfil completo e acessando profile-setup, redirecionar para home
  if (profileChecked && profileComplete && location.pathname === "/auth/profile-setup") {
    console.log("✅ [ProtectedRoute] Perfil completo, redirecionando de profile-setup para home");
    return <Navigate to="/app/home" replace />;
  }

  // Render protected content
  return <Outlet />;
}

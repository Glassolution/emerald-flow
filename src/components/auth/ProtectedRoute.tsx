import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { RouteTransitionLoader } from "@/components/ui/RouteTransitionLoader";
import { useEffect, useState } from "react";
import { isProfileComplete } from "@/lib/userProfile";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [profileChecked, setProfileChecked] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);

  // Check profile completion when user is available
  useEffect(() => {
    if (!loading && user && !profileChecked) {
      const checkProfile = async () => {
        console.log("🔍 [ProtectedRoute] Verificando perfil do usuário...");
        const complete = await isProfileComplete();
        console.log("🔍 [ProtectedRoute] Perfil completo?", complete, "Path:", location.pathname);
        setProfileComplete(complete);
        setProfileChecked(true);
      };
      checkProfile();
    } else if (!loading && !user) {
      // If not loading and no user, mark as checked to allow redirect
      setProfileChecked(true);
    }
  }, [user, loading, profileChecked, location.pathname]);

  // Show loading while checking auth or profile
  if (loading || !profileChecked) {
    return <RouteTransitionLoader />;
  }

  // Redirect to login if not authenticated (Welcome só aparece após logout)
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Se estiver acessando rotas /app/* e o perfil não estiver completo, redirecionar para profile-setup
  // Mas permitir acesso a /auth/profile-setup mesmo sem perfil completo
  if (profileChecked && !profileComplete && location.pathname.startsWith("/app/")) {
    console.log("⚠️ [ProtectedRoute] Perfil incompleto, redirecionando para profile-setup");
    return <Navigate to="/auth/profile-setup" replace />;
  }
  
  // Se o perfil estiver completo e estiver tentando acessar profile-setup, redirecionar para home
  if (profileChecked && profileComplete && location.pathname === "/auth/profile-setup") {
    console.log("✅ [ProtectedRoute] Perfil completo, redirecionando de profile-setup para home");
    return <Navigate to="/app/home" replace />;
  }

  // Render protected content
  return <Outlet />;
}


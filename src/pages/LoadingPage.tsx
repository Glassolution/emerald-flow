import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BouncingBallsLoader } from "@/components/ui/BouncingBallsLoader";
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

    // Se não tem usuário, redirecionar para login
    if (!user) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          navigate("/auth/login", { replace: true });
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

  return <BouncingBallsLoader />;
}



import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";

// Intervalo entre cada aparição do popup para usuários gratuitos
const PROMPT_INTERVAL_MS = 60 * 1000; // 60 segundos

export function SubscriptionGuard() {
  const { isTrialExpired, hasPaid, startTrial } = useSubscription();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Ref para acessar o pathname atual dentro do setInterval sem re-criar o timer
  const pathnameRef = useRef(location.pathname);
  useEffect(() => {
    pathnameRef.current = location.pathname;
  });

  useEffect(() => {
    startTrial();
  }, [startTrial]);

  // Exibe a tela de assinatura periodicamente para usuários gratuitos
  useEffect(() => {
    if (hasPaid || isTrialExpired || !user) return;

    const storageKey = `last_sub_prompt_${user.id}`;

    const maybeShow = () => {
      if (pathnameRef.current === "/subscription") return;

      const now = Date.now();
      const last = localStorage.getItem(storageKey);

      if (!last) {
        // Primeira vez: registra o timestamp mas não mostra ainda
        localStorage.setItem(storageKey, String(now));
        return;
      }

      if (now - parseInt(last) >= PROMPT_INTERVAL_MS) {
        localStorage.setItem(storageKey, String(now));
        navigate("/subscription");
      }
    };

    // Verifica ao entrar na app e a cada 30 segundos (captura o momento exato)
    maybeShow();
    const id = setInterval(maybeShow, 10_000);
    return () => clearInterval(id);
  }, [hasPaid, isTrialExpired, user, navigate]);

  // Redireciona permanentemente quando trial expira
  if (isTrialExpired && !hasPaid) {
    if (location.pathname !== "/subscription") {
      return <Navigate to="/subscription" replace />;
    }
  }

  return <Outlet />;
}

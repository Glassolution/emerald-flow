import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";

export function SubscriptionGuard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isTrialActive, isPro } = useSubscription();

  useEffect(() => {
    if (!user) return;

    const meta = user.user_metadata ?? {};
    const status = meta.subscription_status as string | undefined;

    // ─── Abordagem 2: respeitar o dismiss manual do usuário ────────────────
    try {
      const dismissedUntilStr = localStorage.getItem("subscription_dismissed_until");
      if (dismissedUntilStr) {
        const dismissedUntil = new Date(dismissedUntilStr);
        if (!Number.isNaN(dismissedUntil.getTime()) && dismissedUntil > new Date()) {
          // Usuário clicou em fechar recentemente – não reabrir o popup.
          return;
        }
      }
    } catch {
      // Ignore falhas de localStorage (ex.: navegação privada).
    }

    // ─── Abordagem 3: liberar novos usuários nas primeiras 24h ─────────────
    const createdAtStr = user.created_at as string | undefined;
    const now = new Date();
    if (createdAtStr) {
      const createdAt = new Date(createdAtStr);
      if (!Number.isNaN(createdAt.getTime())) {
        const hoursSinceCreated = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        if (hoursSinceCreated < 24) {
          // Usuários muito novos não são bloqueados, mesmo sem assinatura.
          return;
        }
      }
    }

    // Apenas bloqueia quem nunca pagou e trial expirou.
    // Cancelados (isFree + isCancelled) passam livremente como plano Free.
    if (!isPro && !isTrialActive && status !== "cancelled") {
      navigate("/subscription");
    }
  }, [user, isPro, isTrialActive, navigate]);

  return <Outlet />;
}

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface SubscriptionContextType {
  trialStartDate: string | null;
  isTrialExpired: boolean;
  hasPaid: boolean;
  startTrial: () => void;
  checkTrialStatus: () => void;
  refreshSubscription: () => Promise<void>;
  daysRemaining: number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { user, refreshUser } = useAuth();
  const [trialStartDate, setTrialStartDate] = useState<string | null>(null);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(7);

  const TRIAL_DURATION_DAYS = 7;

  useEffect(() => {
    if (user) {
      checkTrialStatus();
    } else {
      setTrialStartDate(null);
      setIsTrialExpired(false);
      setHasPaid(false);
    }
  }, [user]);

  const startTrial = () => {
    if (!user) return;

    const storageKey = `trial_start_${user.id}`;
    const existingStart = localStorage.getItem(storageKey);

    if (!existingStart) {
      const now = new Date().toISOString();
      localStorage.setItem(storageKey, now);
      setTrialStartDate(now);
      checkTrialStatus();
    }
  };

  const checkTrialStatus = () => {
    if (!user) return;

    const storageKey = `trial_start_${user.id}`;
    const storedStart = localStorage.getItem(storageKey);
    const paymentKey = `has_paid_${user.id}`;

    // 1. Subscription cancelada (estorno) — limpa cache local e bloqueia acesso
    const metaStatus = user.user_metadata?.subscription_status as string | undefined;
    if (metaStatus === "cancelled") {
      localStorage.removeItem(paymentKey);
      setHasPaid(false);
      setIsTrialExpired(true);
      return;
    }

    // 2. Assinatura ativa via user_metadata (atualizado pela API/webhook)
    if (metaStatus === "trial_active" || metaStatus === "subscription_active") {
      setHasPaid(true);
      setIsTrialExpired(false);
      localStorage.setItem(paymentKey, "true");
      return;
    }

    // 3. Verifica localStorage (compatibilidade com fluxo anterior)
    const storedPayment = localStorage.getItem(paymentKey);
    if (storedPayment === "true") {
      setHasPaid(true);
      setIsTrialExpired(false);
      return;
    }

    // 4. Verifica trial por tempo
    if (storedStart) {
      setTrialStartDate(storedStart);

      const startDate = new Date(storedStart);
      const now = new Date();
      const diffDays =
        Math.abs(now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

      const remaining = Math.max(0, TRIAL_DURATION_DAYS - diffDays);
      setDaysRemaining(remaining);
      setIsTrialExpired(diffDays >= TRIAL_DURATION_DAYS);
    } else {
      setTrialStartDate(null);
      setIsTrialExpired(false);
      setDaysRemaining(TRIAL_DURATION_DAYS);
    }
  };

  // Força atualização do user_metadata do Supabase e re-checa assinatura.
  // Chamar após um estorno para refletir o cancelamento no frontend sem F5.
  const refreshSubscription = async () => {
    await refreshUser();
    // checkTrialStatus é chamado automaticamente pelo useEffect quando `user` muda.
  };

  return (
    <SubscriptionContext.Provider
      value={{
        trialStartDate,
        isTrialExpired,
        hasPaid,
        startTrial,
        checkTrialStatus,
        refreshSubscription,
        daysRemaining,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface SubscriptionContextType {
  trialStartDate: string | null;
  isTrialExpired: boolean;
  hasPaid: boolean;
  startTrial: () => void;
  checkTrialStatus: () => void;
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
  const { user } = useAuth();
  const [trialStartDate, setTrialStartDate] = useState<string | null>(null);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [hasPaid, setHasPaid] = useState(false); // Futuro: integrar com backend/pagamento real
  const [daysRemaining, setDaysRemaining] = useState(7);

  const TRIAL_DURATION_DAYS = 7;

  useEffect(() => {
    if (user) {
      checkTrialStatus();
    } else {
        // Reset state if no user
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
    
    // Check payment status (simulated for now, could be in localStorage too)
    const paymentKey = `has_paid_${user.id}`;
    const storedPayment = localStorage.getItem(paymentKey);
    if (storedPayment === 'true') {
        setHasPaid(true);
        setIsTrialExpired(false); // Paid users never expire
        return;
    }

    if (storedStart) {
      setTrialStartDate(storedStart);
      
      const startDate = new Date(storedStart);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - startDate.getTime());
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      const remaining = Math.max(0, TRIAL_DURATION_DAYS - diffDays);
      setDaysRemaining(remaining);

      if (diffDays >= TRIAL_DURATION_DAYS) {
        setIsTrialExpired(true);
      } else {
        setIsTrialExpired(false);
      }
    } else {
        // Trial hasn't started yet
        setTrialStartDate(null);
        setIsTrialExpired(false);
        setDaysRemaining(TRIAL_DURATION_DAYS);
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        trialStartDate,
        isTrialExpired,
        hasPaid,
        startTrial,
        checkTrialStatus,
        daysRemaining
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";

export function SubscriptionGuard() {
  const { isTrialExpired, hasPaid, startTrial } = useSubscription();
  const location = useLocation();

  useEffect(() => {
    // Start trial automatically when accessing protected routes
    startTrial();
  }, [startTrial]);

  if (isTrialExpired && !hasPaid) {
    // Prevent infinite redirect if already on subscription page
    if (location.pathname !== "/subscription") {
      return <Navigate to="/subscription" replace />;
    }
  }

  return <Outlet />;
}

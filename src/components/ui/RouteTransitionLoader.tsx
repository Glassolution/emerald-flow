import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { BouncingBallsLoader } from "./BouncingBallsLoader";

/**
 * Mostra um loader curtinho durante transições de rota.
 * Inclui um "hard timeout" para nunca ficar preso em loading em caso de loop de redirect.
 */
export function RouteTransitionLoader() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const initializedRef = useRef(false);
  const prevPathRef = useRef(location.pathname);

  const minTimerRef = useRef<number | null>(null);
  const hardTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Primeira renderização: não mostrar loader
    if (!initializedRef.current) {
      initializedRef.current = true;
      prevPathRef.current = location.pathname;
      return;
    }

    // Se a rota mudou, mostrar loading
    if (location.pathname !== prevPathRef.current) {
      prevPathRef.current = location.pathname;
      setIsLoading(true);

      // Timer normal (curto)
      if (minTimerRef.current) {
        window.clearTimeout(minTimerRef.current);
      }
      minTimerRef.current = window.setTimeout(() => {
        setIsLoading(false);
      }, 300);

      // Hard timeout global: não limpar em mudanças rápidas (evita loader eterno)
      if (hardTimerRef.current == null) {
        hardTimerRef.current = window.setTimeout(() => {
          console.warn("⚠️ [RouteTransitionLoader] Hard timeout - escondendo loader");
          hardTimerRef.current = null;
          setIsLoading(false);
        }, 2000);
      }

      return () => {
        if (minTimerRef.current) {
          window.clearTimeout(minTimerRef.current);
          minTimerRef.current = null;
        }
      };
    }
  }, [location.pathname]);

  // Limpar timers ao desmontar
  useEffect(() => {
    return () => {
      if (minTimerRef.current) window.clearTimeout(minTimerRef.current);
      if (hardTimerRef.current) window.clearTimeout(hardTimerRef.current);
    };
  }, []);

  if (!isLoading) return null;
  return <BouncingBallsLoader />;
}

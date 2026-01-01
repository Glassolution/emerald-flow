import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { BouncingBallsLoader } from "./BouncingBallsLoader";

/**
 * Componente que detecta mudanças de rota e mostra o loading durante as transições
 */
export function RouteTransitionLoader() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [prevPath, setPrevPath] = useState(() => location.pathname);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Na primeira renderização, não mostrar loading
    if (!isInitialized) {
      setIsInitialized(true);
      setPrevPath(location.pathname);
      return;
    }

    // Se a rota mudou, mostrar loading
    if (location.pathname !== prevPath) {
      setIsLoading(true);
      setPrevPath(location.pathname);

      // Esconder loading após um tempo mínimo (para garantir que a nova página carregou)
      // Timeout muito curto para evitar conflito com timeouts das páginas
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300); // 300ms para uma transição muito rápida

      // Timeout de segurança absoluto - nunca ficar em loading por mais de 800ms
      const safetyTimer = setTimeout(() => {
        console.warn("⚠️ [RouteTransitionLoader] Timeout de segurança, escondendo loader");
        setIsLoading(false);
      }, 800);

      return () => {
        clearTimeout(timer);
        clearTimeout(safetyTimer);
      };
    }
  }, [location.pathname, prevPath, isInitialized]);

  if (!isLoading) return null;

  return <BouncingBallsLoader />;
}

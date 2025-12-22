import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";

const FIRST_RUN_KEY = "calc:firstRunDone";

export default function SplashPage() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if it's first run
    const firstRunDone = localStorage.getItem(FIRST_RUN_KEY) === "true";
    
    // Safety timeout - never wait more than 3 seconds
    const safetyTimeout = setTimeout(() => {
      console.warn("⚠️ [SplashPage] Safety timeout reached, forcing navigation");
      setIsVisible(false);
      setTimeout(() => {
        navigate(firstRunDone ? "/welcome" : "/onboarding", { replace: true });
      }, 100);
    }, 3000);
    
    // Show splash for 1.5s
    const timer = setTimeout(() => {
      clearTimeout(safetyTimeout);
      setIsVisible(false);
      
      // After fade out, navigate
      setTimeout(() => {
        if (firstRunDone) {
          // Not first time - go to welcome/login
          navigate("/welcome", { replace: true });
        } else {
          // First time - go to onboarding
          navigate("/onboarding", { replace: true });
        }
      }, 300); // Wait for fade out animation
    }, 1500);

    return () => {
      clearTimeout(timer);
      clearTimeout(safetyTimeout);
    };
  }, [navigate]);

  return (
    <div
      className={`fixed inset-0 bg-[#0a0a0a] flex items-center justify-center z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`flex flex-col items-center transition-all duration-500 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Glow Effect */}
        <div className="absolute w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
        
        {/* Logo with Text */}
        <div className="relative mb-6">
          <Logo size="xl" showText={true} className="animate-pulse" />
        </div>
        
        {/* Subtitle */}
        <p className="text-sm text-gray-400 animate-fade-in-delay">
          Pulverização Agrícola
        </p>
      </div>
    </div>
  );
}

// Export key for resetting
export { FIRST_RUN_KEY };


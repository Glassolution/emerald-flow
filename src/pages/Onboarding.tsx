import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { FIRST_RUN_KEY } from "@/pages/SplashPage";

const ONBOARDING_KEY = "calc_onboarding_completed";

import droneAgricultureImg from "@/assets/drone-agriculture.png";
import droneCaldaImg from "@/assets/drone-calda.png";
import dronePrecisionImg from "@/assets/drone-precision.png";

const slides = [
  {
    id: 1,
    image: droneAgricultureImg,
    title: "Pulverização com Drones",
    subtitle: "O futuro da agricultura de precisão",
    description: "Transforme sua operação agrícola com tecnologia de ponta. Precisão, eficiência e economia em cada voo.",
  },
  {
    id: 2,
    image: droneCaldaImg,
    title: "Calculadora de Calda Inteligente",
    subtitle: "Mistura perfeita, sempre",
    description: "Calcule a quantidade exata de produto para cada tanque. Suporte a múltiplos produtos e modos de dosagem. Economia garantida.",
  },
  {
    id: 3,
    image: dronePrecisionImg,
    title: "Precisão Total",
    subtitle: "Resultados que você pode confiar",
    description: "Controle completo de área, taxa de aplicação e volume. Nunca mais desperdice produto ou tempo. 100% de precisão.",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleComplete = () => {
    // Mark first run as done
    localStorage.setItem(FIRST_RUN_KEY, "true");
    // Marcar onboarding como completo no contexto e localStorage
    completeOnboarding();
    // Redirecionar direto para a página de cadastro
    navigate("/auth/register", { replace: true });
  };

  const handleSkip = () => {
    // Mark first run as done
    localStorage.setItem(FIRST_RUN_KEY, "true");
    // Marcar onboarding como completo
    completeOnboarding();
    // Redirecionar para welcome (pode escolher login ou cadastro)
    navigate("/welcome", { replace: true });
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Skip Button - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={handleSkip}
          className="text-white/70 text-sm font-medium hover:text-white transition-colors px-4 py-2 bg-black/30 rounded-full backdrop-blur-sm"
        >
          Pular
        </button>
      </div>

      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={slide.image}
          alt={slide.title}
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
        {/* Green accent overlay */}
        <div className="absolute inset-0 bg-green-500/5" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Spacer */}
        <div className="flex-1" />

        {/* Text Content - Bottom */}
        <div
          className={`px-6 pb-8 transition-all duration-500 ${
            isAnimating ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"
          }`}
        >
          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p className="text-green-400 text-lg font-medium mb-4">
            {slide.subtitle}
          </p>

          {/* Description */}
          <p className="text-white/80 text-base leading-relaxed mb-8 max-w-md">
            {slide.description}
          </p>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAnimating(true);
                  setTimeout(() => {
                    setCurrentSlide(index);
                    setIsAnimating(false);
                  }, 300);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-8 bg-green-500"
                    : "w-2 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>

          {/* Continue Button - Clean, flat, no shadow */}
          <button
            onClick={isLastSlide ? handleComplete : handleNext}
            className="w-full h-14 bg-[#22c55e] text-white font-semibold rounded-2xl hover:bg-[#16a34a] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isLastSlide ? (
              <>
                Começar agora
                <ChevronRight size={20} />
              </>
            ) : (
              <>
                Continuar
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Export the key for use in other components
export { ONBOARDING_KEY };

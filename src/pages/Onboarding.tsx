import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Chave para marcar que o usuário já viu o onboarding (Welcome)
const HAS_SEEN_ONBOARDING_KEY = "calc_has_seen_onboarding";

import onboarding1Img from "@/assets/onboarding-1.png";
import onboarding2Img from "@/assets/onboarding-2.png";
import onboarding3Img from "@/assets/onboarding-3.png";

const slides = [
  {
    id: 1,
    image: onboarding1Img,
    title: "Pulverização com Drones",
    subtitle: "O futuro da agricultura de precisão",
    description: "Transforme sua operação agrícola com tecnologia de ponta. Precisão, eficiência e economia em cada voo.",
  },
  {
    id: 2,
    image: onboarding2Img,
    title: "Calculadora de Calda Inteligente",
    subtitle: "Mistura perfeita, sempre",
    description: "Calcule a quantidade exata de produto para cada tanque. Suporte a múltiplos produtos e modos de dosagem. Economia garantida.",
  },
  {
    id: 3,
    image: onboarding3Img,
    title: "Precisão Total",
    subtitle: "Resultados que você pode confiar",
    description: "Controle completo de área, taxa de aplicação e volume. Nunca mais desperdice produto ou tempo. 100% de precisão.",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Verificar se já viu o onboarding - se sim, redirecionar
  useEffect(() => {
    if (!loading) {
      const hasSeenOnboarding = localStorage.getItem(HAS_SEEN_ONBOARDING_KEY) === "1";
      
      if (hasSeenOnboarding) {
        // Já viu onboarding, redirecionar baseado no estado de autenticação
        if (user) {
          navigate("/app/home", { replace: true });
        } else {
          navigate("/auth/login", { replace: true });
        }
      }
    }
  }, [loading, user, navigate]);

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
    // Marcar que o usuário já viu o onboarding (Welcome)
    localStorage.setItem(HAS_SEEN_ONBOARDING_KEY, "1");
    
    // Navegar baseado no estado de autenticação
    if (user) {
      // Se já está logado, ir direto para o app
      navigate("/app/home", { replace: true });
    } else {
      // Se não está logado, ir para login
      navigate("/auth/login", { replace: true });
    }
  };

  const handleSkip = () => {
    // Marcar que o usuário já viu o onboarding (Welcome)
    localStorage.setItem(HAS_SEEN_ONBOARDING_KEY, "1");
    
    // Navegar baseado no estado de autenticação
    if (user) {
      // Se já está logado, ir direto para o app
      navigate("/app/home", { replace: true });
    } else {
      // Se não está logado, ir para login
      navigate("/auth/login", { replace: true });
    }
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
      <div className="absolute inset-0 overflow-hidden">
        <div className="relative w-full h-full">
          <img
            key={`onboarding-${currentSlide}`}
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full"
            style={{
              // Ajustes específicos por slide para melhor enquadramento em mobile
              objectFit: 'cover', // Todos os slides com zoom
              objectPosition: currentSlide === 0 
                ? '45% center' // Slide 1: Centralizado para visualizar o drone no centro
                : currentSlide === 1 
                ? 'center center' // Slide 2: Centralizado para mostrar operador e drone
                : '65% center' // Slide 3: Um pouco para a direita (65%) para visualizar o drone com zoom
            }}
            loading="eager"
          />
        </div>
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
export { HAS_SEEN_ONBOARDING_KEY };

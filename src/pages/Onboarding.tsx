import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Chave para marcar que o usuário já viu o onboarding (Welcome)
const HAS_SEEN_ONBOARDING_KEY = "calc_has_seen_onboarding";

// Importar as imagens
import maoImage from "@/assets/mão.png";
import droneImage from "@/assets/drone.png";
import cadeadoImage from "@/assets/cadeado.png";

const slides = [
  {
    id: 1,
    title: "Bem-vindo ao Calc!",
    description: "Estamos felizes que você decidiu usar tecnologia de ponta para sua pulverização agrícola. Drones são o futuro da agricultura de precisão.",
    image: maoImage,
  },
  {
    id: 2,
    title: "Pulverização com Drones",
    description: "Transforme sua operação agrícola com tecnologia de ponta. Precisão, eficiência e economia em cada voo.",
    image: droneImage,
  },
  {
    id: 3,
    title: "Segurança e Confiança",
    description: "Seus dados estão protegidos com criptografia de ponta a ponta. Trabalhe com tranquilidade e confiança.",
    image: cadeadoImage,
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [forceRender, setForceRender] = useState(false);

  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    const timeout = setTimeout(() => {
      setForceRender(true);
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  // Verificar se já viu o onboarding - se sim, redirecionar
  useEffect(() => {
    if (!loading || forceRender) {
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
  }, [loading, user, navigate, forceRender]);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleComplete = () => {
    // Marcar que o usuário já viu o onboarding
    localStorage.setItem(HAS_SEEN_ONBOARDING_KEY, "1");
    
    // Sempre redirecionar para login/register
    navigate("/auth/login", { replace: true });
  };

  const handleSkip = () => {
    // Marcar que o usuário já viu o onboarding
    localStorage.setItem(HAS_SEEN_ONBOARDING_KEY, "1");
    
    // Sempre redirecionar para login/register
    navigate("/auth/login", { replace: true });
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;
  const isFirstSlide = currentSlide === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500 via-green-500 to-green-500 relative overflow-hidden">

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Text Content - Top */}
        <div className="flex-1 flex flex-col justify-start pt-20 px-6">
          <div
            className={`transition-all duration-500 ${
              isAnimating ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"
            }`}
          >
            {/* Title */}
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight text-center">
              {slide.title}
            </h1>

            {/* Description */}
            <p className="text-white text-lg leading-relaxed text-center max-w-md mx-auto">
              {slide.description}
            </p>
          </div>
        </div>

        {/* Image Container - Bottom Center */}
        <div className="flex-1 flex items-center justify-center px-6 pb-32">
          <div
            className={`transition-all duration-500 ${
              isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
          >
            {currentSlide === 0 && (
              <img
                src={maoImage}
                alt="Mão acenando"
                className="w-96 h-96 md:w-[28rem] md:h-[28rem] object-contain"
                style={{
                  filter: "brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(1352%) hue-rotate(87deg) brightness(96%) contrast(88%)",
                }}
              />
            )}
            {currentSlide === 1 && (
              <img
                src={droneImage}
                alt="Drone agrícola"
                className="w-96 h-96 md:w-[28rem] md:h-[28rem] object-contain"
                style={{
                  filter: "brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(1352%) hue-rotate(87deg) brightness(96%) contrast(88%)",
                }}
              />
            )}
            {currentSlide === 2 && (
              <img
                src={cadeadoImage}
                alt="Cadeado de segurança"
                className="w-96 h-96 md:w-[28rem] md:h-[28rem] object-contain"
                style={{
                  filter: "brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(1352%) hue-rotate(87deg) brightness(96%) contrast(88%)",
                }}
              />
            )}
          </div>
        </div>

        {/* Bottom Navigation Bar - White with Notch */}
        <div className="relative bg-white rounded-t-[2.5rem] pt-8 pb-8 px-6">
          {/* Decorative Notch - Small curved indent */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2"
            style={{
              width: '80px',
              height: '18px',
              background: '#22c55e',
              borderRadius: '0 0 40px 40px',
              transform: 'translateX(-50%) translateY(-1px)',
            }}
          />

          {/* Navigation Content */}
          <div className="flex items-center justify-between gap-4">
            {/* Skip/Voltar Button - Left */}
            {isFirstSlide ? (
              <button
                onClick={handleSkip}
                className="flex items-center justify-center gap-2 text-green-600 font-medium border-2 border-green-500 rounded-lg px-6 py-2.5 hover:bg-green-50 transition-colors min-w-[100px]"
              >
                <span>Skip</span>
              </button>
            ) : (
              <button
                onClick={handlePrevious}
                className="flex items-center justify-center gap-2 text-green-600 font-medium border-2 border-green-500 rounded-lg px-6 py-2.5 hover:bg-green-50 transition-colors min-w-[100px]"
              >
                <ChevronLeft size={18} />
                <span>Voltar</span>
              </button>
            )}

            {/* Progress Dots - Center */}
            <div className="flex items-center gap-2 flex-1 justify-center">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "w-6 h-2 bg-green-500"
                      : "w-2 h-2 bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {/* Next/Complete Button - Right */}
            <button
              onClick={isLastSlide ? handleComplete : handleNext}
              className="bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 active:scale-[0.98] transition-all px-6 py-2.5 min-w-[100px] flex items-center justify-center gap-2"
            >
              {isLastSlide ? "Começar" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export the key for use in other components
export { HAS_SEEN_ONBOARDING_KEY };

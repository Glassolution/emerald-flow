import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function QuizCongrats() {
  const navigate = useNavigate();
  const [displayedText, setDisplayedText] = useState("");
  const [mounted, setMounted] = useState(false);
  
  const fullText = "O Calc agora conhece suas necessidades e vai te ajudar a ser mais produtivo, reduzir erros e profissionalizar seu trabalho.";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Efeito de digitação (typewriter)
  useEffect(() => {
    if (!mounted) return;
    
    let currentIndex = 0;
    const typingSpeed = 30; // ms por caractere
    
    const typingInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, [mounted]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleContinue = () => {
    navigate('/onboarding/success');
  };

  // Progresso: 5/6 etapas completas (~83%)
  const progress = 83;

  return (
    <div 
      className="min-h-screen min-h-[100dvh] bg-white flex flex-col"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)"
      }}
    >
      {/* Header */}
      <div className="px-4 pt-2 pb-2 flex items-center justify-between relative shrink-0">
        <button 
          onClick={handleBack}
          className="p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <ChevronLeft size={28} />
        </button>
        <div className="absolute inset-0 flex items-center justify-center pt-2">
          <span className="text-[20px] font-bold text-gray-300 italic flex items-center gap-1">
            Calc
          </span>
        </div>
        <div className="w-10" />
      </div>

      {/* Progress Bar - Estilo FitCal com duas cores */}
      <div className="px-6 mt-2 mb-8 shrink-0">
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden relative">
          {/* Parte preenchida (laranja/verde) */}
          <div 
            className="h-full bg-[#A3FF3F] transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Conteúdo Principal - Centralizado */}
      <div className="flex-1 px-6 w-full overflow-y-auto">
        <div className="min-h-full flex flex-col items-center justify-center text-center pb-6">
          <h1 
            className={`text-[28px] font-black text-[#1a1a1a] mb-4 leading-tight transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ fontWeight: 900 }}
          >
            Ótimo, você já tem uma base!
          </h1>
          
          <p 
            className={`text-gray-500 text-[16px] mb-10 px-2 leading-relaxed transition-all duration-700 delay-200 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Vamos te ajudar a usar esse conhecimento ao seu favor.
          </p>

          {/* Texto com efeito typewriter */}
          <div 
            className={`min-h-[80px] px-4 transition-all duration-700 delay-500 ${
              mounted ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <p className="text-[15px] text-gray-500 leading-relaxed">
              {displayedText}
              <span className="inline-block w-0.5 h-5 bg-[#1a1a1a] ml-1 animate-pulse" />
            </p>
          </div>
        </div>
      </div>

      {/* Botão Continuar */}
      <div className="px-6 pb-6 pt-4 shrink-0">
        <button
          onClick={handleContinue}
          className="w-full py-5 px-8 text-[18px] font-bold rounded-[22px] transition-all duration-300 active:scale-[0.98] shadow-md shadow-[#A3FF3F]/40 bg-[#A3FF3F] hover:bg-[#93F039] text-black"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

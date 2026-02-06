import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Star, Check } from "lucide-react";

// Imagens das pessoas
import pessoa1 from "@/assets/pessoa 1.avif";
import pessoa2 from "@/assets/pessoa 2.avif";
import pessoa3 from "@/assets/pessoa 3.jpg";

export default function QuizSuccess() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleContinue = () => {
    navigate('/onboarding/loading');
  };

  // Progresso completo (100%) - última etapa antes do loading
  const progress = 100;

  // Fotos das pessoas
  const avatars = [
    { image: pessoa1 },
    { image: pessoa2 },
    { image: pessoa3 },
  ];

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

      {/* Progress Bar */}
      <div className="px-6 mt-2 mb-6 shrink-0">
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-[#A3FF3F] transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 px-6 flex flex-col items-center text-center w-full">
        <h1 
          className={`text-[22px] font-black text-[#1a1a1a] mb-4 leading-tight transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ fontWeight: 900 }}
        >
          Histórias de Sucesso
        </h1>

        <div 
          className={`flex gap-1 mb-4 transition-all duration-700 delay-100 ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              size={26} 
              className="text-yellow-400 fill-yellow-400" 
            />
          ))}
        </div>

        <h2 
          className={`text-[20px] font-bold text-[#1a1a1a] mb-4 leading-tight px-4 transition-all duration-700 delay-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Veja o que nossos usuários alcançaram
        </h2>

        <div 
          className={`flex -space-x-3 mb-4 transition-all duration-700 delay-300 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {avatars.map((avatar, index) => (
            <img 
              key={index}
              src={avatar.image}
              alt={`Usuário ${index + 1}`}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
            />
          ))}
        </div>

        <p 
          className={`text-[14px] text-gray-600 font-medium mb-4 transition-all duration-700 delay-400 ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Profissionais que já simplificaram seu trabalho
        </p>

        <div className="w-full flex flex-col">
          <div 
            className={`w-full mt-2 bg-[#1a1a1a] rounded-[24px] p-5 text-center transition-all duration-700 delay-500 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="w-12 h-12 bg-[#A3FF3F] rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={24} className="text-[#1a1a1a]" strokeWidth={3} />
            </div>

            <h3 className="text-[16px] font-bold text-white mb-2">
              Você está no caminho certo!
            </h3>
            
            <p className="text-[13px] text-gray-400 leading-relaxed px-2">
              Junte-se a milhares de usuários satisfeitos e comece sua jornada hoje
            </p>
          </div>

          <div className="h-4" />
        </div>
      </div>

      {/* Botão Continuar */}
      <div className="px-6 pb-4 pt-3 shrink-0">
        <button
          onClick={handleContinue}
          className="w-full py-4 px-8 text-[18px] font-bold rounded-[22px] transition-all duration-300 active:scale-[0.98] shadow-md shadow-[#A3FF3F]/40 bg-[#A3FF3F] hover:bg-[#93F039] text-black"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

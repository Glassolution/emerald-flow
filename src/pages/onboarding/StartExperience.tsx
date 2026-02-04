import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, X, Lock, Bell, Crown, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function StartExperience() {
  const navigate = useNavigate();
  const { completeOnboarding } = useOnboarding();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStart = () => {
    completeOnboarding();
    if (user) {
      navigate('/app/home');
    } else {
      navigate('/auth/register');
    }
  };

  const startDate = format(addDays(new Date(), 7), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div 
      className="h-screen max-h-[100dvh] bg-white flex flex-col px-5 relative overflow-hidden"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)"
      }}
    >
      {/* Header Navigation - Reduced padding */}
      <div className="pt-1 pb-1 flex items-center justify-between shrink-0">
        <button onClick={() => navigate('/landing')} className="p-2 -ml-2 text-gray-400">
          <ChevronLeft size={20} />
        </button>
        
        <span className="text-[16px] font-bold text-gray-300 italic">Calc</span>
        
        <button onClick={() => navigate('/auth/login')} className="p-2 -mr-2 text-gray-300">
          <X size={20} />
        </button>
      </div>

      {/* Main Content - Compact layout */}
      <div className="flex-1 flex flex-col justify-center items-center py-1 w-full overflow-hidden">
        <div className="max-w-xs w-full">
          {/* Title centered with reduced font size */}
          <h1 className="text-[20px] font-[900] text-[#1a1a1a] leading-tight mb-4 text-center px-1">
            Inicie sua experiência <span className="text-[#22c55e]">GRÁTIS</span> de 7 dias. <br />
            <span className="text-[15px] font-bold mt-1 block">Não será cobrado nada agora</span>
          </h1>

          {/* Timeline Flow - Compact */}
          <div className="relative pl-0 w-full max-w-[280px] mx-auto">
            {/* Vertical Line - Centered on icons (w-6 = 24px, center = 12px) */}
            <div className="absolute left-[11px] top-3 bottom-3 w-[2px] bg-green-100 rounded-full" />
            <div className="absolute left-[11px] top-3 h-full w-[2px] bg-[#22c55e] rounded-full" style={{ height: '75%' }} />

            <div className="space-y-5 relative z-10">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-[#22c55e] flex items-center justify-center shrink-0 shadow-sm shadow-green-100 relative z-20">
                  <Lock size={12} className="text-white" />
                </div>
                <div className="pt-0.5">
                  <h4 className="text-[14px] font-bold text-[#1a1a1a] mb-0.5">Hoje</h4>
                  <p className="text-[12px] text-gray-500 leading-snug">
                    Acesso total ao Calc para registrar operações.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-[#22c55e] flex items-center justify-center shrink-0 shadow-sm shadow-green-100 relative z-20">
                  <Bell size={12} className="text-white" />
                </div>
                <div className="pt-0.5">
                  <h4 className="text-[14px] font-bold text-[#1a1a1a] mb-0.5">Em 5 Dias</h4>
                  <p className="text-[12px] text-gray-500 leading-snug">
                    Lembrete de que o teste grátis está acabando.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0 shadow-sm shadow-gray-200 relative z-20">
                  <Crown size={12} className="text-white" />
                </div>
                <div className="pt-0.5">
                  <h4 className="text-[14px] font-bold text-[#1a1a1a] mb-0.5">Em 7 Dias</h4>
                  <p className="text-[12px] text-gray-500 leading-snug">
                    Inscrição começa em {startDate} se não cancelar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Compact */}
      <div className="pb-4 pt-1 bg-white flex flex-col items-center mt-auto shrink-0">
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <ShieldCheck size={14} className="text-[#1a1a1a]" />
          <span className="text-[12px] font-bold text-[#1a1a1a]">Cancele quando quiser!</span>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-3 px-6 text-[15px] font-[900] rounded-[18px] transition-all duration-300 active:scale-[0.98] mb-3 uppercase tracking-wider shadow-md shadow-[#A3FF3F]/40 bg-[#A3FF3F] hover:bg-[#93F039] text-black"
        >
          Começar agora
        </button>

        <div className="flex justify-between w-full px-2 text-[10px] text-gray-400 font-medium">
          <span>Privacidade</span>
          <span>Restaurar</span>
          <span>Termos</span>
        </div>
      </div>
    </div>
  );
}

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
    navigate('/onboarding/payment-selection');
  };

  const startDate = format(addDays(new Date(), 7), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div 
      className="min-h-screen min-h-[100dvh] bg-white flex flex-col px-6 relative"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)"
      }}
    >
      {/* Header Navigation */}
      <div className="pt-2 pb-2 flex items-center justify-between shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400">
          <ChevronLeft size={24} />
        </button>
        
        <span className="text-[18px] font-bold text-gray-300 italic">Calc</span>
        
        <button onClick={handleStart} className="p-2 -mr-2 text-gray-300">
          <X size={24} />
        </button>
      </div>

      {/* Main Content - Centered vertically and horizontally */}
      <div className="flex-1 flex flex-col justify-center items-center py-4 w-full overflow-y-auto">
        <div className="max-w-sm w-full">
          {/* Title centered with reduced font size */}
          <h1 className="text-[26px] font-[900] text-[#1a1a1a] leading-[1.1] mb-10 text-center px-2">
            Inicie sua experiência <span className="text-[#22c55e]">GRÁTIS</span> de 7 dias. <br />
            <span className="text-[20px] font-bold">Não será cobrado nada agora</span>
          </h1>

          {/* Timeline Flow - Centered block with reduced scale */}
          <div className="relative pl-8 pr-2 w-full max-w-[300px] mx-auto">
            {/* Vertical Line (Verde) */}
            <div className="absolute left-[30px] top-4 bottom-4 w-[4px] bg-green-100 rounded-full" />
            <div className="absolute left-[30px] top-4 h-full w-[4px] bg-[#22c55e] rounded-full" style={{ height: '75%' }} />

            <div className="space-y-10 relative z-10">
              {/* Step 1 */}
              <div className="flex items-start gap-5">
                <div className="w-8 h-8 rounded-full bg-[#22c55e] flex items-center justify-center shrink-0 shadow-md shadow-green-100">
                  <Lock size={16} className="text-white" />
                </div>
                <div className="pt-0.5">
                  <h4 className="text-[15px] font-bold text-[#1a1a1a]">Hoje</h4>
                  <p className="text-[13px] text-gray-500 leading-tight">
                    Receba acesso total ao Calc para registrar suas operações com precisão.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-5">
                <div className="w-8 h-8 rounded-full bg-[#22c55e] flex items-center justify-center shrink-0 shadow-md shadow-green-100">
                  <Bell size={16} className="text-white" />
                </div>
                <div className="pt-0.5">
                  <h4 className="text-[15px] font-bold text-[#1a1a1a]">Em 5 Dias — Lembrete</h4>
                  <p className="text-[13px] text-gray-500 leading-tight">
                    Vamos enviar um lembrete de que o seu teste grátis está acabando.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-5">
                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0 shadow-md shadow-gray-200">
                  <Crown size={16} className="text-white" />
                </div>
                <div className="pt-0.5">
                  <h4 className="text-[15px] font-bold text-[#1a1a1a]">Em 7 Dias</h4>
                  <p className="text-[13px] text-gray-500 leading-tight">
                    Sua inscrição vai começar em {startDate} se você não tiver cancelado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Primary Button Area */}
      <div className="pb-6 pt-2 bg-white flex flex-col items-center mt-auto shrink-0">
        {/* Seal directly above button */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <ShieldCheck size={18} className="text-[#1a1a1a]" />
          <span className="text-[14px] font-bold text-[#1a1a1a]">Cancele quando quiser!</span>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-4 px-8 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white text-[18px] font-[900] rounded-[20px] shadow-xl transition-all duration-300 active:scale-[0.98] mb-6 uppercase tracking-wider"
        >
          Começar agora
        </button>

        <div className="flex justify-between w-full px-4 text-[10px] text-gray-400 font-medium">
          <span>Privacidade</span>
          <span>Restaurar Compras</span>
          <span>Termos</span>
        </div>
      </div>
    </div>
  );
}

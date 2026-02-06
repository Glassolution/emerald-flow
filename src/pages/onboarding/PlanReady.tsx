import { useNavigate } from "react-router-dom";
import { Check, User, Clock, Target, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";

export default function PlanReady() {
  const navigate = useNavigate();
  const { answers } = useOnboarding();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mapear respostas para textos legíveis
  const usageLabels: Record<string, string> = {
    individual: "Uso individual",
    equipe: "Pequena equipe",
    crescimento: "Empresa em crescimento",
    estruturada: "Empresa estruturada",
  };

  const frequencyLabels: Record<string, string> = {
    diario: "Todos os dias",
    semanal: "Algumas vezes por semana",
    mensal: "Algumas vezes por mês",
    raramente: "Raramente",
  };

  const problemLabels: Record<string, string> = {
    tempo: "Ganhar tempo nos cálculos",
    erros: "Reduzir erros de dosagem",
    organizacao: "Melhorar organização",
    padronizacao: "Padronizar processos",
  };

  const goalLabels: Record<string, string> = {
    ganhar_tempo: "Ganhar tempo",
    reduzir_erros: "Reduzir erros",
    profissionalizar: "Profissionalizar",
    escalar: "Escalar operações",
  };

  // Dados do perfil baseados nas respostas reais
  const profileData = [
    { 
      icon: User, 
      label: "Perfil", 
      value: usageLabels[answers.usage || ''] || "Individual",
      color: "#1a1a1a"
    },
    { 
      icon: Clock, 
      label: "Frequência", 
      value: frequencyLabels[answers.frequency || ''] || "Regular",
      color: "#22c55e"
    },
    { 
      icon: Zap, 
      label: "Prioridade", 
      value: problemLabels[answers.problem || ''] || "Otimizar",
      color: "#f19066"
    },
    { 
      icon: Target, 
      label: "Objetivo", 
      value: goalLabels[answers.goal || ''] || "Melhorar",
      color: "#546de5"
    },
  ];

  // Recursos do app baseados nas necessidades
  const getFeatures = () => {
    const features = [];
    
    if (answers.problem === 'tempo') {
      features.push("Cálculos automáticos de dosagem em segundos");
    } else if (answers.problem === 'erros') {
      features.push("Validação automática para evitar erros");
    } else if (answers.problem === 'organizacao') {
      features.push("Histórico completo de todas as operações");
    } else if (answers.problem === 'padronizacao') {
      features.push("Templates prontos para padronizar");
    }

    if (answers.goal === 'profissionalizar') {
      features.push("Relatórios em PDF com sua marca");
    } else if (answers.goal === 'escalar') {
      features.push("Compartilhe receitas com sua equipe");
    } else {
      features.push("Acesse de qualquer lugar, online ou offline");
    }

    return features;
  };

  return (
    <div 
      className="min-h-screen min-h-[100dvh] bg-white flex flex-col px-6"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)"
      }}
    >
      <div className="flex-1 flex flex-col items-center pt-8 pb-10 overflow-y-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {/* Ícone de Checkmark Verde */}
        <div className={`mb-6 w-20 h-20 bg-[#A3FF3F] rounded-full flex items-center justify-center transition-all duration-700 scale-in shadow-lg shadow-[#A3FF3F]/40 ${mounted ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
          <Check size={40} className="text-[#1a1a1a]" strokeWidth={3.5} />
        </div>

        <h1 className="text-[32px] font-black text-[#1a1a1a] text-center mb-3 leading-tight tracking-tight" style={{ fontWeight: 900 }}>
          Tudo pronto!
        </h1>
        
        <p className="text-[16px] text-gray-500 text-center mb-10 px-6 leading-relaxed max-w-xs mx-auto">
          Entendemos suas necessidades. <br/>O <span className="font-bold text-[#1a1a1a]">Calc</span> foi personalizado para você.
        </p>

        {/* Card do Resumo do Perfil - Grid Layout */}
        <div className="w-full bg-white rounded-[32px] p-6 mb-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-[20px] font-bold text-[#1a1a1a] leading-none mb-1">
                Seu perfil
              </h3>
              <p className="text-gray-400 text-[13px] font-medium">
                Análise das suas respostas
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
              <User size={20} className="text-gray-900" />
            </div>
          </div>

          {/* Grid do Perfil */}
          <div className="grid grid-cols-2 gap-3">
            {profileData.map((item, i) => (
              <div 
                key={i} 
                className="bg-[#f8f8fb] rounded-[20px] p-4 flex flex-col gap-3 transition-all duration-300 hover:bg-gray-50"
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: item.color }}
                >
                  <item.icon size={20} className="text-white" />
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide block mb-0.5">{item.label}</span>
                  <span className="text-[14px] font-bold text-[#1a1a1a] leading-tight block">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recursos para você */}
        <div className="w-full space-y-5 mb-4">
          <h4 className="text-[18px] font-bold text-[#1a1a1a] px-2 flex items-center gap-2">
            <Zap size={20} className="text-[#A3FF3F] fill-current" />
            Destaques para você
          </h4>
          
          <div className="space-y-3">
            {getFeatures().map((feature, index) => (
              <div key={index} className="p-5 bg-white border border-gray-100 shadow-sm rounded-2xl flex items-start gap-4">
                <div className="w-6 h-6 bg-[#A3FF3F] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check size={14} className="text-[#1a1a1a]" strokeWidth={3} />
                </div>
                <p className="text-[15px] text-gray-700 leading-relaxed font-medium">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botão Fixo Inferior */}
      <div className="pb-6 pt-4 bg-white shrink-0">
        <button
          onClick={() => navigate('/onboarding/start-experience')}
          className="w-full py-5 px-8 text-[18px] font-bold rounded-[20px] transition-all duration-300 active:scale-[0.98] shadow-md shadow-[#A3FF3F]/40 bg-[#A3FF3F] hover:bg-[#93F039] text-black"
        >
          Pegue os seus 7 dias grátis
        </button>
      </div>
    </div>
  );
}

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
      <div className="flex-1 flex flex-col items-center pt-8 pb-10 overflow-y-auto w-full">
        {/* Ícone de Checkmark Verde */}
        <div className={`mb-6 w-16 h-16 bg-[#22c55e] rounded-full flex items-center justify-center transition-all duration-700 scale-in ${mounted ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
          <Check size={32} className="text-white" strokeWidth={3} />
        </div>

        <h1 className="text-[28px] font-black text-[#1a1a1a] text-center mb-2 leading-tight" style={{ fontWeight: 900 }}>
          Tudo pronto!
        </h1>
        
        <p className="text-[16px] text-gray-500 text-center mb-8 px-4">
          Entendemos suas necessidades. O Calc está configurado para você.
        </p>

        {/* Card do Resumo do Perfil */}
        <div className="w-full bg-[#f8f8fb] rounded-[24px] p-6 mb-6">
          <div className="mb-5">
            <h3 className="text-[18px] font-bold text-[#1a1a1a] mb-1">
              Seu perfil
            </h3>
            <p className="text-gray-400 text-[14px]">
              Baseado nas suas respostas
            </p>
          </div>

          {/* Lista do Perfil */}
          <div className="space-y-3">
            {profileData.map((item, i) => (
              <div 
                key={i} 
                className="bg-white rounded-[16px] p-4 flex items-center gap-4"
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <item.icon size={20} style={{ color: item.color }} />
                </div>
                <div className="flex-1">
                  <span className="text-[12px] text-gray-400 block">{item.label}</span>
                  <span className="text-[15px] font-semibold text-[#1a1a1a]">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recursos para você */}
        <div className="w-full space-y-4 mb-6">
          <h4 className="text-[16px] font-bold text-[#1a1a1a] px-2">
            O que o Calc oferece para você
          </h4>
          
          <div className="space-y-3">
            {getFeatures().map((feature, index) => (
              <div key={index} className="p-4 bg-green-50/50 border border-green-100 rounded-2xl flex items-center gap-3">
                <div className="w-6 h-6 bg-[#22c55e] rounded-full flex items-center justify-center flex-shrink-0">
                  <Check size={14} className="text-white" strokeWidth={3} />
                </div>
                <p className="text-[14px] text-gray-700 leading-relaxed">
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
          className="w-full py-5 px-8 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white text-[18px] font-bold rounded-[20px] shadow-xl transition-all duration-300 active:scale-[0.98]"
        >
          Pegue os seus 7 dias grátis
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding, QuizAnswers } from "@/contexts/OnboardingContext";
import { ChevronLeft } from "lucide-react";

interface Step {
  id: keyof QuizAnswers;
  title: string;
  subtitle: string;
  options: { label: string; value: string }[];
}

const steps: Step[] = [
  {
    id: 'usage',
    title: "Como você pretende usar o sistema?",
    subtitle: "Escolha a opção que melhor descreve sua situação atual.",
    options: [
      { label: 'Uso individual', value: 'individual' },
      { label: 'Pequena equipe', value: 'equipe' },
      { label: 'Empresa em crescimento', value: 'crescimento' },
      { label: 'Empresa estruturada', value: 'estruturada' },
    ]
  },
  {
    id: 'frequency',
    title: "Com que frequência você fará esses cálculos?",
    subtitle: "Isso nos ajuda a entender sua demanda operacional.",
    options: [
      { label: 'Todos os dias', value: 'diario' },
      { label: 'Algumas vezes por semana', value: 'semanal' },
      { label: 'Algumas vezes por mês', value: 'mensal' },
      { label: 'Raramente', value: 'raramente' },
    ]
  },
  {
    id: 'problem',
    title: "Qual é o maior problema hoje?",
    subtitle: "Identifique o principal desafio que você enfrenta.",
    options: [
      { label: 'Perco muito tempo com cálculos manuais', value: 'tempo' },
      { label: 'Cometo erros com frequência', value: 'erros' },
      { label: 'Falta organização e histórico', value: 'organizacao' },
      { label: 'Falta padronização', value: 'padronizacao' },
    ]
  },
  {
    id: 'goal',
    title: "Qual seu principal objetivo?",
    subtitle: "O que você espera alcançar com o Calc?",
    options: [
      { label: 'Ganhar tempo', value: 'ganhar_tempo' },
      { label: 'Reduzir erros', value: 'reduzir_erros' },
      { label: 'Profissionalizar o processo', value: 'profissionalizar' },
      { label: 'Escalar o uso no futuro', value: 'escalar' },
    ]
  }
];

export default function QuizStep() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const { setAnswer } = useOnboarding();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, [currentStep]);

  const stepData = steps[currentStep];
  // Total de 6 etapas: 4 perguntas + QuizCongrats + QuizSuccess
  // As 4 perguntas do quiz ocupam os primeiros 4/6 do progresso (~67%)
  const totalSteps = 6;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (selectedOption) {
      setAnswer(stepData.id, selectedOption);
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
        setSelectedOption(null);
      } else {
        navigate('/onboarding/congrats');
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setSelectedOption(null);
    } else {
      navigate(-1);
    }
  };

  return (
    <div
      className="h-[100dvh] bg-white flex flex-col overflow-hidden"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="px-4 pt-10 pb-2 flex items-center justify-between relative">
        <button 
          onClick={handleBack}
          className="p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <ChevronLeft size={28} />
        </button>
        <div className="absolute inset-0 flex items-center justify-center pt-10">
          <span className="text-[20px] font-bold text-gray-300 italic flex items-center gap-1">
            Calc
          </span>
        </div>
        <div className="w-10" />
      </div>

      <div className="px-6 mt-2 mb-6">
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-visible relative">
          <div 
            className="h-full bg-[#A3FF47] transition-all duration-500 ease-out rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#A3FF47] rounded-full shadow-md transform translate-x-1/2 border-2 border-white" />
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 flex flex-col text-center overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center py-4">
          <h2 className="text-xl sm:text-3xl font-extrabold text-[#1a1a1a] mb-2 sm:mb-3 leading-tight transition-all duration-500">
            {stepData.title}
          </h2>
          <p className="text-gray-500 text-sm sm:text-lg mb-6 sm:mb-10 px-2 sm:px-4 leading-relaxed">
            {stepData.subtitle}
          </p>

          <div className="space-y-3 sm:space-y-4">
            {stepData.options.map((option, index) => (
              <button
                key={option.value}
                onClick={() => setSelectedOption(option.value)}
                className={`w-full p-4 sm:p-6 text-center rounded-[20px] transition-all duration-200 ${
                  selectedOption === option.value 
                    ? "bg-[#1a1a1a] text-white shadow-lg" 
                    : "bg-[#f4f4f5] text-[#1a1a1a] hover:bg-gray-200 border-none"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="text-sm sm:text-lg font-bold">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 sm:pb-10 pt-4 sm:pt-6 shrink-0">
        <button
          onClick={handleNext}
          disabled={!selectedOption}
          className={`w-full py-4 sm:py-5 px-8 text-base sm:text-lg font-bold rounded-[22px] transition-all duration-300 ${
            selectedOption 
              ? "bg-[#A3FF47] hover:bg-[#92E63F] text-black active:scale-[0.98] shadow-md shadow-[#A3FF47]/40" 
              : "bg-gray-200 cursor-not-allowed text-gray-400 shadow-none"
          }`}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

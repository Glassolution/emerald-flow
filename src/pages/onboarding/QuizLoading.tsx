import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

export default function QuizLoading() {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const duration = 6500; // 6.5 segundos para criar mais ansiedade
    const intervalTime = 50;
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => navigate('/onboarding/plan-ready'), 800);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [navigate]);

  useEffect(() => {
    if (progress > 25) setStep(1);
    if (progress > 50) setStep(2);
    if (progress > 75) setStep(3);
    if (progress === 100) setStep(4);
  }, [progress]);

  // Cálculo do círculo SVG
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const checklistItems = [
    "Analisando seus dados",
    "Calculando o plano ideal",
    "Otimizando sua produtividade",
    "Revisando tudo"
  ];

  return (
    <div className="min-h-[100svh] bg-white flex flex-col items-center justify-center px-8 text-center">
      {/* Círculo de Progresso */}
      <div className="relative w-44 h-44 mb-12 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          {/* Círculo de fundo (Cinza claro) */}
          <circle
            cx="88"
            cy="88"
            r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="8"
          />
          {/* Círculo de progresso (Preto) */}
          <circle
            cx="88"
            cy="88"
            r={radius}
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-75 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[44px] font-black text-[#1a1a1a] tabular-nums" style={{ fontWeight: 900 }}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      <h2 className="text-[24px] font-black text-[#1a1a1a] mb-12 leading-tight" style={{ fontWeight: 900 }}>
        {progress < 100 ? "Finalizando os preparativos..." : "Tudo pronto!"}
      </h2>

      {/* Checklist */}
      <div className="w-full max-w-xs space-y-5 text-left ml-4">
        {checklistItems.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${step >= index + 1 ? 'bg-[#A3FF3F]' : 'bg-gray-100'}`}>
              <Check size={16} className={`${step >= index + 1 ? 'text-[#1a1a1a]' : 'text-transparent'}`} strokeWidth={3} />
            </div>
            <span className={`text-[16px] font-semibold transition-colors duration-300 ${step >= index + 1 ? 'text-[#1a1a1a]' : 'text-gray-300'}`}>
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

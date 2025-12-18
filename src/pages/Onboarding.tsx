import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Question {
  id: string;
  question: string;
  options: { value: string; label: string; description?: string }[];
  multiple?: boolean;
}

const questions: Question[] = [
  {
    id: "business_type",
    question: "Qual é o tipo do seu negócio?",
    options: [
      { value: "saas", label: "SaaS / Software", description: "Empresa de tecnologia ou software" },
      { value: "ecommerce", label: "E-commerce", description: "Loja online ou marketplace" },
      { value: "services", label: "Serviços", description: "Consultoria, agência ou prestação de serviços" },
      { value: "industry", label: "Indústria", description: "Fabricação ou manufatura" },
      { value: "other", label: "Outro", description: "Outro tipo de negócio" },
    ]
  },
  {
    id: "team_size",
    question: "Quantas pessoas trabalham na sua empresa?",
    options: [
      { value: "1", label: "Só eu" },
      { value: "2-5", label: "2 a 5 pessoas" },
      { value: "6-20", label: "6 a 20 pessoas" },
      { value: "21-50", label: "21 a 50 pessoas" },
      { value: "50+", label: "Mais de 50 pessoas" },
    ]
  },
  {
    id: "goals",
    question: "Quais são seus principais objetivos?",
    multiple: true,
    options: [
      { value: "automation", label: "Automatizar processos" },
      { value: "analytics", label: "Melhorar análise de dados" },
      { value: "team", label: "Organizar a equipe" },
      { value: "customers", label: "Atender melhor os clientes" },
      { value: "growth", label: "Crescer o negócio" },
    ]
  },
  {
    id: "features",
    question: "Quais recursos você mais precisa?",
    multiple: true,
    options: [
      { value: "chat_ai", label: "Chat com IA" },
      { value: "documents", label: "Gestão de documentos" },
      { value: "team_management", label: "Gestão de equipe" },
      { value: "analytics", label: "Métricas e relatórios" },
      { value: "integrations", label: "Integrações" },
    ]
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleSelect = (value: string) => {
    if (currentQuestion.multiple) {
      const currentAnswers = (answers[currentQuestion.id] as string[]) || [];
      const newAnswers = currentAnswers.includes(value)
        ? currentAnswers.filter(v => v !== value)
        : [...currentAnswers, value];
      setAnswers({ ...answers, [currentQuestion.id]: newAnswers });
    } else {
      setAnswers({ ...answers, [currentQuestion.id]: value });
    }
  };

  const isSelected = (value: string) => {
    const answer = answers[currentQuestion.id];
    if (Array.isArray(answer)) {
      return answer.includes(value);
    }
    return answer === value;
  };

  const canContinue = () => {
    const answer = answers[currentQuestion.id];
    if (currentQuestion.multiple) {
      return Array.isArray(answer) && answer.length > 0;
    }
    return !!answer;
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // TODO: Save answers to database
      console.log("Onboarding complete:", answers);
      navigate("/app");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">E</span>
            </div>
            <span className="font-bold text-xl text-foreground">ELO</span>
          </div>
          <span className="text-sm text-muted-foreground">
            Passo {currentStep + 1} de {questions.length}
          </span>
        </div>
      </header>

      {/* Progress */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto animate-fade-in" key={currentStep}>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {currentQuestion.question}
          </h1>
          {currentQuestion.multiple && (
            <p className="text-muted-foreground mb-8">
              Selecione todas as opções que se aplicam
            </p>
          )}

          <div className="grid gap-4 mt-8">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`p-5 rounded-xl border-2 text-left transition-all ${
                  isSelected(option.value)
                    ? "border-primary bg-accent"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{option.label}</p>
                    {option.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    )}
                  </div>
                  {isSelected(option.value) && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check size={14} className="text-primary-foreground" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-2xl mx-auto flex justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ChevronLeft size={18} />
              Voltar
            </Button>
            <Button onClick={handleNext} disabled={!canContinue()}>
              {currentStep === questions.length - 1 ? "Concluir" : "Continuar"}
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

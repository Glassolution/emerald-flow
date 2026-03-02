import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, CreditCard, Shield, Clock, Calendar, Lock, X } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import iphoneImg from "@/assets/iphone.png";
import calcIcon from "@/assets/calc.png";

// Tipos
type Plan = {
  id: "monthly" | "yearly";
  name: string;
  price: number;
  originalPrice: number;
  period: string;
  periodLabel: string;
  saveLabel?: string;
  trialDays: number;
};

const PLANS: Plan[] = [
  {
    id: "monthly",
    name: "Mensal",
    price: 1.0,
    originalPrice: 124.90,
    period: "/mês",
    periodLabel: "mensal",
    trialDays: 7,
  },
  {
    id: "yearly",
    name: "Anual",
    price: 499.90,
    originalPrice: 1249.90,
    period: "/ano",
    periodLabel: "anual",
    saveLabel: "Economize 60%",
    trialDays: 7,
  }
];

export default function Checkout() {
  const navigate = useNavigate();
  const { completeOnboarding } = useOnboarding();
  const { toast } = useToast();
  const { refreshUser, user } = useAuth();

  // Carousel
  const [emblaRef] = useEmblaCarousel({ loop: true });
  const carouselImages = [iphoneImg, iphoneImg, iphoneImg];

  // State for flow control
  const [step, setStep] = useState<"plans" | "payment">("plans");
  const [selectedPlanId, setSelectedPlanId] = useState<"monthly" | "yearly">("yearly");

  // State for payment form
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [saveForFuture, setSaveForFuture] = useState(true);

  // Countdown timer logic
  const [timeLeft, setTimeLeft] = useState("23:59:59.00");

  useEffect(() => {
    const STORAGE_KEY = "calc_checkout_deadline";
    let deadline = localStorage.getItem(STORAGE_KEY);

    if (!deadline) {
      const targetDate = new Date().getTime() + 24 * 60 * 60 * 1000;
      deadline = targetDate.toString();
      localStorage.setItem(STORAGE_KEY, deadline);
    }

    const targetTime = parseInt(deadline, 10);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00.00");
        return;
      }

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      const milliseconds = Math.floor((diff % 1000) / 10);

      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const selectedPlan = PLANS.find(p => p.id === selectedPlanId) || PLANS[1];
  const trialEndDate = format(addDays(new Date(), selectedPlan.trialDays), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  const handleBackClick = () => {
    if (step === "payment") {
      setStep("plans");
    } else {
      const fallback = '/onboarding/start-experience';
      const hasHistory = typeof window !== 'undefined' && window.history.length > 1;
      if (hasHistory) {
        navigate(-1);
      } else {
        navigate(fallback, { replace: true });
      }
    }
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(" ").substring(0, 19) : "";
  };

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length >= 2) {
      return numbers.substring(0, 2) + "/" + numbers.substring(2, 4);
    }
    return numbers;
  };

  const handleContinueToPayment = async () => {
    if (isSubmitting) return;

    const digits = cardNumber.replace(/\s/g, "");
    const numOk = digits.length >= 13;
    const expOk = cardExpiry.length === 5;
    const nameOk = cardName.trim().length > 2;
    const cvvOk = cardCvv.length === 3;

    if (!numOk || !expOk || !nameOk || !cvvOk) {
      toast({
        title: "Dados do cartão inválidos",
        description: "Preencha número, validade, nome e CVV para continuar.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.email) {
      toast({
        title: "Sessão expirada",
        description: "Faça login novamente para iniciar seu teste.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          planId: selectedPlanId,
          paymentMethod: "card",
          cardNumber: cardNumber.replace(/\s/g, ""),
          cardExpiry,
          cardCvv,
          cardHolderName: cardName,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        const msg =
          data.detail ??
          (data.error === "invalid_card"
            ? "Cartão recusado. Verifique os dados ou use outro cartão."
            : data.error === "payment_failed"
            ? "Pagamento recusado pelo banco. Tente outro cartão."
            : "Erro ao processar pagamento. Tente novamente.");
        toast({ title: "Pagamento não aprovado", description: msg, variant: "destructive" });
        return;
      }

      toast({
        title: "Assinatura ativada!",
        description: `Você tem ${selectedPlan.trialDays} dias grátis. Bem-vindo ao CALC Pro!`,
      });
      await refreshUser();
      completeOnboarding();
      navigate('/app/home', { replace: true });
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      toast({
        title: "Erro de conexão",
        description: "Verifique sua internet e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "plans") {
    return (
      <div className="h-[100svh] bg-[#f3f4f6] flex flex-col overflow-hidden relative">
        <div className="absolute top-6 right-6 z-50">
          <button onClick={() => navigate("/auth/login")} className="p-2 text-gray-500 bg-white/50 backdrop-blur-sm rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Carousel Section */}
        <div className="h-[55%] w-full relative" ref={emblaRef}>
          <div className="flex h-full">
            {carouselImages.map((img, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 relative h-full flex items-center justify-center bg-gradient-to-b from-[#f5f5f5] to-white">
                <img
                  src={img}
                  alt={`Slide ${index + 1}`}
                  className="h-[90%] w-auto object-contain z-10"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none z-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 w-full bg-white rounded-t-[32px] shadow-[0_-8px_24px_rgba(0,0,0,0.08)] -mt-8 relative z-30 px-6 pt-6 pb-6 flex flex-col justify-between">
          <div className="text-center mb-4">
            <h1 className="text-[18px] font-bold text-[#1a1a1a] mb-2">Acesso ilimitado</h1>
            <div className="relative inline-block">
              <img
                src={calcIcon}
                alt="Calc"
                className="absolute right-[calc(100%+6px)] top-1/2 -translate-y-1/2 w-8 h-8 object-contain"
              />
              <span className="text-[28px] font-[900] text-[#1a1a1a] uppercase tracking-tighter leading-none">
                CALC
              </span>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-3 mb-4">
            {PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-300 ${
                  selectedPlanId === plan.id
                    ? "border-[#1a1a1a] bg-white shadow-md scale-[1.02]"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                {plan.saveLabel && (
                  <div className="absolute -top-2.5 right-2 bg-black text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    {plan.saveLabel}
                  </div>
                )}
                <span className="text-[13px] font-bold text-[#1a1a1a] mb-0.5">{plan.name}</span>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-gray-400 line-through leading-tight">
                    R$ {plan.originalPrice.toFixed(2).replace(".", ",")}{plan.period}
                  </span>
                  <span className="text-[13px] font-bold text-[#1a1a1a] leading-tight">
                    R$ {plan.price.toFixed(2).replace(".", ",")}{plan.period}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center">
            <p className="text-[12px] font-medium text-gray-900 tabular-nums tracking-wide">
              {timeLeft} restante
            </p>
          </div>

          <button
            onClick={() => setStep("payment")}
            className="w-full py-3.5 px-6 text-[15px] font-bold rounded-[24px] transition-all duration-300 active:scale-[0.98] bg-[#A3FF3F] text-black hover:bg-[#93F039] shadow-lg shadow-[#A3FF3F]/40"
          >
            Obter plano {selectedPlan.name} com 60% de desconto
          </button>

          <div className="flex flex-col items-center gap-1.5 text-[10px] text-gray-400 font-medium">
            <button className="hover:text-gray-600">Restaurar compras</button>
            <div className="flex gap-4">
              <button className="hover:text-gray-600">Termos de serviço</button>
              <button className="hover:text-gray-600">Política de privacidade</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Payment Form Step
  return (
    <div className="min-h-[100svh] bg-[#f9f9f9] flex flex-col">
      {/* Header */}
      <div className="bg-white px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={handleBackClick} className="p-2 -ml-2 text-gray-900">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-[18px] font-bold text-gray-900">
          Plano {selectedPlan.name} — R$ {selectedPlan.price.toFixed(2).replace(".", ",")}{selectedPlan.period}
        </h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold text-gray-900">Dados do cartão</h2>
            <div className="flex items-center gap-2 text-[12px] text-gray-500">
              <CreditCard size={16} className="text-gray-700" />
              <span>Cartão de crédito</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[13px] font-semibold text-gray-500 mb-2 block">Número do cartão</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                inputMode="numeric"
                className="w-full p-4 bg-gray-50 rounded-xl text-[16px] border-2 border-transparent focus:border-black focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[13px] font-semibold text-gray-500 mb-2 block">Nome do titular</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                placeholder="NOME COMO NO CARTÃO"
                className="w-full p-4 bg-gray-50 rounded-xl text-[16px] border-2 border-transparent focus:border-black focus:outline-none transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[13px] font-semibold text-gray-500 mb-2 block">Validade</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/AA"
                    maxLength={5}
                    inputMode="numeric"
                    className="w-full p-4 bg-gray-50 rounded-xl text-[16px] border-2 border-transparent focus:border-black focus:outline-none transition-colors pr-12"
                  />
                  <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="text-[13px] font-semibold text-gray-500 mb-2 block">CVV</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    placeholder="000"
                    maxLength={3}
                    inputMode="numeric"
                    className="w-full p-4 bg-gray-50 rounded-xl text-[16px] border-2 border-transparent focus:border-black focus:outline-none transition-colors pr-12"
                  />
                  <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={saveForFuture}
                onChange={(e) => setSaveForFuture(e.target.checked)}
                className="w-4 h-4 text-black border-gray-300 rounded"
              />
              <span className="text-[13px] font-semibold text-gray-600">Salvar cartão para o futuro</span>
            </div>
          </div>
        </section>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
            <Clock size={20} className="text-[#22c55e] flex-shrink-0" />
            <p className="text-[13px] text-gray-700">
              Você selecionou o plano <strong>{selectedPlan.name}</strong> com {selectedPlan.trialDays} dias grátis.
              Após o trial, será cobrado R$ {selectedPlan.price.toFixed(2).replace(".", ",")}{selectedPlan.period}.
            </p>
          </div>
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
            <Shield size={20} className="text-blue-500 flex-shrink-0" />
            <p className="text-[13px] text-gray-700">
              Você não será cobrado agora e pode cancelar antes de {trialEndDate}.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 text-center mb-2">
          🔒 Pagamento processado com segurança pelo Mercado Pago
        </p>
      </div>

      {/* Botão Continuar */}
      <div className="px-6 pb-10 pt-4 bg-white border-t border-gray-100">
        <button
          onClick={handleContinueToPayment}
          disabled={!cardNumber || !cardExpiry || !cardName || cardCvv.length < 3 || isSubmitting}
          className={`w-full py-4 text-[16px] font-bold rounded-[24px] transition-all duration-300 active:scale-[0.98] ${
            cardNumber && cardExpiry && cardName && cardCvv.length === 3 && !isSubmitting
              ? "bg-[#A3FF3F] text-black hover:bg-[#93F039] shadow-lg shadow-[#A3FF3F]/40"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? "Processando..." : `Assinar plano ${selectedPlan.name} · 7 dias grátis`}
        </button>
      </div>
    </div>
  );
}

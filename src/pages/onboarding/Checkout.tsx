import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, CreditCard, Shield, Clock, Calendar, Lock, X, Copy, Check } from "lucide-react";
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

type PaymentMethod = "card" | "pix";
type Step = "plans" | "payment" | "pix_qr";

interface PixData {
  paymentId: string;
  qrCode: string;
  qrCodeBase64: string | null;
  ticketUrl: string | null;
  expiresAt: string;
}

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

  // Flow control
  const [step, setStep] = useState<Step>("plans");
  const [selectedPlanId, setSelectedPlanId] = useState<"monthly" | "yearly">("yearly");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  // Payment form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [saveForFuture, setSaveForFuture] = useState(true);

  // PIX state
  const [pixData, setPixData] = useState<PixData | null>(() => {
    try {
      const stored = localStorage.getItem("calc_onboarding_pix");
      if (stored) {
        const parsed: PixData = JSON.parse(stored);
        if (new Date(parsed.expiresAt).getTime() > Date.now()) return parsed;
        localStorage.removeItem("calc_onboarding_pix");
      }
    } catch { /* ignore */ }
    return null;
  });
  const [pixExpired, setPixExpired] = useState(false);
  const [pixCountdown, setPixCountdown] = useState("30:00");
  const [copied, setCopied] = useState(false);
  const pixEmailRef = useRef<string>("");
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState("23:59:59.00");

  useEffect(() => {
    const STORAGE_KEY = "calc_checkout_deadline";
    let deadline = localStorage.getItem(STORAGE_KEY);
    if (!deadline) {
      deadline = (new Date().getTime() + 24 * 60 * 60 * 1000).toString();
      localStorage.setItem(STORAGE_KEY, deadline);
    }
    const targetTime = parseInt(deadline, 10);
    const interval = setInterval(() => {
      const diff = targetTime - new Date().getTime();
      if (diff <= 0) { setTimeLeft("00:00:00.00"); return; }
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      const ms = Math.floor((diff % 1000) / 10);
      setTimeLeft(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(2,'0')}`);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Persiste pixData no localStorage
  useEffect(() => {
    if (pixData) localStorage.setItem("calc_onboarding_pix", JSON.stringify(pixData));
    else localStorage.removeItem("calc_onboarding_pix");
  }, [pixData]);

  // Restaura step pix_qr se havia PIX pendente
  useEffect(() => {
    if (pixData && step === "plans") setStep("pix_qr");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // PIX 30-min countdown
  useEffect(() => {
    if (step !== "pix_qr" || !pixData) return;
    const expiresAt = new Date(pixData.expiresAt).getTime();
    const interval = setInterval(() => {
      const diff = expiresAt - Date.now();
      if (diff <= 0) {
        setPixCountdown("00:00");
        setPixExpired(true);
        clearInterval(interval);
        return;
      }
      const min = Math.floor(diff / 60000);
      const sec = Math.floor((diff % 60000) / 1000);
      setPixCountdown(`${String(min).padStart(2,"0")}:${String(sec).padStart(2,"0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [step, pixData]);

  // PIX polling
  useEffect(() => {
    if (step !== "pix_qr" || !pixData || pixExpired) return;

    const checkPayment = async () => {
      try {
        const res = await fetch(
          `/api/check-payment?paymentId=${pixData.paymentId}&email=${encodeURIComponent(pixEmailRef.current)}`
        );
        const data = await res.json();
        if (data.paid) {
          clearInterval(pollIntervalRef.current!);
          localStorage.removeItem("calc_onboarding_pix");
          if (user) {
            localStorage.setItem(`has_paid_${user.id}`, "true");
            await refreshUser();
            completeOnboarding();
            toast({ title: "PIX confirmado!", description: "Bem-vindo ao CALC Pro." });
            navigate("/app/home", { replace: true });
          }
        }
      } catch { /* silently ignore */ }
    };

    pollIntervalRef.current = setInterval(checkPayment, 10000);
    return () => clearInterval(pollIntervalRef.current!);
  }, [step, pixData, pixExpired]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedPlan = PLANS.find(p => p.id === selectedPlanId) || PLANS[1];
  const trialEndDate = format(addDays(new Date(), selectedPlan.trialDays), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  const handleBackClick = () => {
    if (step === "pix_qr") { setStep("payment"); return; }
    if (step === "payment") { setStep("plans"); return; }
    const hasHistory = typeof window !== "undefined" && window.history.length > 1;
    if (hasHistory) navigate(-1);
    else navigate("/onboarding/start-experience", { replace: true });
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(" ").substring(0, 19) : "";
  };

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length >= 2) return numbers.substring(0, 2) + "/" + numbers.substring(2, 4);
    return numbers;
  };

  const handleCopyPix = async () => {
    if (!pixData?.qrCode) return;
    await navigator.clipboard.writeText(pixData.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!user?.email) {
      toast({ title: "Sessão expirada", description: "Faça login novamente.", variant: "destructive" });
      return;
    }

    if (paymentMethod === "card") {
      const digits = cardNumber.replace(/\s/g, "");
      if (digits.length < 13) {
        toast({ title: "Cartão inválido", description: "Verifique o número do cartão.", variant: "destructive" });
        return;
      }
      if (cardExpiry.length !== 5) {
        toast({ title: "Validade inválida", description: "Use o formato MM/AA.", variant: "destructive" });
        return;
      }
      if (cardName.trim().length <= 2) {
        toast({ title: "Nome inválido", description: "Informe o nome do titular.", variant: "destructive" });
        return;
      }
      if (cardCvv.length < 3) {
        toast({ title: "CVV inválido", description: "Informe o CVV do cartão.", variant: "destructive" });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const body: Record<string, string> = {
        email: user.email,
        planId: selectedPlanId,
        paymentMethod,
      };
      if (paymentMethod === "card") {
        body.cardNumber = cardNumber.replace(/\s/g, "");
        body.cardExpiry = cardExpiry;
        body.cardCvv = cardCvv;
        body.cardHolderName = cardName;
      }

      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        const msg =
          data.detail ??
          (data.error === "invalid_card"
            ? "Cartão recusado. Verifique os dados ou use outro cartão."
            : data.error === "payment_failed"
            ? "Pagamento recusado pelo banco. Tente outro cartão."
            : data.error === "pix_failed"
            ? "Não foi possível gerar o PIX. Tente novamente."
            : "Erro ao processar pagamento. Tente novamente.");
        toast({ title: "Pagamento não aprovado", description: msg, variant: "destructive" });
        return;
      }

      if (paymentMethod === "pix") {
        pixEmailRef.current = user.email;
        setPixExpired(false);
        setPixData({
          paymentId: String(data.paymentId),
          qrCode: data.qrCode ?? "",
          qrCodeBase64: data.qrCodeBase64 ?? null,
          ticketUrl: data.ticketUrl ?? null,
          expiresAt: data.expiresAt,
        });
        setStep("pix_qr");
      } else {
        localStorage.setItem(`has_paid_${user.id}`, "true");
        await refreshUser();
        completeOnboarding();
        toast({ title: "Assinatura ativada!", description: `Você tem ${selectedPlan.trialDays} dias grátis. Bem-vindo ao CALC Pro!` });
        navigate("/app/home", { replace: true });
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      toast({ title: "Erro de conexão", description: "Verifique sua internet e tente novamente.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Step: Tela QR Code PIX ───────────────────────────────────────────────
  if (step === "pix_qr" && pixData) {
    return (
      <div className="h-[100svh] bg-[#f9f9f9] flex flex-col overflow-hidden">
        <div className="bg-white px-6 pt-6 pb-4 flex items-center gap-3 border-b border-gray-100">
          <button onClick={handleBackClick} className="p-2 -ml-2 text-gray-900">
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-[17px] font-bold text-[#1a1a1a]">Pague com PIX</h1>
            <p className="text-[12px] text-gray-400">
              Expira em <span className="font-semibold text-red-500">{pixCountdown}</span>
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center gap-6">
          {/* QR Code */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            {pixData.qrCodeBase64 ? (
              <img
                src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                alt="QR Code PIX"
                className="w-52 h-52 object-contain"
              />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-gray-400 text-[13px] text-center">
                QR code não disponível.<br />Use o código abaixo.
              </div>
            )}
          </div>

          <div className="text-center space-y-1">
            <p className="text-[14px] font-semibold text-[#1a1a1a]">Escaneie o QR code com o app do seu banco</p>
            <p className="text-[12px] text-gray-500">ou copie o código PIX abaixo</p>
          </div>

          {/* Código PIX copiável */}
          {pixData.qrCode && (
            <div className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
              <p className="flex-1 text-[11px] text-gray-500 break-all font-mono leading-relaxed line-clamp-3">
                {pixData.qrCode}
              </p>
              <button onClick={handleCopyPix} className="flex-shrink-0 flex flex-col items-center gap-1">
                {copied
                  ? <Check size={20} className="text-green-500" />
                  : <Copy size={20} className="text-gray-400" />}
                <span className="text-[10px] text-gray-400">{copied ? "Copiado!" : "Copiar"}</span>
              </button>
            </div>
          )}

          {pixExpired ? (
            <div className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-4 flex flex-col items-center gap-3">
              <p className="text-[13px] text-red-700 font-semibold text-center">⚠️ PIX expirado</p>
              <p className="text-[12px] text-red-600 text-center leading-relaxed">
                O tempo para pagar se encerrou. Gere um novo QR code para continuar.
              </p>
              <button
                onClick={() => { setPixData(null); setPixExpired(false); setStep("payment"); }}
                className="px-6 py-2.5 bg-black text-white text-[13px] font-bold rounded-full"
              >
                Gerar novo QR Code
              </button>
            </div>
          ) : (
            <div className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-[12px] text-amber-700 text-center leading-relaxed">
                ⏳ Aguardando confirmação do PIX...
                <br />
                <span className="text-[11px] text-amber-600">Esta página atualiza automaticamente.</span>
              </p>
            </div>
          )}

          {pixData.ticketUrl && (
            <a href={pixData.ticketUrl} target="_blank" rel="noopener noreferrer" className="text-[13px] text-blue-500 underline">
              Abrir página de pagamento
            </a>
          )}

          <p className="text-[11px] text-gray-400 text-center">
            🔒 Pagamento processado com segurança pelo Mercado Pago
          </p>
        </div>
      </div>
    );
  }

  // ─── Step: Formulário de pagamento ───────────────────────────────────────
  if (step === "payment") {
    return (
      <div className="h-[100svh] bg-[#f9f9f9] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white px-6 pt-6 pb-4 flex items-center gap-3 border-b border-gray-100">
          <button onClick={handleBackClick} className="p-2 -ml-2 text-gray-900">
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-[17px] font-bold text-[#1a1a1a]">
              Plano {selectedPlan.name} — R$ {selectedPlan.price.toFixed(2).replace(".", ",")}{selectedPlan.period}
            </h1>
            <p className="text-[12px] text-gray-400">
              {paymentMethod === "card" ? "7 dias grátis · cancele quando quiser" : "Pagamento único via PIX"}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {/* Toggle Cartão / PIX */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setPaymentMethod("card")}
              className={`flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-all duration-200 ${
                paymentMethod === "card" ? "bg-white text-black shadow-sm" : "text-gray-500"
              }`}
            >
              💳 Cartão
            </button>
            <button
              onClick={() => setPaymentMethod("pix")}
              className={`flex-1 py-2.5 text-[13px] font-semibold rounded-lg transition-all duration-200 ${
                paymentMethod === "pix" ? "bg-white text-black shadow-sm" : "text-gray-500"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#32BCAD" d="M313.9 190.4l-59.5-59.5c-7.8-7.8-20.5-7.8-28.3 0l-59.5 59.5c-7.3 7.3-17.1 11.3-27.4 11.3H96.7l97.4-97.4c16.7-16.7 39-26 62.4-26 23.4 0 45.7 9.2 62.4 26l97.4 97.4h-42.6c-10.3 0-20.2-4.1-27.4-11.3z"/>
                  <path fill="#32BCAD" d="M198.1 321.6l59.5 59.5c7.8 7.8 20.5 7.8 28.3 0l59.5-59.5c7.3-7.3 17.1-11.3 27.4-11.3h42.6l-97.4 97.4c-16.7 16.7-39 26-62.4 26-23.4 0-45.7-9.2-62.4-26l-97.4-97.4h42.6c10.3 0 20.1 4.1 27.4 11.3z"/>
                  <path fill="#32BCAD" d="M430.5 204.2l-19.3 19.3c-14.7 14.7-14.7 38.5 0 53.2l19.3 19.3-19.3 19.3c-14.7 14.7-38.5 14.7-53.2 0l-19.3-19.3 19.3-19.3c14.7-14.7 14.7-38.5 0-53.2l-19.3-19.3 19.3-19.3c14.7-14.7 38.5-14.7 53.2 0z"/>
                  <path fill="#32BCAD" d="M81.5 307.8l19.3-19.3c14.7-14.7 14.7-38.5 0-53.2L81.5 216l19.3-19.3c14.7-14.7 38.5-14.7 53.2 0l19.3 19.3-19.3 19.3c-14.7 14.7-14.7 38.5 0 53.2l19.3 19.3-19.3 19.3c-14.7 14.7-38.5 14.7-53.2 0z"/>
                </svg>
                PIX
              </span>
            </button>
          </div>

          {/* Campos do cartão */}
          {paymentMethod === "card" && (
            <>
              <div>
                <label className="text-[13px] font-semibold text-gray-500 mb-1.5 block">Número do cartão</label>
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
                <label className="text-[13px] font-semibold text-gray-500 mb-1.5 block">Nome do titular</label>
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
                  <label className="text-[13px] font-semibold text-gray-500 mb-1.5 block">Validade</label>
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
                  <label className="text-[13px] font-semibold text-gray-500 mb-1.5 block">CVV</label>
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
            </>
          )}

          {/* Info PIX */}
          {paymentMethod === "pix" && (
            <div className="bg-[#32BCAD]/10 border border-[#32BCAD]/30 rounded-xl p-4 text-center space-y-1">
              <p className="text-[13px] font-semibold text-[#1a8c80]">Como funciona o PIX</p>
              <p className="text-[12px] text-gray-600 leading-relaxed">
                Após clicar em Gerar QR Code, você receberá um código para pagar pelo app do seu banco. A confirmação é instantânea.
              </p>
            </div>
          )}

          {/* Info do plano */}
          <div className="space-y-3">
            {paymentMethod === "card" && (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                <Clock size={20} className="text-[#22c55e] flex-shrink-0" />
                <p className="text-[13px] text-gray-700">
                  Você selecionou o plano <strong>{selectedPlan.name}</strong> com {selectedPlan.trialDays} dias grátis.
                  Após o trial, será cobrado R$ {selectedPlan.price.toFixed(2).replace(".", ",")}{selectedPlan.period}.
                </p>
              </div>
            )}
            {paymentMethod === "card" && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <Shield size={20} className="text-blue-500 flex-shrink-0" />
                <p className="text-[13px] text-gray-700">
                  Você não será cobrado agora e pode cancelar antes de {trialEndDate}.
                </p>
              </div>
            )}
          </div>

          <p className="text-[11px] text-gray-400 text-center">
            🔒 Pagamento processado com segurança pelo Mercado Pago
          </p>
        </div>

        {/* Botão */}
        <div className="px-6 pb-10 pt-4 bg-white border-t border-gray-100">
          <button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              (paymentMethod === "card" && (!cardNumber || !cardExpiry || !cardName || cardCvv.length < 3))
            }
            className={`w-full py-4 text-[16px] font-bold rounded-[24px] transition-all duration-300 active:scale-[0.98] ${
              !isSubmitting && (paymentMethod === "pix" || (cardNumber && cardExpiry && cardName && cardCvv.length === 3))
                ? "bg-[#A3FF3F] text-black hover:bg-[#93F039] shadow-lg shadow-[#A3FF3F]/40"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isSubmitting
              ? "Processando..."
              : paymentMethod === "pix"
              ? "Gerar QR Code PIX"
              : `Assinar plano ${selectedPlan.name} · 7 dias grátis`}
          </button>
        </div>
      </div>
    );
  }

  // ─── Step: Seleção de plano ───────────────────────────────────────────────
  return (
    <div className="h-[100svh] bg-[#f3f4f6] flex flex-col overflow-hidden relative">
      <div className="absolute top-6 right-6 z-50">
        <button onClick={() => navigate("/auth/login")} className="p-2 text-gray-500 bg-white/50 backdrop-blur-sm rounded-full">
          <X size={20} />
        </button>
      </div>

      {/* Carousel */}
      <div className="h-[55%] w-full relative" ref={emblaRef}>
        <div className="flex h-full">
          {carouselImages.map((img, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 relative h-full flex items-center justify-center bg-gradient-to-b from-[#f5f5f5] to-white">
              <img src={img} alt={`Slide ${index + 1}`} className="h-[90%] w-auto object-contain z-10" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none z-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Sheet inferior */}
      <div className="flex-1 w-full bg-white rounded-t-[32px] shadow-[0_-8px_24px_rgba(0,0,0,0.08)] -mt-8 relative z-30 px-6 pt-6 pb-6 flex flex-col justify-between">
        <div className="text-center mb-4">
          <h1 className="text-[18px] font-bold text-[#1a1a1a] mb-2">Acesso ilimitado</h1>
          <div className="relative inline-block">
            <img src={calcIcon} alt="Calc" className="absolute right-[calc(100%+6px)] top-1/2 -translate-y-1/2 w-8 h-8 object-contain" />
            <span className="text-[28px] font-[900] text-[#1a1a1a] uppercase tracking-tighter leading-none">CALC</span>
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
          <p className="text-[12px] font-medium text-gray-900 tabular-nums tracking-wide">{timeLeft} restante</p>
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

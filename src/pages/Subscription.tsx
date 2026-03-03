import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, Calendar, Lock, Copy, Check, AlertTriangle } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@supabase/supabase-js";
import useEmblaCarousel from "embla-carousel-react";
import iphoneImg from "@/assets/iphone.png";
import calcIcon from "@/assets/calc.png";

const supabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

type PlanId = "monthly" | "yearly";
type PaymentMethod = "card" | "pix";
type Step = "plans" | "checkout" | "pix_qr" | "success";

const PLANS = [
  {
    id: "monthly" as PlanId,
    name: "Mensal",
    price: 1.0,
    originalPrice: 124.9,
    period: "/mês",
  },
  {
    id: "yearly" as PlanId,
    name: "Anual",
    price: 499.9,
    originalPrice: 1249.9,
    period: "/ano",
    saveLabel: "Economize 60%",
  },
];

interface PixData {
  paymentId: string;
  qrCode: string;
  qrCodeBase64: string | null;
  ticketUrl: string | null;
  expiresAt: string;
}

// ─── Componente de gerenciamento de assinatura ───────────────────────────────

function ManageSubscription({ onReactivate }: { onReactivate: () => void }) {
  const { user, refreshUser } = useAuth();
  const { isCancelled: subIsCancelled, plan: subPlan, refreshSubscription } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isRefunding, setIsRefunding] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"refund" | "cancel" | null>(null);

  const meta = user?.user_metadata ?? {};
  const plan = meta.subscription_plan as string | undefined;
  const planAmount = meta.subscription_plan_amount as number | undefined;
  const updatedAt = meta.subscription_updated_at as string | undefined;
  const status = meta.subscription_status as string | undefined;

  const purchaseDate = updatedAt ? new Date(updatedAt) : null;
  const daysSincePurchase = purchaseDate
    ? (Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)
    : 99;
  const daysLeftForRefund = Math.max(0, 7 - Math.floor(daysSincePurchase));
  const canRefund = daysLeftForRefund > 0 && status !== "cancelled";
  const isCancelled = status === "cancelled";

  const planLabel = plan === "yearly" ? "Anual" : "Mensal";

  const getAuthToken = async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session?.access_token ?? null;
  };

  const handleRefund = async () => {
    setIsRefunding(true);
    setConfirmAction(null);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Sessão expirada. Faça login novamente.");

      const res = await fetch("/api/request-refund", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast({
          title: "Erro no estorno",
          description: data.message ?? data.error ?? "Não foi possível processar o estorno.",
          variant: "destructive",
        });
        return;
      }

      await refreshSubscription();
      toast({ title: "Estorno solicitado", description: data.message });
      navigate("/app/home", { replace: true });
    } catch (err: unknown) {
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsRefunding(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    setConfirmAction(null);
    try {
      const token = await getAuthToken();
      if (!token) throw new Error("Sessão expirada. Faça login novamente.");

      const res = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast({
          title: "Erro ao cancelar",
          description: data.message ?? data.error ?? "Não foi possível cancelar.",
          variant: "destructive",
        });
        return;
      }

      await refreshSubscription();
      toast({ title: "Plano cancelado", description: data.message });
    } catch (err: unknown) {
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="h-[100svh] bg-[#f3f4f6] flex flex-col px-6 py-8 overflow-y-auto">
      <h1 className="text-[22px] font-black text-[#1a1a1a] mb-1">Minha Assinatura</h1>
      <p className="text-[13px] text-gray-400 mb-6">Gerencie seu plano CALC Pro</p>

      {/* Card do plano */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-semibold text-gray-500">Plano atual</span>
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
              subPlan === 'pro'
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {subPlan === 'pro' ? "Ativo" : "Free"}
          </span>
        </div>
        <p className="text-[20px] font-black text-[#1a1a1a]">
          {subIsCancelled ? "CALC Free" : `CALC Pro — ${planLabel}`}
        </p>
        {planAmount && (
          <p className="text-[14px] text-gray-500 mt-0.5">
            R$ {Number(planAmount).toFixed(2).replace(".", ",")}
            {plan === "yearly" ? "/ano" : "/mês"}
          </p>
        )}
        {purchaseDate && (
          <p className="text-[12px] text-gray-400 mt-2">
            Ativado em {purchaseDate.toLocaleDateString("pt-BR")}
          </p>
        )}
      </div>

      {/* Card Free — visível quando assinatura foi cancelada */}
      {subIsCancelled && (
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4 space-y-3">
          <p className="text-[14px] text-gray-600 leading-relaxed">
            Sua assinatura foi cancelada. Você continua com acesso ao plano{" "}
            <span className="font-semibold text-gray-800">Free</span> com{" "}
            <span className="font-semibold">1 cálculo por dia</span>.
          </p>
          <button
            onClick={onReactivate}
            className="w-full py-3 text-[14px] font-bold rounded-xl bg-[#1a1a1a] text-white active:scale-95 transition-all"
          >
            Reativar plano Pro →
          </button>
          <button
            onClick={() => navigate('/app/home')}
            className="w-full py-2.5 text-[14px] font-semibold rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Continuar no Free
          </button>
        </div>
      )}

      {/* Estorno — visível dentro dos 7 dias */}
      {canRefund && (
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <span className="text-[13px] font-semibold text-[#1a1a1a]">Direito de Arrependimento</span>
          </div>
          <p className="text-[12px] text-gray-500 mb-4 leading-relaxed">
            Você tem <strong>{daysLeftForRefund} dia{daysLeftForRefund !== 1 ? "s" : ""}</strong> para
            solicitar estorno gratuito (CDC Art. 49). Após esse prazo, o estorno não será possível.
          </p>

          {confirmAction === "refund" ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
              <p className="text-[13px] text-red-700 font-semibold text-center">
                Confirmar estorno de R$ {Number(planAmount ?? 0).toFixed(2).replace(".", ",")}?
              </p>
              <p className="text-[11px] text-red-600 text-center">
                Você perderá o acesso premium imediatamente.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 py-2.5 text-[13px] font-semibold rounded-xl border border-gray-200 bg-white text-gray-600"
                >
                  Não, voltar
                </button>
                <button
                  onClick={handleRefund}
                  disabled={isRefunding}
                  className="flex-1 py-2.5 text-[13px] font-bold rounded-xl bg-red-600 text-white disabled:opacity-50"
                >
                  {isRefunding ? "Processando..." : "Sim, estornar"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmAction("refund")}
              className="w-full py-3 text-[14px] font-bold rounded-xl border-2 border-red-500 text-red-500 hover:bg-red-50 transition-colors"
            >
              Solicitar Estorno — R$ {Number(planAmount ?? 0).toFixed(2).replace(".", ",")}
            </button>
          )}
        </div>
      )}

      {/* Cancelar plano */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <p className="text-[13px] font-semibold text-[#1a1a1a] mb-1">Cancelar plano</p>
          <p className="text-[12px] text-gray-500 mb-4 leading-relaxed">
            Ao cancelar, seu acesso premium continua até o fim do período já pago.
          </p>

          {confirmAction === "cancel" ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-[13px] text-gray-700 font-semibold text-center">
                Confirmar cancelamento?
              </p>
              <p className="text-[11px] text-gray-500 text-center">
                Seu acesso continuará até o fim do período pago.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 py-2.5 text-[13px] font-semibold rounded-xl border border-gray-200 bg-white text-gray-600"
                >
                  Não, voltar
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="flex-1 py-2.5 text-[13px] font-bold rounded-xl bg-gray-900 text-white disabled:opacity-50"
                >
                  {isCancelling ? "Cancelando..." : "Sim, cancelar"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmAction("cancel")}
              className="w-full py-3 text-[14px] font-semibold rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar plano
            </button>
          )}
        </div>
      )}

      <p className="text-[11px] text-gray-400 text-center mt-2">
        Dúvidas? Entre em contato com o suporte.
      </p>
    </div>
  );
}

// ─── Subscription principal ───────────────────────────────────────────────────

export default function Subscription() {
  const { isFree, refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const [emblaRef] = useEmblaCarousel({ loop: true });
  const carouselImages = [iphoneImg, iphoneImg, iphoneImg];

  const [step, setStep] = useState<Step>("plans");
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>("yearly");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [timeLeft, setTimeLeft] = useState("23:59:59.00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(() => {
    try {
      const stored = localStorage.getItem("calc_pending_pix");
      if (stored) {
        const parsed: PixData = JSON.parse(stored);
        if (new Date(parsed.expiresAt).getTime() > Date.now()) return parsed;
        localStorage.removeItem("calc_pending_pix");
      }
    } catch { /* ignore */ }
    return null;
  });
  const [pixExpired, setPixExpired] = useState(false);
  const [pixCountdown, setPixCountdown] = useState("30:00");
  const [copied, setCopied] = useState(false);
  const pixEmailRef = useRef<string>("");

  const [email, setEmail] = useState(user?.email ?? "");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown de 24h persistido no localStorage
  useEffect(() => {
    const STORAGE_KEY = "calc_sub_deadline";
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
      const ms = Math.floor((diff % 1000) / 10);

      setTimeLeft(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(ms).padStart(2, "0")}`
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pixData) {
      localStorage.setItem("calc_pending_pix", JSON.stringify(pixData));
    } else {
      localStorage.removeItem("calc_pending_pix");
    }
  }, [pixData]);

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
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setPixCountdown(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
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
          localStorage.removeItem("calc_pending_pix");
          if (user) {
            localStorage.setItem(`has_paid_${user.id}`, "true");
            await refreshSubscription();
            toast({ title: "PIX confirmado!", description: "Bem-vindo ao CALC Pro." });
            navigate("/app/home", { replace: true });
          } else {
            setStep("success");
          }
        }
      } catch {
        // silently ignore polling errors
      }
    };

    pollIntervalRef.current = setInterval(checkPayment, 10000);
    return () => clearInterval(pollIntervalRef.current!);
  }, [step, pixData, pixExpired]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId) ?? PLANS[1];

  const handleClose = () => {
    navigate(-1);
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(" ").slice(0, 19) : "";
  };

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length >= 2) return numbers.slice(0, 2) + "/" + numbers.slice(2, 4);
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

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Email inválido", description: "Informe um email válido.", variant: "destructive" });
      return;
    }

    if (paymentMethod === "card") {
      if (cardNumber.replace(/\s/g, "").length < 13) {
        toast({ title: "Cartão inválido", description: "Verifique o número do cartão.", variant: "destructive" });
        return;
      }
      if (cardExpiry.length !== 5) {
        toast({ title: "Validade inválida", description: "Use o formato MM/AA.", variant: "destructive" });
        return;
      }
      if (cardHolderName.trim().length < 3) {
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
        email: email.toLowerCase().trim(),
        planId: selectedPlanId,
        paymentMethod,
      };

      if (paymentMethod === "card") {
        body.cardNumber = cardNumber;
        body.cardExpiry = cardExpiry;
        body.cardCvv = cardCvv;
        body.cardHolderName = cardHolderName;
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
        pixEmailRef.current = email.toLowerCase().trim();
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
        if (user) {
          localStorage.setItem(`has_paid_${user.id}`, "true");
          await refreshSubscription();
          toast({ title: "Assinatura ativa!", description: "Bem-vindo ao CALC Pro." });
          navigate("/app/home", { replace: true });
        } else {
          setStep("success");
        }
      }
    } catch (err) {
      console.error("[Subscription] Payment error:", err);
      toast({
        title: "Erro de conexão",
        description: "Verifique sua internet e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Gerenciamento de assinatura (usuário já assinou) ────────────────────
  const subStatus = user?.user_metadata?.subscription_status as string | undefined;
  if (
    !showCheckout &&
    (subStatus === "trial_active" ||
      subStatus === "subscription_active" ||
      subStatus === "cancelled")
  ) {
    return <ManageSubscription onReactivate={() => setShowCheckout(true)} />;
  }

  // ─── Tela de sucesso ──────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="h-[100svh] bg-[#f3f4f6] flex flex-col items-center justify-center px-8 text-center">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-[24px] font-black text-[#1a1a1a] mb-3">
          {paymentMethod === "pix" ? "PIX confirmado!" : "Assinatura confirmada!"}
        </h1>
        <p className="text-[15px] text-gray-500 mb-6 leading-relaxed">
          Enviamos um link para <strong>{email}</strong> para você configurar
          sua senha e acessar o CALC.
        </p>
        <p className="text-[12px] text-gray-400">
          Não recebeu? Verifique a pasta de spam.
        </p>
      </div>
    );
  }

  // ─── Tela do QR code PIX ─────────────────────────────────────────────────
  if (step === "pix_qr" && pixData) {
    return (
      <div className="h-[100svh] bg-[#f9f9f9] flex flex-col overflow-hidden">
        <div className="bg-white px-6 pt-6 pb-4 flex items-center gap-3 border-b border-gray-100">
          <button onClick={() => setStep("checkout")} className="p-2 -ml-2 text-gray-900">
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-[17px] font-bold text-[#1a1a1a]">Pague com PIX</h1>
            <p className="text-[12px] text-gray-400">
              Expira em{" "}
              <span className="font-semibold text-red-500">{pixCountdown}</span>
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center gap-6">
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
            <p className="text-[14px] font-semibold text-[#1a1a1a]">
              Escaneie o QR code com o app do seu banco
            </p>
            <p className="text-[12px] text-gray-500">ou copie o código PIX abaixo</p>
          </div>

          {pixData.qrCode && (
            <div className="w-full">
              <div className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                <p className="flex-1 text-[11px] text-gray-500 break-all font-mono leading-relaxed line-clamp-3">
                  {pixData.qrCode}
                </p>
                <button onClick={handleCopyPix} className="flex-shrink-0 flex flex-col items-center gap-1">
                  {copied ? (
                    <Check size={20} className="text-green-500" />
                  ) : (
                    <Copy size={20} className="text-gray-400" />
                  )}
                  <span className="text-[10px] text-gray-400">{copied ? "Copiado!" : "Copiar"}</span>
                </button>
              </div>
            </div>
          )}

          {pixExpired ? (
            <div className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-4 flex flex-col items-center gap-3">
              <p className="text-[13px] text-red-700 font-semibold text-center">⚠️ PIX expirado</p>
              <p className="text-[12px] text-red-600 text-center leading-relaxed">
                O tempo para pagar se encerrou. Gere um novo QR code para continuar.
              </p>
              <button
                onClick={() => { setPixData(null); setPixExpired(false); setStep("checkout"); }}
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

  // ─── Step 2: Formulário de pagamento ─────────────────────────────────────
  if (step === "checkout") {
    return (
      <div className="h-[100svh] bg-[#f9f9f9] flex flex-col overflow-hidden">
        <div className="bg-white px-6 pt-6 pb-4 flex items-center gap-3 border-b border-gray-100">
          <button onClick={() => setStep("plans")} className="p-2 -ml-2 text-gray-900">
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-[17px] font-bold text-[#1a1a1a]">
              Plano {selectedPlan.name} — R${" "}
              {selectedPlan.price.toFixed(2).replace(".", ",")}
              {selectedPlan.period}
            </h1>
            <p className="text-[12px] text-gray-400">
              {paymentMethod === "card" ? "7 dias grátis · cancele quando quiser" : "Pagamento único via PIX"}
            </p>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-400">
            <X size={20} />
          </button>
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

          {/* Email */}
          <div>
            <label className="text-[13px] font-semibold text-gray-500 mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              readOnly={!!user?.email}
              className={`w-full p-4 rounded-xl text-[16px] border-2 border-transparent focus:border-black focus:outline-none transition-colors ${
                user?.email ? "bg-gray-100 text-gray-500" : "bg-gray-50"
              }`}
            />
            {!user && (
              <p className="text-[11px] text-gray-400 mt-1 ml-1">
                Sua conta será criada com este email após o pagamento.
              </p>
            )}
          </div>

          {/* Card fields */}
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
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value.toUpperCase())}
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
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="000"
                      maxLength={4}
                      inputMode="numeric"
                      className="w-full p-4 bg-gray-50 rounded-xl text-[16px] border-2 border-transparent focus:border-black focus:outline-none transition-colors pr-12"
                    />
                    <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* PIX info */}
          {paymentMethod === "pix" && (
            <div className="bg-[#32BCAD]/10 border border-[#32BCAD]/30 rounded-xl p-4 text-center space-y-1">
              <p className="text-[13px] font-semibold text-[#1a8c80]">Como funciona o PIX</p>
              <p className="text-[12px] text-gray-600 leading-relaxed">
                Após clicar em Gerar QR Code, você receberá um código para pagar pelo app do seu banco. A confirmação é instantânea.
              </p>
            </div>
          )}

          <p className="text-[11px] text-gray-400 text-center">
            🔒 Pagamento processado com segurança pelo Mercado Pago
          </p>
        </div>

        <div className="px-6 pb-10 pt-4 bg-white border-t border-gray-100">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-4 text-[16px] font-bold rounded-[24px] transition-all duration-300 active:scale-[0.98] ${
              isSubmitting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#A3FF3F] text-black hover:bg-[#93F039] shadow-lg shadow-[#A3FF3F]/40"
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

  // ─── Step 1: Seleção de plano ─────────────────────────────────────────────
  return (
    <div className="h-[100svh] bg-[#f3f4f6] flex flex-col overflow-hidden relative">
      <div className="absolute top-6 right-6 z-50">
        <button onClick={handleClose} className="p-2 text-gray-500 bg-white/50 backdrop-blur-sm rounded-full">
          <X size={20} />
        </button>
      </div>

      <div className="h-[55%] w-full relative" ref={emblaRef}>
        <div className="flex h-full">
          {carouselImages.map((img, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 relative h-full flex items-center justify-center bg-gradient-to-b from-[#f5f5f5] to-white"
            >
              <img src={img} alt={`Slide ${index + 1}`} className="h-[90%] w-auto object-contain z-10" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none z-20" />
            </div>
          ))}
        </div>
      </div>

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
          onClick={() => setStep("checkout")}
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

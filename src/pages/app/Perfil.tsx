import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, HelpCircle, ChevronRight, LogOut, Check, X, ShieldCheck, Star, History, Crown, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/contexts/I18nContext";
import { getUserProfile, saveUserProfile, UserProfile } from "@/lib/userProfile";
import { getUserStats, UserStats } from "@/lib/userStats";
import { getAvatarUrl } from "@/lib/avatarService";
import { AvatarPicker } from "@/components/profile/AvatarPicker";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";

// ─── Types ────────────────────────────────────────────────────────────────────

type SubscriptionInfo = {
  status: string;
  plan: string;
  expiresAt: string | null;
  activatedAt: string | null;
  paymentMethod: string | null;
  daysSincePurchase: number | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatExpiryShort(isoDate: string | null): string {
  if (!isoDate) return "—";
  const d = new Date(isoDate);
  const now = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "Expirado";
  if (diff === 1) return "Vence amanhã";
  if (diff <= 30) return `Vence em ${diff} dias`;
  return `Vence ${d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}`;
}

function formatExpiryFull(isoDate: string | null): string {
  if (!isoDate) return "—";
  return new Date(isoDate).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Perfil() {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Subscription state
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [showManageSheet, setShowManageSheet] = useState(false);
  const [cancelStep, setCancelStep] = useState<"idle" | "confirm" | "loading" | "done">("idle");

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        if (!user) {
          setIsLoading(false);
          return;
        }

        // Carregar perfil
        try {
          const profileResult = await getUserProfile();
          if (isMounted && profileResult?.profile) {
            setUserProfile(profileResult.profile);
            setEditedName(profileResult.profile.fullName || "");
          }
        } catch (profileError) {
          console.error("Erro ao carregar perfil:", profileError);
        }

        // Carregar estatísticas
        try {
          const statsResult = await getUserStats();
          if (isMounted && statsResult?.stats) {
            setUserStats(statsResult.stats);
          }
        } catch (statsError) {
          console.error("Erro ao carregar estatísticas:", statsError);
        }

        // Carregar avatar
        try {
          const avatar = await getAvatarUrl();
          if (isMounted) {
            setAvatarUrl(avatar);
          }
        } catch (avatarError) {
          console.error("Erro ao carregar avatar:", avatarError);
        }

        // Carregar informações de assinatura
        try {
          const meta = user?.user_metadata ?? {};
          const subStatus = meta.subscription_status as string | undefined;

          if (subStatus === "trial_active" || subStatus === "subscription_active") {
            const { data: latestPayment } = await supabase
              .from("payments")
              .select("expires_at, created_at, payment_id, plan, method")
              .eq("user_id", user.id)
              .eq("status", "approved")
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            const expiresAt =
              latestPayment?.expires_at ??
              (subStatus === "trial_active"
                ? (meta.subscription_trial_ends_at as string | undefined) ?? null
                : null);

            const daysSincePurchase = latestPayment?.created_at
              ? Math.floor(
                  (Date.now() - new Date(latestPayment.created_at).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : null;

            if (isMounted) {
              setSubscriptionInfo({
                status: subStatus,
                plan: (meta.subscription_plan as string) || latestPayment?.plan || "monthly",
                expiresAt,
                activatedAt: latestPayment?.created_at ?? null,
                paymentMethod: latestPayment?.method ?? null,
                daysSincePurchase,
              });
            }
          }
        } catch (subError) {
          console.error("Erro ao carregar assinatura:", subError);
        }
      } catch (error) {
        console.error("Erro geral ao carregar dados do perfil:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const firstName = userProfile?.fullName
    ? userProfile.fullName.trim().split(/\s+/)[0] || t("profile.defaultUser")
    : t("profile.defaultUser");

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
    navigate("/auth/login", { replace: true });
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      toast({
        title: t("common.error"),
        description: t("profile.nameEmptyError"),
        variant: "destructive",
      });
      return;
    }

    setIsSavingName(true);
    const { error } = await saveUserProfile({
      fullName: editedName.trim(),
      companyName: userProfile?.companyName || "",
    });
    setIsSavingName(false);

    if (error) {
      toast({
        title: t("common.error"),
        description: t("profile.nameUpdateError"),
        variant: "destructive",
      });
    } else {
      setUserProfile((prev) => (prev ? { ...prev, fullName: editedName.trim() } : null));
      setIsEditingName(false);
      toast({
        title: t("common.success"),
        description: t("profile.nameUpdateSuccess"),
      });
    }
  };

  const handleCancelEdit = () => {
    setEditedName(userProfile?.fullName || "");
    setIsEditingName(false);
  };

  const handleAvatarChange = (newUrl: string | null) => {
    try {
      if (newUrl) {
        const cleanUrl = newUrl.split("?")[0].split("&")[0];
        const separator = cleanUrl.includes("?") ? "&" : "?";
        const urlWithTimestamp = `${cleanUrl}${separator}t=${Date.now()}`;
        setAvatarUrl(urlWithTimestamp);
      } else {
        setAvatarUrl(null);
      }
    } catch (error) {
      console.error("Erro ao atualizar avatar:", error);
    }
  };

  const handleViewCalculations = () => navigate("/app/calculos");
  const handleViewSaved = () => navigate("/app/favoritos");
  const handleViewHelp = () => navigate("/app/ajuda");

  // Computed subscription values (must be defined before handlers that use them)
  const isProActive =
    subscriptionInfo?.status === "trial_active" ||
    subscriptionInfo?.status === "subscription_active";
  const isTrial = subscriptionInfo?.status === "trial_active";
  const planLabel = subscriptionInfo?.plan === "yearly" ? "Anual" : "Mensal";
  const canRefund =
    (subscriptionInfo?.daysSincePurchase ?? 999) <= 7 &&
    subscriptionInfo?.paymentMethod !== null;

  const handleCancelSubscription = async () => {
    setCancelStep("loading");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      // Dentro de 7 dias → reembolso automático + acesso encerrado imediatamente
      // Após 7 dias → apenas cancela renovação, acesso mantido até vencimento
      const endpoint = canRefund ? "/api/request-refund" : "/api/cancel-subscription";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao processar");
      setCancelStep("done");
      toast({
        title: canRefund ? "Reembolso solicitado" : "Assinatura cancelada",
        description:
          data.message ??
          (canRefund
            ? "Seu acesso foi encerrado e o estorno será processado em breve."
            : "Você mantém o acesso até o fim do período pago."),
      });
      setSubscriptionInfo((prev) => (prev ? { ...prev, status: "cancelled" } : null));
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
      setCancelStep("idle");
    }
  };

  const closeSheet = () => {
    setShowManageSheet(false);
    setCancelStep("idle");
  };

  return (
    <div
      className="pb-6 space-y-8 bg-white min-h-screen min-h-[100dvh]"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 1rem)" }}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-2">
        <h1 className="text-[24px] font-black tracking-tight text-[#1a1a1a]">Calc</h1>
        <button
          onClick={() => navigate("/app/configuracoes")}
          className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center active:scale-90 transition-all"
        >
          <Settings size={22} className="text-[#1a1a1a]" />
        </button>
      </div>

      {/* Profile Header Section */}
      <div className="flex flex-col items-center">
        {/* Avatar with Circular Border */}
        <div className="relative mb-6">
          <div
            className="absolute inset-0 -m-2 border-2 border-emerald-500 rounded-full"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 60%, 0 60%)" }}
          />
          {isLoading ? (
            <div className="w-40 h-40 rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500" />
            </div>
          ) : (
            <div key={avatarUrl || "no-avatar"}>
              <AvatarPicker
                avatarUrl={avatarUrl || null}
                onAvatarChange={handleAvatarChange}
                size="xl"
                showControls={false}
              />
            </div>
          )}
        </div>

        {/* Name and Info */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="h-10 text-center font-bold text-[24px] w-48 border-none bg-transparent focus-visible:ring-0"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  disabled={isSavingName}
                  className="text-emerald-500"
                >
                  <Check size={20} />
                </button>
                <button onClick={handleCancelEdit} className="text-red-500">
                  <X size={20} />
                </button>
              </div>
            ) : (
              <>
                <h2
                  className="text-[28px] font-bold text-[#1a1a1a] tracking-tight cursor-pointer"
                  onClick={() => setIsEditingName(true)}
                >
                  {firstName}
                </h2>
                <ShieldCheck size={22} className="text-blue-500 fill-blue-500/20" />
              </>
            )}
          </div>
          <p className="text-[#8a8a8a] font-medium text-[15px]">
            {userProfile?.companyName || t("profile.defaultRole")}
          </p>
        </div>
      </div>

      {/* Pro Card or Premium Upgrade Card */}
      <div className="px-2">
        {isProActive ? (
          /* ── Calc Pro active card ── */
          <div
            onClick={() => setShowManageSheet(true)}
            className="bg-white rounded-[24px] p-5 shadow-sm border border-emerald-100 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <Crown size={22} className="text-emerald-500" strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-bold text-[#1a1a1a]">
                    Calc Pro · {planLabel}
                  </p>
                  <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {isTrial ? "Trial" : "Ativo"}
                  </span>
                </div>
                <p className="text-[12px] text-[#8a8a8a] font-medium mt-0.5">
                  {formatExpiryShort(subscriptionInfo?.expiresAt ?? null)}
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </div>
        ) : (
          /* ── Premium upgrade card ── */
          <div
            onClick={() => navigate("/onboarding/checkout")}
            className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-[24px] p-5 shadow-lg border border-gray-800 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden"
          >
            <div className="flex items-center gap-4 z-10">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Crown size={28} className="text-[#1a1a1a] fill-[#1a1a1a]/20" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[16px] font-black text-white">{t("profile.goPremium")}</p>
                <p className="text-[13px] text-gray-400 font-medium">{t("profile.goPremiumDesc")}</p>
              </div>
            </div>
            <div className="z-10">
              <span className="bg-[#A3FF47] text-[#1a1a1a] text-[12px] font-black px-4 py-2 rounded-full shadow-lg shadow-[#A3FF47]/20">
                {t("profile.upgrade").toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Completion Status Card */}
      <div className="px-2">
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full border-4 border-emerald-500/20 flex items-center justify-center relative">
              <span className="text-[14px] font-bold text-emerald-600">60%</span>
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-emerald-500"
                  strokeDasharray="150.79"
                  strokeDashoffset="60.3"
                />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#1a1a1a]">{t("profile.completeProfile")}</p>
              <p className="text-[13px] text-[#8a8a8a]">{t("profile.completeProfileDesc")}</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditingName(true)}
            className="px-5 py-2.5 rounded-full border border-[#1a1a1a] text-[14px] font-bold text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all"
          >
            {t("profile.editProfile")}
          </button>
        </div>
      </div>

      {/* Stats and Items List */}
      <div className="px-2 space-y-1">
        <div
          className="p-4 flex items-center justify-between group active:bg-gray-50 rounded-2xl transition-all cursor-pointer"
          onClick={handleViewCalculations}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
              <Star size={24} className="text-amber-500 fill-amber-500/20" />
            </div>
            <div>
              <p className="text-[16px] font-bold text-[#1a1a1a]">
                {userStats?.totalCalculations || 0} {t("profile.calculations")}
              </p>
              <p className="text-[13px] text-[#8a8a8a] font-medium">{t("profile.calculationsDesc")}</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
        </div>

        <div className="w-full h-px bg-gray-100 mx-4" />

        <div
          className="p-4 flex items-center justify-between group active:bg-gray-50 rounded-2xl transition-all cursor-pointer"
          onClick={handleViewSaved}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <History size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[16px] font-bold text-[#1a1a1a]">
                {userStats?.savedCalculations || 0} {t("profile.saved")}
              </p>
              <p className="text-[13px] text-[#8a8a8a] font-medium">{t("profile.savedDesc")}</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
        </div>

        <div className="w-full h-px bg-gray-100 mx-4" />

        <div
          className="p-4 flex items-center justify-between group active:bg-gray-50 rounded-2xl transition-all cursor-pointer"
          onClick={handleViewHelp}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <HelpCircle size={24} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-[16px] font-bold text-[#1a1a1a]">{t("profile.help")}</p>
              <p className="text-[13px] text-[#8a8a8a] font-medium">{t("profile.helpDesc")}</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
        </div>
      </div>

      {/* Logout */}
      <div className="px-6 pt-4">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 text-[15px] font-bold text-red-500 bg-red-50 py-4 rounded-2xl active:scale-95 transition-all"
        >
          <LogOut size={18} />
          {isLoggingOut ? t("profile.loggingOut") : t("profile.logout")}
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────
          Manage Subscription Bottom Sheet
      ───────────────────────────────────────────────────────────────────── */}
      {showManageSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={closeSheet} />

          {/* Sheet */}
          <div
            className="relative bg-white rounded-t-[32px] px-6 pt-5 space-y-5"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 5.5rem)" }}
          >
            {/* Handle bar */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto" />

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <Crown size={20} className="text-emerald-500" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[17px] font-bold text-[#1a1a1a] leading-tight">
                  Calc Pro · {planLabel}
                </p>
                <p className="text-[12px] text-[#8a8a8a] font-medium">
                  {isTrial ? "Período de teste gratuito" : "Assinatura ativa"}
                </p>
              </div>
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide shrink-0">
                {isTrial ? "Trial" : "Ativo"}
              </span>
            </div>

            {/* Expiry info card */}
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
              <Calendar size={17} className="text-gray-400 shrink-0" />
              <div>
                <p className="text-[11px] text-[#8a8a8a] font-medium uppercase tracking-wide">
                  Vencimento do plano
                </p>
                <p className="text-[15px] font-bold text-[#1a1a1a] mt-0.5">
                  {formatExpiryFull(subscriptionInfo?.expiresAt ?? null)}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100" />

            {/* Actions */}
            {cancelStep === "done" ? (
              /* ── Success state ── */
              <div className="bg-gray-50 rounded-2xl p-4 text-center space-y-1">
                <p className="text-[14px] font-bold text-[#1a1a1a]">
                  {canRefund ? "Reembolso solicitado" : "Assinatura cancelada"}
                </p>
                <p className="text-[12px] text-[#8a8a8a] leading-relaxed">
                  {canRefund
                    ? "Seu acesso foi encerrado. O estorno será processado em breve."
                    : `Acesso garantido até ${formatExpiryFull(subscriptionInfo?.expiresAt ?? null)}.`}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* ── Idle: single cancel button ── */}
                {cancelStep === "idle" && (
                  <button
                    onClick={() => setCancelStep("confirm")}
                    className="w-full py-3.5 rounded-2xl border border-gray-200 text-[14px] font-semibold text-[#4a4a4a] bg-white active:bg-gray-50 transition-all"
                  >
                    Cancelar assinatura
                    {canRefund && (
                      <span className="block text-[11px] font-normal text-amber-500 mt-0.5">
                        Reembolso automático incluído · CDC Art. 49
                      </span>
                    )}
                  </button>
                )}

                {/* ── Confirm ── */}
                {cancelStep === "confirm" && (
                  <div className="bg-red-50 rounded-2xl p-4 space-y-3">
                    <p className="text-[13px] font-bold text-red-600">
                      {canRefund ? "Cancelar e reembolsar?" : "Cancelar assinatura?"}
                    </p>
                    <p className="text-[12px] text-red-500 leading-relaxed">
                      {canRefund ? (
                        "O valor pago será estornado e seu acesso encerrado imediatamente."
                      ) : (
                        <>
                          Você mantém acesso até{" "}
                          <strong>{formatExpiryFull(subscriptionInfo?.expiresAt ?? null)}</strong>.
                          Após esse prazo o acesso será encerrado.
                        </>
                      )}
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setCancelStep("idle")}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-[#4a4a4a] bg-white"
                      >
                        Voltar
                      </button>
                      <button
                        onClick={handleCancelSubscription}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 text-[13px] font-bold text-white active:scale-95 transition-all"
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Loading ── */}
                {cancelStep === "loading" && (
                  <div className="flex items-center justify-center py-3 gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-400" />
                    <span className="text-[13px] text-[#8a8a8a]">
                      {canRefund ? "Processando reembolso…" : "Cancelando assinatura…"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

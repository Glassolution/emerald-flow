import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ChevronLeft, AlertCircle, CheckCircle, Building2, Plane, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";

export default function Register() {
  const navigate = useNavigate();
  const { user, loading, signUp } = useAuth();
  const { t } = useI18n();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [drone, setDrone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user && !loading) {
      navigate("/app/home", { replace: true });
    }
  }, [user, loading, navigate]);

  const validateForm = (): string | null => {
    if (!fullName.trim()) return t('auth.errors.nameRequired');
    if (!company.trim()) return t('auth.errors.companyRequired');
    if (!email.trim()) return t('auth.errors.emailRequired');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t('auth.errors.emailInvalid');
    if (!password) return t('auth.errors.passwordRequired');
    if (password.length < 6) return t('auth.errors.passwordLength');
    if (password !== confirmPassword) return t('auth.errors.passwordMismatch');
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);
    
    console.log("🔄 [Register] Criando conta com perfil...");
    
    // Criar conta com dados do perfil incluídos
    const { error } = await signUp(email, password, {
      fullName: fullName.trim(),
      companyName: company.trim(),
      drones: drone.trim() || undefined,
    });
    
    if (error) {
      console.error("❌ [Register] Erro ao criar conta:", error);
      setError(error.message.includes("already registered") ? t('auth.register.alreadyRegistered') : error.message);
      setIsSubmitting(false);
    } else {
      // Conta criada com sucesso
      console.log("✅ [Register] Conta criada com perfil completo!");
      setSuccess(true);
      setIsSubmitting(false);
      
      // Se a confirmação de email estiver desativada, o usuário será redirecionado
      // automaticamente para /app/home pelo useEffect que monitora o estado 'user'.
      // Caso contrário, ele verá a mensagem de sucesso e poderá ir para o login.
    }
  };

  const handleBack = () => {
    navigate("/landing", { replace: true });
  };

  return (
    <div
      className="min-h-screen min-h-[100dvh] flex flex-col bg-white text-slate-900"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex-1 w-full overflow-y-auto">
        <div className="min-h-full flex flex-col items-center justify-center py-10 px-6">
          <div className="w-full max-w-sm relative">
          <button
            type="button"
            onClick={handleBack}
            className="absolute -top-12 left-0 p-2 text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          <div
            className={`space-y-1 mb-6 text-center transition-all duration-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <h1 className="text-2xl font-semibold tracking-tight">{t('auth.register.title')}</h1>
            <p className="text-sm text-slate-500">{t('auth.register.subtitle')}</p>
          </div>

          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-700">
              <CheckCircle size={18} />
              <span>{t('auth.register.success')}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div
              className={`space-y-1.5 transition-all duration-500 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <User size={16} className="text-slate-400" />
                {t('auth.register.nameLabel')}
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                disabled={isSubmitting || success}
                autoComplete="name"
                placeholder={t('auth.register.namePlaceholder')}
                className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#A3FF3F]"
              />
            </div>

            <div
              className={`space-y-1.5 transition-all duration-500 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "260ms" }}
            >
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Building2 size={16} className="text-slate-400" />
                {t('auth.register.companyLabel')}
              </label>
              <Input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                disabled={isSubmitting || success}
                autoComplete="organization"
                placeholder={t('auth.register.companyPlaceholder')}
                className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#A3FF3F]"
              />
            </div>

            <div
              className={`space-y-1.5 transition-all duration-500 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "320ms" }}
            >
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Plane size={16} className="text-slate-400" />
                {t('auth.register.droneLabel')}
                <span className="text-xs font-normal text-slate-400">{t('auth.register.droneOptional')}</span>
              </label>
              <Input
                type="text"
                value={drone}
                onChange={e => setDrone(e.target.value)}
                disabled={isSubmitting || success}
                autoComplete="off"
                placeholder={t('auth.register.dronePlaceholder')}
                className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#A3FF3F]"
              />
            </div>

            <div
              className={`space-y-1.5 transition-all duration-500 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "380ms" }}
            >
              <label className="block text-sm font-medium text-slate-700">{t('auth.login.emailLabel')}</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#A3FF3F] transition-colors w-5 h-5" />
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={isSubmitting || success}
                  autoComplete="email"
                  placeholder={t('auth.register.emailPlaceholder')}
                  className="h-11 w-full pl-12 rounded-full border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#A3FF3F]"
                />
              </div>
            </div>

            <div
              className={`space-y-1.5 transition-all duration-500 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "440ms" }}
            >
              <label className="block text-sm font-medium text-slate-700">{t('auth.login.passwordLabel')}</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#A3FF3F] transition-colors w-5 h-5" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isSubmitting || success}
                  placeholder="••••••••"
                  className="h-11 w-full pl-12 pr-12 rounded-full border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#A3FF3F]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div
              className={`space-y-1.5 transition-all duration-500 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "500ms" }}
            >
              <label className="block text-sm font-medium text-slate-700">{t('auth.register.confirmPasswordLabel')}</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#A3FF3F] transition-colors w-5 h-5" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting || success}
                  placeholder="••••••••"
                  className="h-11 w-full pl-12 pr-12 rounded-full border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#A3FF3F]"
                />
              </div>
            </div>

            <div
              className={`pt-2 transition-all duration-500 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "560ms" }}
            >
              <Button
                type="submit"
                disabled={isSubmitting || success}
                className="w-full h-12 rounded-full bg-[#A3FF3F] text-slate-900 font-bold text-base hover:bg-[#92e62e] active:scale-[0.98] transition-all shadow-lg shadow-[#A3FF3F]/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('auth.register.submitting') : t('auth.register.submitButton')}
              </Button>
            </div>
          </form>

          <div
            className={`mt-8 text-center text-sm transition-all duration-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "620ms" }}
          >
            <span className="text-slate-500">{t('auth.register.alreadyAccount')} </span>
            <Link to="/auth/login" className="font-bold text-[#A3FF3F] hover:underline hover:text-[#92e62e]">
              {t('auth.login.title')}
            </Link>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

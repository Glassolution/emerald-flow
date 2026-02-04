import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";

export default function Login() {
  const navigate = useNavigate();
  const { user, loading, signIn, signInWithGoogle } = useAuth();
  const { t } = useI18n();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Redirecionar se já logado
  useEffect(() => {
    if (user && !loading) {
      navigate("/app/home", { replace: true });
    }
  }, [user, loading, navigate]);

  const validateForm = (): string | null => {
    if (!email.trim()) return t('auth.errors.emailRequired');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t('auth.errors.emailInvalid');
    if (!password) return t('auth.errors.passwordRequired');
    if (password.length < 6) return t('auth.errors.passwordLength');
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message === "Invalid login credentials" 
        ? t('auth.errors.invalidCredentials') 
        : error.message
      );
      setIsSubmitting(false);
    } else {
      navigate("/loading", { replace: true });
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoading(true);
    console.log("🔄 [Login] Iniciando login com Google...");
    
    const { error } = await signInWithGoogle();
    
    if (error) {
      console.error("❌ [Login] Erro no Google login:", error);
      setError(error.message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="font-sans antialiased bg-[#FFFFFF] dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 min-h-[100dvh] flex flex-col">
       <style>{`
        .grid-pattern {
            background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px);
            background-size: 24px 24px;
        }
        .dark .grid-pattern {
            background-image: radial-gradient(circle, #1f2937 1px, transparent 1px);
        }
      `}</style>
      
      <div className="fixed inset-0 grid-pattern opacity-50 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col flex-grow px-6 pt-12 pb-8 max-w-md mx-auto w-full">
        <div className="mb-8">
          <button 
          onClick={() => navigate("/landing")} 
          className="p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:text-[#A3FF33] transition-colors"
        >
          <ChevronLeft className="w-8 h-8" strokeWidth={1.5} />
        </button>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">{t('auth.login.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{t('auth.login.subtitle')}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-[16px] bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1" htmlFor="email">{t('auth.login.emailLabel')}</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#A3FF33] transition-colors w-6 h-6" />
              <input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.register.emailPlaceholder')}
                className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-[#18181b] border-none rounded-[22px] focus:ring-2 focus:ring-[#A3FF33] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1" htmlFor="password">{t('auth.login.passwordLabel')}</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#A3FF33] transition-colors w-6 h-6" />
              <input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-4 bg-slate-100 dark:bg-[#18181b] border-none rounded-[22px] focus:ring-2 focus:ring-[#A3FF33] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 transition-all outline-none"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <a href="#" className="text-sm font-semibold text-[#15803d] dark:text-[#A3FF33] hover:opacity-80 transition-opacity">
              {t('auth.login.forgotPassword')}
            </a>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#A3FF33] text-zinc-900 font-bold text-lg rounded-[22px] shadow-lg shadow-[#A3FF33]/20 hover:scale-[0.98] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('auth.login.submitting') : t('auth.login.submitButton')}
          </button>
        </form>

        <div className="relative my-10">
          <div aria-hidden="true" className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-sm font-medium uppercase tracking-widest">
            <span className="bg-[#FFFFFF] dark:bg-[#0A0A0A] px-4 text-slate-400 dark:text-zinc-600">{t('auth.login.or')}</span>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 rounded-[22px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {isGoogleLoading ? (
               <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-[#A3FF33]" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
            )}
            <span>{t('auth.login.continueGoogle')}</span>
          </button>

          <button 
            type="button"
            className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 rounded-[22px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors opacity-70 cursor-not-allowed"
          >
            <svg className="w-5 h-5 dark:fill-white fill-black" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.56-2.09-.48-3.08.02-1.06.53-2.39.38-3.4-.75C4.77 16.91 4.25 10.68 8.85 9.88c2.06.16 3.3 1.09 4.25 1.09.93 0 2.65-1.33 4.54-1.09 1.93.24 3.36 1.18 4.25 2.76-3.76 2.05-3.16 6.81.42 8.35-.41 1.27-1.04 2.5-1.86 3.29zM12.03 7.25c-.25-2.19 1.62-4.04 3.54-4.25.32 2.37-2.08 4.35-3.54 4.25z"></path>
            </svg>
            <span>{t('auth.login.continueApple')}</span>
          </button>
        </div>

        <div className="mt-8 text-center text-sm">
            <span className="text-slate-500 dark:text-slate-400">{t('auth.login.noAccount')} </span>
            <Link to="/auth/register" className="font-bold text-[#A3FF33] hover:underline">
              {t('auth.login.createAccount')}
            </Link>
        </div>
      </div>
    </div>
  );
}

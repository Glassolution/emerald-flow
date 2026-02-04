import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Crosshair, Droplet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import principalImg from "@/assets/principal.png";

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t, language, setLanguage } = useI18n();

  useEffect(() => {
    if (user && !loading) {
      navigate("/app/home", { replace: true });
    }
  }, [user, loading, navigate]);

  const toggleLanguage = () => {
    if (language === 'pt') setLanguage('en');
    else if (language === 'en') setLanguage('es');
    else setLanguage('pt');
  };

  const getLanguageLabel = () => {
    switch (language) {
      case 'pt': return { flag: '🇧🇷', label: 'PT' };
      case 'en': return { flag: '🇺🇸', label: 'EN' };
      case 'es': return { flag: '🇪🇸', label: 'ES' };
      default: return { flag: '🇧🇷', label: 'PT' };
    }
  };

  const langInfo = getLanguageLabel();

  return (
    <div 
      className="font-sans antialiased bg-[#FFFFFF] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 h-[100dvh] flex flex-col overflow-hidden"
    >
       <style>{`
        .grid-pattern {
            background-image: radial-gradient(circle, #e2e8f0 1px, transparent 1px);
            background-size: 24px 24px;
        }
        .dark .grid-pattern {
            background-image: radial-gradient(circle, #1e293b 1px, transparent 1px);
        }
        .hero-glow {
            background: radial-gradient(circle at 50% 50%, rgba(163, 255, 71, 0.15) 0%, transparent 70%);
        }
      `}</style>

      {/* Header */}
      <header className="p-6 flex justify-end">
        <button 
          onClick={toggleLanguage}
          className="flex items-center space-x-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <span className="text-sm font-medium">{langInfo.flag}</span>
          <span className="text-sm font-semibold uppercase tracking-wider">{langInfo.label}</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 relative overflow-hidden shrink-0 justify-center min-h-0">
        <div className="absolute inset-0 grid-pattern opacity-60 pointer-events-none -z-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full hero-glow pointer-events-none -z-10"></div>

        <div className="flex-1 flex items-center justify-center relative py-2 min-h-0 w-full max-w-md mx-auto">
            {/* Main Image */}
            <div className="relative flex items-center justify-center w-full">
                <img 
                    src={principalImg} 
                    alt="App Preview" 
                    className="relative h-auto w-auto max-h-[45vh] object-contain drop-shadow-2xl z-20"
                />

                {/* Floating Icons */}
                <div className="absolute top-[10%] right-4 bg-white dark:bg-slate-800 p-2.5 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 animate-bounce z-10" style={{ animationDuration: '4s' }}>
                    <Crosshair className="text-[#A3FF47] w-5 h-5" />
                </div>
                <div className="absolute bottom-[15%] left-4 bg-white dark:bg-slate-800 p-2.5 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 animate-bounce z-10" style={{ animationDuration: '5s', animationDelay: '1s' }}>
                    <Droplet className="text-blue-500 w-5 h-5" />
                </div>
            </div>
        </div>

        {/* Text Content */}
        <div className="text-center pt-2 pb-4">
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">
                CALC
            </h1>
            <p className="text-sm md:text-base font-semibold leading-snug px-4 text-slate-800 dark:text-slate-200">
                {t('welcome.appDescription')}
            </p>
            <div className="mt-3 flex justify-center space-x-1">
                <div className="h-1 w-6 rounded-full bg-[#A3FF47]"></div>
                <div className="h-1 w-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                <div className="h-1 w-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 pb-6 flex flex-col items-center shrink-0">
        <button 
            onClick={() => navigate("/onboarding/quiz")}
            className="w-full py-3.5 md:py-4 bg-[#A3FF47] hover:bg-[#92E63F] active:scale-[0.98] transition-all rounded-[2rem] text-slate-900 font-extrabold text-base shadow-lg shadow-[#A3FF47]/20 flex items-center justify-center space-x-2"
        >
            <span>{t('welcome.startQuiz')}</span>
            <ArrowRight className="w-4 h-4" />
        </button>
        <button 
            onClick={() => navigate("/auth/login")}
            className="mt-3 md:mt-4 text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-white transition-colors text-sm"
        >
            {t('auth.register.alreadyAccount')} <span className="text-slate-900 dark:text-white font-bold underline decoration-[#A3FF47] decoration-2 underline-offset-4">{t('auth.login.title')}</span>
        </button>
      </footer>
      <div className="h-4 md:h-8 w-full shrink-0"></div>
    </div>
  );
}

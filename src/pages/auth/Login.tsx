import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { user, loading, signIn, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    // Se não houve erro, o usuário será redirecionado para o Google
  };

  // Redirecionar se já logado
  useEffect(() => {
    if (user && !loading) {
      navigate("/app/home", { replace: true });
    }
  }, [user, loading, navigate]);

  const validateForm = (): string | null => {
    if (!email.trim()) return "Digite seu e-mail";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "E-mail inválido";
    if (!password) return "Digite sua senha";
    if (password.length < 6) return "A senha deve ter pelo menos 6 caracteres";
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
        ? "E-mail ou senha incorretos" 
        : error.message
      );
      setIsSubmitting(false);
    } else {
      navigate("/loading", { replace: true });
    }
  };

  const handleBack = () => {
    navigate("/welcome", { replace: true });
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-[#22c55e] relative overflow-hidden">
      {/* Área superior verde */}
      <div className="h-[20vh] min-h-[120px] relative">
        {/* Botão voltar */}
        <button 
          onClick={handleBack}
          className="absolute left-4 p-2 text-white/90 hover:text-white transition-colors z-10"
          style={{ top: "calc(1rem + env(safe-area-inset-top))" }}
        >
          <ChevronLeft size={28} strokeWidth={2} />
        </button>
      </div>

      {/* Área inferior branca com formulário */}
      <div 
        className={`flex-1 bg-white rounded-t-[32px] -mt-6 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-all duration-500 ease-out ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        <div className="px-6 pt-8 pb-8 w-full md:max-w-md md:mx-auto">
          {/* Título */}
          <h1 
            className={`text-2xl font-semibold text-[#1D1D1F] text-center mb-2 transition-all duration-500 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ 
              transitionDelay: '200ms',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif'
            }}
          >
            Entrar
          </h1>
          
          {/* Subtítulo */}
          <p 
            className={`text-sm text-[#86868B] text-center mb-8 transition-all duration-500 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            Acesse sua conta para continuar
          </p>

          {/* Erro */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 mb-6">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div 
              className={`transition-all duration-500 ease-out ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              <label className="block text-[#1D1D1F] text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" />
                <input
                  type="email"
                  value={email}
                  disabled={isSubmitting}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-[#F5F5F7] text-[#1D1D1F] placeholder-[#86868B] focus:border-[#22c55e] focus:bg-white focus:outline-none transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Senha */}
            <div 
              className={`transition-all duration-500 ease-out ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '500ms' }}
            >
              <label className="block text-[#1D1D1F] text-sm font-medium mb-2">Senha</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  disabled={isSubmitting}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full h-14 pl-12 pr-12 rounded-2xl border border-gray-200 bg-[#F5F5F7] text-[#1D1D1F] placeholder-[#86868B] focus:border-[#22c55e] focus:bg-white focus:outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  tabIndex={-1}
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Mostrar senha"
                >
                  {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>} 
                </button>
              </div>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full h-14 rounded-full font-semibold text-white transition-all duration-300 active:scale-[0.98] ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ 
                transitionDelay: '600ms',
                background: isSubmitting ? "#86efac" : "#22c55e",
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif'
              }}
            >
              {isSubmitting ? "Entrando..." : "Continuar"}
            </button>
          </form>

          {/* Separador */}
          <div 
            className={`flex items-center gap-4 my-6 transition-all duration-500 ease-out ${
              mounted ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: '700ms' }}
          >
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-[#86868B]">Ou</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Login Social */}
          <div 
            className={`space-y-3 transition-all duration-500 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '800ms' }}
          >
            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isSubmitting}
              className="w-full h-14 border border-gray-200 rounded-full flex items-center justify-center gap-3 text-[#1D1D1F] font-medium bg-white hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {isGoogleLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-[#4285F4] rounded-full animate-spin"></div>
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.20457C17.64 8.56666 17.5827 7.95293 17.4764 7.3634H9V10.8453H13.8436C13.6347 11.9813 12.9636 12.9838 11.9682 13.6418V15.6413H14.82C16.2991 14.2977 17.64 12.0685 17.64 9.20457Z" fill="#4285F4"/>
                    <path d="M9 18C11.43 18 13.4446 17.179 14.82 15.6413L11.9682 13.6418C11.2345 14.1418 10.2591 14.4454 9 14.4454C6.65591 14.4454 4.67318 12.7875 3.96409 10.6606H0.982269V12.7201C2.35227 15.0239 5.43727 18 9 18Z" fill="#34A853"/>
                    <path d="M3.96409 10.6606C3.78409 10.1606 3.68136 9.62007 3.68136 9.06136C3.68136 8.50255 3.78409 7.96207 3.96409 7.46206V5.40262H0.982273C0.357273 6.66207 0 8.03398 0 9.06136C0 10.0887 0.357273 11.4607 0.982273 12.7201L3.96409 10.6606Z" fill="#FBBC05"/>
                    <path d="M9 3.57654C10.3573 3.57654 11.5672 4.01944 12.5277 4.94182L15.1473 2.32225C13.4446 0.800181 11.43 0 9 0C5.43727 0 2.35227 2.97609 0.982273 5.40262L3.96409 7.46206C4.67318 5.33515 6.65591 3.57654 9 3.57654Z" fill="#EA4335"/>
                  </svg>
                  <span>Continuar com Google</span>
                </>
              )}
            </button>

            {/* Apple - desabilitado por enquanto */}
            <button
              type="button"
              disabled
              className="w-full h-14 border border-gray-200 rounded-full flex items-center justify-center gap-3 text-[#86868B] font-medium bg-gray-50 cursor-not-allowed opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                <path d="M14.1755 9.25757C14.1695 7.54442 15.5536 6.76324 15.6147 6.72605C14.7842 5.52703 13.5487 5.3707 13.0351 5.35651C11.908 5.24462 10.8273 5.96285 10.2462 5.96285C9.6521 5.96285 8.66985 5.37376 7.7158 5.39173C6.4721 5.41016 5.31885 6.11559 4.66785 7.20277C3.2451 9.55196 4.45925 12.9685 5.82235 14.8438C6.48485 15.7647 7.2879 16.7855 8.37825 16.7511C9.44695 16.7133 9.8124 16.053 11.0632 16.053C12.3007 16.053 12.6396 16.7511 13.7484 16.7291C14.8848 16.7133 15.5616 15.8306 16.2162 14.9036C16.9841 13.8067 17.3245 12.7359 17.3332 12.6992C17.3112 12.6907 14.1814 11.4681 14.1755 9.25757ZM11.6771 3.92863C12.1856 3.29277 12.5617 2.41748 12.4627 1.54218C11.7392 1.571 10.7986 2.05482 10.2706 2.6862C9.80765 3.23325 9.3808 4.11768 9.4986 4.97556C10.3076 5.03819 11.1686 4.56447 11.6771 3.92863Z" fill="#86868B"/>
              </svg>
              <span>Em breve</span>
            </button>
          </div>

          {/* Link criar conta */}
          <div 
            className={`text-center mt-8 transition-all duration-500 ease-out ${
              mounted ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: '900ms' }}
          >
            <span className="text-sm text-[#86868B]">Não tem conta? </span>
            <Link 
              to="/auth/register" 
              className="text-[#22c55e] font-semibold text-sm hover:underline"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

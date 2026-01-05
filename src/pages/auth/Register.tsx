import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ChevronLeft, AlertCircle, CheckCircle, Building2, Plane } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { user, loading, signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    if (!company.trim()) return "Informe o nome da empresa";
    if (!email.trim()) return "Digite seu e-mail";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "E-mail inválido";
    if (!password) return "Digite sua senha";
    if (password.length < 6) return "A senha deve ter pelo menos 6 caracteres";
    if (password !== confirmPassword) return "As senhas não coincidem";
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
    
    console.log("🔄 [Register] Criando conta...");
    const { error } = await signUp(email, password);
    
    if (error) {
      console.error("❌ [Register] Erro ao criar conta:", error);
      setError(error.message.includes("already registered") ? "Este e-mail já está cadastrado" : error.message);
      setIsSubmitting(false);
    } else {
      // Conta criada com sucesso - sempre redirecionar para login
      console.log("✅ [Register] Conta criada com sucesso!");
      setSuccess(true);
      setIsSubmitting(false);
      
      // Redirecionar para login após 1.5 segundos
      setTimeout(() => {
        console.log("✅ [Register] Redirecionando para login...");
        navigate("/auth/login", { replace: true });
      }, 1500);
    }
  };

  const handleBack = () => {
    navigate("/auth/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#22c55e] relative overflow-hidden">
      {/* Área superior verde */}
      <div className="h-[15vh] min-h-[100px] relative">
        {/* Botão voltar */}
        <button 
          onClick={handleBack}
          className="absolute left-4 top-10 p-2 text-white/90 hover:text-white transition-colors z-10"
        >
          <ChevronLeft size={28} strokeWidth={2} />
        </button>
      </div>

      {/* Área inferior branca com formulário */}
      <div 
        className={`flex-1 bg-white rounded-t-[32px] -mt-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] overflow-y-auto transition-all duration-500 ease-out ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        <div className="px-6 pt-6 pb-8 max-w-md mx-auto w-full">
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
            Criar conta
          </h1>
          
          {/* Subtítulo */}
          <p 
            className={`text-sm text-[#86868B] text-center mb-6 transition-all duration-500 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            Preencha os campos para começar
          </p>

          {/* Mensagem de sucesso */}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-600 rounded-2xl px-4 py-3 mb-4">
              <CheckCircle size={18} />
              <span className="text-sm">Conta criada! Faça login para continuar...</span>
            </div>
          )}

          {/* Erro */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 mb-4">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome Empresa */}
            <div 
              className={`transition-all duration-500 ease-out ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '350ms' }}
            >
              <label className="block text-[#1D1D1F] text-sm font-medium mb-2 flex items-center gap-1.5">
                <Building2 size={16} className="text-[#86868B]" />
                Nome da Empresa
              </label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="w-full h-14 px-4 rounded-2xl border border-gray-200 bg-[#F5F5F7] text-[#1D1D1F] placeholder-[#86868B] focus:border-[#22c55e] focus:bg-white focus:outline-none transition-all"
                placeholder="Ex: Fazenda Boa Colheita"
                disabled={isSubmitting || success}
                autoComplete="organization"
              />
            </div>

            {/* Drone(s) (opcional) */}
            <div 
              className={`transition-all duration-500 ease-out ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              <label className="block text-[#1D1D1F] text-sm font-medium mb-2 flex items-center gap-1.5">
                <Plane size={16} className="text-[#86868B]" />
                Drone(s) utilizado(s)
                <span className="text-xs text-[#86868B] font-normal">(Opcional)</span>
              </label>
              <input
                type="text"
                value={drone}
                onChange={e => setDrone(e.target.value)}
                className="w-full h-14 px-4 rounded-2xl border border-gray-200 bg-[#F5F5F7] text-[#1D1D1F] placeholder-[#86868B] focus:border-[#22c55e] focus:bg-white focus:outline-none transition-all"
                placeholder="Ex: DJI AGRAS, XAG, etc."
                disabled={isSubmitting || success}
                autoComplete="off"
              />
            </div>

            {/* Email */}
            <div 
              className={`transition-all duration-500 ease-out ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '450ms' }}
            >
              <label className="block text-[#1D1D1F] text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" />
                <input
                  type="email"
                  value={email}
                  disabled={isSubmitting || success}
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
                  disabled={isSubmitting || success}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full h-14 pl-12 pr-12 rounded-2xl border border-gray-200 bg-[#F5F5F7] text-[#1D1D1F] placeholder-[#86868B] focus:border-[#22c55e] focus:bg-white focus:outline-none transition-all"
                  placeholder="min. 6 caracteres"
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

            {/* Confirmar senha */}
            <div 
              className={`transition-all duration-500 ease-out ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '550ms' }}
            >
              <label className="block text-[#1D1D1F] text-sm font-medium mb-2">Confirmar senha</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  disabled={isSubmitting || success}
                  onChange={e => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full h-14 pl-12 pr-4 rounded-2xl border border-gray-200 bg-[#F5F5F7] text-[#1D1D1F] placeholder-[#86868B] focus:border-[#22c55e] focus:bg-white focus:outline-none transition-all"
                  placeholder="Repita a senha"
                />
              </div>
            </div>

            {/* Botão Criar conta */}
            <button
              type="submit"
              disabled={isSubmitting || success}
              className={`w-full h-14 rounded-full font-semibold text-white transition-all duration-300 active:scale-[0.98] mt-2 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ 
                transitionDelay: '600ms',
                background: isSubmitting ? "#86efac" : "#22c55e",
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif'
              }}
            >
              {isSubmitting ? "Criando..." : "Criar conta"}
            </button>
          </form>

          {/* Link para login */}
          <div 
            className={`text-center mt-6 transition-all duration-500 ease-out ${
              mounted ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: '700ms' }}
          >
            <span className="text-sm text-[#86868B]">Já tem conta? </span>
            <Link 
              to="/auth/login" 
              className="text-[#22c55e] font-semibold text-sm hover:underline"
            >
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

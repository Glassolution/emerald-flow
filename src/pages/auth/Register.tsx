import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Calculator, Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SplashScreen } from "@/components/ui/SplashScreen";

export default function Register() {
  const navigate = useNavigate();
  const { user, loading, signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forceRender, setForceRender] = useState(false);

  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn("⚠️ [Register] Timeout de segurança atingido, forçando renderização");
      setForceRender(true);
    }, 1500); // 1.5 segundos

    return () => clearTimeout(timeout);
  }, []);

  // Show splash while loading (mas com timeout de segurança)
  // Se forceRender for true, renderizar a página mesmo com loading
  if (loading && !forceRender) {
    return <SplashScreen />;
  }

  // Redirect to app if already logged in
  useEffect(() => {
    if (user && !loading) {
      const checkProfile = async () => {
        const { isProfileComplete } = await import("@/lib/userProfile");
        const profileComplete = await isProfileComplete();
        if (profileComplete) {
          navigate("/app/home", { replace: true });
        } else {
          navigate("/auth/profile-setup", { replace: true });
        }
      };
      checkProfile();
    }
  }, [user, loading, navigate]);

  if (user) {
    return <SplashScreen />;
  }

  const validateForm = (): string | null => {
    if (!email.trim()) {
      return "Digite seu e-mail";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "E-mail inválido";
    }
    if (!password) {
      return "Digite sua senha";
    }
    if (password.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres";
    }
    if (password !== confirmPassword) {
      return "As senhas não coincidem";
    }
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

    const { user, error } = await signUp(email, password);

    if (error) {
      if (error.message.includes("already registered")) {
        setError("Este e-mail já está cadastrado");
      } else {
        setError(error.message);
      }
      setIsSubmitting(false);
    } else {
      // Se o Supabase fez login automático (user existe), ir para loading
      if (user) {
        setIsSubmitting(false);
        // Redirecionar para página de loading (splash)
        navigate("/loading", { replace: true });
      } else {
        // Caso contrário, mostra sucesso e redireciona para login
        setSuccess(true);
        setIsSubmitting(false);
        setTimeout(() => {
          navigate("/auth/login", { replace: true });
        }, 2000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="p-4 flex-shrink-0">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white active:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Voltar</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 pt-2 pb-8 overflow-y-auto">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
            <Calculator size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Criar conta</h1>
          <p className="text-gray-500 text-sm mt-1">Comece a usar o Calc</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3">
            <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
            <div>
              <p className="text-sm text-green-400 font-medium">Conta criada!</p>
              <p className="text-xs text-green-400/70">Redirecionando...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">E-mail</label>
            <div className="relative">
              <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 focus:bg-white/[0.07] transition-all"
                disabled={isSubmitting || success}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">Senha</label>
            <div className="relative">
              <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full h-14 pl-12 pr-12 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 focus:bg-white/[0.07] transition-all"
                disabled={isSubmitting || success}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white active:text-white transition-colors p-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">Confirmar senha</label>
            <div className="relative">
              <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 focus:bg-white/[0.07] transition-all"
                disabled={isSubmitting || success}
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || success}
            className="w-full h-14 bg-green-500 text-white font-semibold rounded-2xl hover:bg-green-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Criando...
              </span>
            ) : (
              "Criar conta"
            )}
          </button>
        </form>

        {/* Spacer */}
        <div className="flex-1 min-h-4" />

        {/* Login Link */}
        <p className="text-center text-gray-400 text-sm mt-6">
          Já tem conta?{" "}
          <Link to="/auth/login" className="text-green-400 font-semibold">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}


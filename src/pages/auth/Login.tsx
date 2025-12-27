import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Calculator, Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SplashScreen } from "@/components/ui/SplashScreen";

export default function Login() {
  const navigate = useNavigate();
  const { user, loading, signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show splash while loading
  if (loading) {
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
      // Após login bem-sucedido, redirecionar para página de loading (splash)
      navigate("/loading", { replace: true });
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
      <div className="flex-1 flex flex-col px-6 pt-4 pb-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
            <Calculator size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Bem-vindo de volta</h1>
          <p className="text-gray-500 text-sm mt-1">Entre para continuar</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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
                disabled={isSubmitting}
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
                placeholder="••••••••"
                className="w-full h-14 pl-12 pr-12 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 focus:bg-white/[0.07] transition-all"
                disabled={isSubmitting}
                autoComplete="current-password"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-green-500 text-white font-semibold rounded-2xl hover:bg-green-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Entrando...
              </span>
            ) : (
              "Entrar"
            )}
          </button>
        </form>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Register Link */}
        <p className="text-center text-gray-400 text-sm">
          Não tem conta?{" "}
          <Link to="/auth/register" className="text-green-400 font-semibold">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}

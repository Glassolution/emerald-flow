import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, User, Plane, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { saveUserProfile, UserProfile } from "@/lib/userProfile";
import { SplashScreen } from "@/components/ui/SplashScreen";
import { Logo } from "@/components/Logo";
import { AvatarPicker } from "@/components/profile/AvatarPicker";
import { getAvatarUrl } from "@/lib/avatarService";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [formData, setFormData] = useState<UserProfile>({
    companyName: "",
    fullName: "",
    drones: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Carregar avatar existente (se houver)
  useEffect(() => {
    const loadAvatar = async () => {
      if (user) {
        const url = await getAvatarUrl();
        setAvatarUrl(url);
      }
    };
    loadAvatar();
  }, [user]);

  // Mostrar splash screen inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500); // 1.5s igual ao splash inicial

    return () => clearTimeout(timer);
  }, []);

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth/login", { replace: true });
    }
  }, [user, loading, navigate]);

  // Mostrar splash enquanto carrega ou durante animação
  if (loading || showSplash) {
    return <SplashScreen />;
  }

  // Se não tiver usuário, não renderiza (será redirecionado)
  if (!user) {
    return null;
  }

  const validateForm = (): string | null => {
    if (!formData.companyName.trim()) {
      return "Digite o nome da empresa";
    }
    if (!formData.fullName.trim()) {
      return "Digite seu nome";
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

    const { error: saveError } = await saveUserProfile({
      companyName: formData.companyName.trim(),
      fullName: formData.fullName.trim(),
      drones: formData.drones?.trim() || undefined,
    });

    if (saveError) {
      setError(saveError.message || "Erro ao salvar perfil. Tente novamente.");
      setIsSubmitting(false);
    } else {
      console.log("✅ [ProfileSetup] Perfil salvo, aguardando atualização...");
      
      // Aguardar um pouco para garantir que a atualização foi processada
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se o perfil foi salvo corretamente antes de redirecionar
      const { isProfileComplete } = await import("@/lib/userProfile");
      const complete = await isProfileComplete();
      
      console.log("🔍 [ProfileSetup] Perfil completo?", complete);
      
      if (complete) {
        // Perfil completo - redirecionar para home
        console.log("✅ [ProfileSetup] Redirecionando para /app/home");
        navigate("/app/home", { replace: true });
      } else {
        // Se ainda não estiver completo, tentar novamente após mais um delay
        console.warn("⚠️ [ProfileSetup] Perfil ainda não completo, aguardando mais...");
        await new Promise(resolve => setTimeout(resolve, 500));
        const completeRetry = await isProfileComplete();
        
        if (completeRetry) {
          console.log("✅ [ProfileSetup] Perfil completo após retry, redirecionando");
          navigate("/app/home", { replace: true });
        } else {
          console.error("❌ [ProfileSetup] Perfil ainda não completo após retry");
          setError("Erro ao salvar perfil. Tente recarregar a página.");
          setIsSubmitting(false);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="p-6 flex flex-col items-center">
        <Logo size="lg" className="mb-4" />
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Complete seu perfil
        </h1>
        <p className="text-gray-400 text-sm text-center">
          Preencha algumas informações para personalizar sua experiência
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 pb-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Foto do Perfil (Opcional) */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
              <User size={16} />
              Foto do Perfil
              <span className="text-xs text-gray-500">(opcional)</span>
            </label>
            <div className="flex justify-center py-4">
              <AvatarPicker
                avatarUrl={avatarUrl}
                onAvatarChange={setAvatarUrl}
                size="lg"
                showControls={true}
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              JPG, PNG ou WEBP. Máximo 3MB.
            </p>
          </div>

          {/* Nome da Empresa */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
              <Building2 size={16} />
              Nome da Empresa *
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              placeholder="Ex: AgroTech Ltda"
              className="w-full h-14 px-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 focus:bg-white/[0.07] transition-all"
              disabled={isSubmitting}
              autoComplete="organization"
            />
          </div>

          {/* Nome Completo */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
              <User size={16} />
              Seu Nome *
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder="Ex: João Silva"
              className="w-full h-14 px-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 focus:bg-white/[0.07] transition-all"
              disabled={isSubmitting}
              autoComplete="name"
            />
          </div>

          {/* Drones (Opcional) */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
              <Plane size={16} />
              Drones que você utiliza
              <span className="text-xs text-gray-500">(opcional)</span>
            </label>
            <input
              type="text"
              value={formData.drones}
              onChange={(e) =>
                setFormData({ ...formData, drones: e.target.value })
              }
              placeholder="Ex: DJI Agras T30, DJI Phantom 4"
              className="w-full h-14 px-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 focus:bg-white/[0.07] transition-all"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              Você pode listar múltiplos drones separados por vírgula
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-green-500 text-white font-semibold rounded-2xl hover:bg-green-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                Continuar
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Spacer */}
        <div className="flex-1" />
      </div>
    </div>
  );
}


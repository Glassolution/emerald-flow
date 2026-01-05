import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, User, Plane, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { saveUserProfile, UserProfile } from "@/lib/userProfile";
import { CircularLoader } from "@/components/ui/CircularLoader";
import { AvatarPicker } from "@/components/profile/AvatarPicker";
import { getAvatarUrl } from "@/lib/avatarService";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user, loading, refreshUser } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [mounted, setMounted] = useState(false);
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
        try {
          const url = await getAvatarUrl();
          if (url) {
            setAvatarUrl(url);
          }
        } catch (err) {
          console.log("ℹ️ [ProfileSetup] Nenhum avatar encontrado");
        }
      }
    };
    loadAvatar();
  }, [user]);

  // Mostrar splash screen inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      setMounted(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth/login", { replace: true });
    }
  }, [user, loading, navigate]);

  // Mostrar loader enquanto carrega
  if (loading || showSplash) {
    return <CircularLoader />;
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

    console.log("🔄 [ProfileSetup] Iniciando salvamento do perfil...");
    console.log("📍 [ProfileSetup] Dados:", formData);

    const validationError = validateForm();
    if (validationError) {
      console.log("❌ [ProfileSetup] Erro de validação:", validationError);
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("🔄 [ProfileSetup] Chamando saveUserProfile...");
      
      const { error: saveError } = await saveUserProfile({
        companyName: formData.companyName.trim(),
        fullName: formData.fullName.trim(),
        drones: formData.drones?.trim() || undefined,
      });

      if (saveError) {
        console.error("❌ [ProfileSetup] Erro ao salvar:", saveError);
        setError(saveError.message || "Erro ao salvar perfil. Tente novamente.");
        setIsSubmitting(false);
        return;
      }

      console.log("✅ [ProfileSetup] Perfil salvo com sucesso!");
      
      // Atualizar o usuário no contexto para refletir o novo profile_completed
      console.log("🔄 [ProfileSetup] Atualizando dados do usuário...");
      await refreshUser();
      
      // Pequeno delay extra para garantir propagação
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log("🔄 [ProfileSetup] Redirecionando para /app/home...");
      navigate("/app/home", { replace: true });
    } catch (err: any) {
      console.error("❌ [ProfileSetup] Erro inesperado:", err);
      setError(err?.message || "Erro inesperado. Tente novamente.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#22c55e] relative overflow-hidden">
      {/* Área superior verde */}
      <div className="h-[12vh] min-h-[80px] relative flex items-center justify-center">
        {/* Pode adicionar um ícone ou logo aqui se quiser */}
      </div>

      {/* Área inferior branca com formulário */}
      <div 
        className={`flex-1 bg-white rounded-t-[32px] -mt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] overflow-y-auto transition-all duration-500 ease-out ${
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
            Complete seu perfil
          </h1>
          
          {/* Subtítulo */}
          <p 
            className={`text-sm text-[#86868B] text-center mb-6 transition-all duration-500 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            Preencha algumas informações para personalizar sua experiência
          </p>

          {/* Erro */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 mb-4">
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Foto do Perfil */}
            <div 
              className={`transition-all duration-500 ease-out ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '350ms' }}
            >
              <label className="block text-[#1D1D1F] text-sm font-medium mb-2 flex items-center gap-1.5">
                <User size={16} className="text-[#86868B]" />
                Foto do Perfil
                <span className="text-xs text-[#86868B] font-normal">(opcional)</span>
              </label>
              <div className="flex justify-center py-3">
                <AvatarPicker
                  avatarUrl={avatarUrl}
                  onAvatarChange={setAvatarUrl}
                  size="lg"
                  showControls={true}
                />
              </div>
              <p className="text-xs text-[#86868B] text-center">
                JPG, PNG ou WEBP. Máximo 3MB.
              </p>
            </div>

            {/* Nome da Empresa */}
            <div 
              className={`transition-all duration-500 ease-out ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              <label className="block text-[#1D1D1F] text-sm font-medium mb-2 flex items-center gap-1.5">
                <Building2 size={16} className="text-[#86868B]" />
                Nome da Empresa *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                placeholder="Ex: AgroTech Ltda"
                className="w-full h-14 px-4 rounded-2xl border border-gray-200 bg-[#F5F5F7] text-[#1D1D1F] placeholder-[#86868B] focus:border-[#22c55e] focus:bg-white focus:outline-none transition-all"
                disabled={isSubmitting}
                autoComplete="organization"
              />
            </div>

            {/* Nome Completo */}
            <div 
              className={`transition-all duration-500 ease-out ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '450ms' }}
            >
              <label className="block text-[#1D1D1F] text-sm font-medium mb-2 flex items-center gap-1.5">
                <User size={16} className="text-[#86868B]" />
                Seu Nome *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="Ex: João Silva"
                className="w-full h-14 px-4 rounded-2xl border border-gray-200 bg-[#F5F5F7] text-[#1D1D1F] placeholder-[#86868B] focus:border-[#22c55e] focus:bg-white focus:outline-none transition-all"
                disabled={isSubmitting}
                autoComplete="name"
              />
            </div>

            {/* Drones (Opcional) */}
            <div 
              className={`transition-all duration-500 ease-out ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: '500ms' }}
            >
              <label className="block text-[#1D1D1F] text-sm font-medium mb-2 flex items-center gap-1.5">
                <Plane size={16} className="text-[#86868B]" />
                Drones que você utiliza
                <span className="text-xs text-[#86868B] font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={formData.drones}
                onChange={(e) =>
                  setFormData({ ...formData, drones: e.target.value })
                }
                placeholder="Ex: DJI Agras T30, DJI Phantom 4"
                className="w-full h-14 px-4 rounded-2xl border border-gray-200 bg-[#F5F5F7] text-[#1D1D1F] placeholder-[#86868B] focus:border-[#22c55e] focus:bg-white focus:outline-none transition-all"
                disabled={isSubmitting}
              />
              <p className="text-xs text-[#86868B] mt-1">
                Você pode listar múltiplos drones separados por vírgula
              </p>
            </div>

            {/* Botão Continuar */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full h-14 rounded-full font-semibold text-white transition-all duration-300 active:scale-[0.98] mt-4 flex items-center justify-center gap-2 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ 
                transitionDelay: '550ms',
                background: isSubmitting ? "#86efac" : "#22c55e",
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif'
              }}
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
        </div>
      </div>
    </div>
  );
}

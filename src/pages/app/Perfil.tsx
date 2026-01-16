import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, HelpCircle, ChevronRight, LogOut, Pencil, Check, X, ShieldCheck, Star, History } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/contexts/I18nContext";
import { getUserProfile, saveUserProfile, UserProfile } from "@/lib/userProfile";
import { getUserStats, UserStats } from "@/lib/userStats";
import { getAvatarUrl } from "@/lib/avatarService";
import { AvatarPicker } from "@/components/profile/AvatarPicker";
import { Input } from "@/components/ui/input";

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
    ? (userProfile.fullName.trim().split(/\s+/)[0] || "Usuário")
    : "Usuário";

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
    const { error } = await saveUserProfile({ fullName: editedName.trim(), companyName: userProfile?.companyName || "" });
    setIsSavingName(false);

    if (error) {
      toast({
        title: t("common.error"),
        description: t("profile.nameUpdateError"),
        variant: "destructive",
      });
    } else {
      setUserProfile((prev) => prev ? { ...prev, fullName: editedName.trim() } : null);
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
      // Adicionar timestamp para evitar cache da imagem
      if (newUrl) {
        // Remover timestamp anterior se existir
        const cleanUrl = newUrl.split('?')[0].split('&')[0];
        const separator = cleanUrl.includes('?') ? '&' : '?';
        const urlWithTimestamp = `${cleanUrl}${separator}t=${Date.now()}`;
        setAvatarUrl(urlWithTimestamp);
      } else {
        setAvatarUrl(null);
      }
    } catch (error) {
      console.error("Erro ao atualizar avatar:", error);
    }
  };

  const handleViewCalculations = () => {
    navigate("/app/calculos");
  };

  const handleViewSaved = () => {
    navigate("/app/favoritos");
  };

  const handleViewHelp = () => {
    navigate("/app/ajuda");
  };

  // Sempre renderizar algo, mesmo durante loading (evita tela branca)
  return (
    <div 
      className="pb-24 space-y-8 bg-white min-h-screen min-h-[100dvh]"
      style={{
        paddingTop: "calc(env(safe-area-inset-top) + 1rem)"
      }}
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
          <div className="absolute inset-0 -m-2 border-2 border-emerald-500 rounded-full" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 60%, 0 60%)' }} />
          {isLoading ? (
            <div className="w-40 h-40 rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <div key={avatarUrl || 'no-avatar'}>
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
                <button onClick={handleSaveName} disabled={isSavingName} className="text-emerald-500"><Check size={20} /></button>
                <button onClick={handleCancelEdit} className="text-red-500"><X size={20} /></button>
              </div>
            ) : (
              <>
                <h2 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight cursor-pointer" onClick={() => setIsEditingName(true)}>
                  {firstName}, 28
                </h2>
                <ShieldCheck size={22} className="text-blue-500 fill-blue-500/20" />
              </>
            )}
          </div>
          <p className="text-[#8a8a8a] font-medium text-[15px]">{userProfile?.companyName || "Piloto de Drones"}</p>
        </div>
      </div>

      {/* Completion Status Card */}
      <div className="px-2">
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full border-4 border-emerald-500/20 flex items-center justify-center relative">
              <span className="text-[14px] font-bold text-emerald-600">60%</span>
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-emerald-500" strokeDasharray="150.79" strokeDashoffset="60.3" />
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
              <p className="text-[16px] font-bold text-[#1a1a1a]">{userStats?.totalCalculations || 0} {t("profile.calculations")}</p>
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
              <p className="text-[16px] font-bold text-[#1a1a1a]">{userStats?.savedCalculations || 0} {t("profile.saved")}</p>
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
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle,
  LogOut,
  ChevronRight,
  Camera,
  User as UserIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  {
    id: "notifications",
    icon: Bell,
    label: "Notificações",
    description: "Gerenciar alertas",
  },
  {
    id: "security",
    icon: Shield,
    label: "Segurança",
    description: "Senha e privacidade",
  },
  {
    id: "settings",
    icon: Settings,
    label: "Configurações",
    description: "Preferências do app",
  },
  {
    id: "help",
    icon: HelpCircle,
    label: "Ajuda",
    description: "Suporte e FAQ",
  },
];

export default function Perfil() {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleMenuClick = (itemId: string) => {
    toast({
      title: "Em breve",
      description: "Esta funcionalidade será implementada em breve.",
    });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
    toast({
      title: "Logout",
      description: "Você foi desconectado com sucesso.",
    });
    navigate("/welcome", { replace: true });
  };

  // Get user email or default
  const userEmail = user?.email || "usuario@exemplo.com";
  const userName = userEmail.split("@")[0] || "Usuário";

  return (
    <div className="space-y-6 pt-4 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-[20px] font-bold text-[#1a1a1a]">Meu Perfil</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col items-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80"
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md">
              <Camera size={14} className="text-white" />
            </button>
          </div>

          {/* Name & Email */}
          <h2 className="text-[18px] font-bold text-[#1a1a1a] mb-1 capitalize">{userName}</h2>
          <p className="text-[13px] text-[#8a8a8a] mb-4">{userEmail}</p>

          {/* Stats */}
          <div className="flex gap-8 pt-4 border-t border-gray-100 w-full justify-center">
            <div className="text-center">
              <p className="text-[20px] font-bold text-primary">24</p>
              <p className="text-[11px] text-[#8a8a8a]">Cálculos</p>
            </div>
            <div className="text-center">
              <p className="text-[20px] font-bold text-primary">8</p>
              <p className="text-[11px] text-[#8a8a8a]">Salvos</p>
            </div>
            <div className="text-center">
              <p className="text-[20px] font-bold text-primary">156</p>
              <p className="text-[11px] text-[#8a8a8a]">Hectares</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors",
                index !== menuItems.length - 1 && "border-b border-gray-100"
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Icon size={20} className="text-[#1a1a1a]" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[14px] font-medium text-[#1a1a1a]">{item.label}</p>
                <p className="text-[12px] text-[#8a8a8a]">{item.description}</p>
              </div>
              <ChevronRight size={18} className="text-[#8a8a8a]" />
            </button>
          );
        })}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 rounded-2xl text-red-600 font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        <LogOut size={18} />
        <span className="text-[14px]">{isLoggingOut ? "Saindo..." : "Sair da conta"}</span>
      </button>

      {/* Version */}
      <p className="text-center text-[11px] text-[#8a8a8a]">
        Calc v1.0.0 • Pulverização Agrícola
      </p>
    </div>
  );
}


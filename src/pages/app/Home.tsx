import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, Heart, Star, ArrowRight, Calculator, Droplets, Plane, Calendar, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, UserProfile } from "@/lib/userProfile";
import { getSavedCalculations, formatCalculationDate as formatDate, type SavedCalculationData } from "@/lib/favoritesService";
import { Operacoes } from "@/components/home/Operacoes";
import { Relatorios } from "@/components/home/Relatorios";
import { useToast } from "@/hooks/use-toast";
import { Avatar } from "@/components/profile/Avatar";
import { useNavigate } from "react-router-dom";
import dronePainelImg from "@/assets/drone painel 1.webp";
import droneSpray1 from "@/assets/drone-spray-1.png";
import droneSpray2 from "@/assets/drone-spray-2.png";
import droneTractor from "@/assets/drone-tractor.png";

const categories = ["Todos", "Cálculos", "Operações", "Relatórios"];

const quickActions = [
  {
    id: 1,
    title: "Calculadora de Calda",
    description: "Calcule a mistura ideal",
    icon: Calculator,
    path: "/app/calc",
    color: "bg-primary",
  },
  {
    id: 2,
    title: "Histórico",
    description: "Últimos cálculos",
    icon: Droplets,
    path: "/app/favoritos",
    color: "bg-blue-500",
  },
];

const featuredCard = {
  id: 1,
  title: "Pulverização Agrícola",
  subtitle: "Drones",
  image: dronePainelImg,
  rating: 5.0,
  reviews: 143,
  tag: "Novo",
};

// Galeria de imagens
const galleryImages = [
  { id: 1, src: droneSpray1, alt: "Drone pulverizando plantação de milho" },
  { id: 2, src: droneSpray2, alt: "Drone agrícola em ação" },
  { id: 3, src: droneTractor, alt: "Drone e trator no campo" },
];

export default function Home() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("Todos");
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Dados para filtros
  const [allCalculations, setAllCalculations] = useState<SavedCalculationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { profile } = await getUserProfile();
        if (profile) {
          setUserProfile(profile);
        }
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Remover category das dependências - não precisa recarregar quando muda categoria

  // Listener para recarregar quando um cálculo é salvo
  useEffect(() => {
    const handleCalculationSaved = () => {
      if (user) {
        loadData();
      }
    };

    window.addEventListener("calculationSaved", handleCalculationSaved);
    return () => {
      window.removeEventListener("calculationSaved", handleCalculationSaved);
    };
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Carregar cálculos
      const calculations = await getSavedCalculations();
      setAllCalculations(calculations);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get user name
  const userName = userProfile?.fullName || "Piloto";


  return (
    <div className="space-y-6 pt-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-[#1a1a1a]">Olá, {userName}</h1>
          <p className="text-[12px] text-[#8a8a8a]">Bem-vindo ao Calc</p>
        </div>
        <Avatar linkTo="/app/perfil" size="md" />
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8a8a]" />
          <input
            type="text"
            placeholder="Buscar receitas, cálculos..."
            className="w-full h-11 pl-10 pr-4 bg-white rounded-full text-[14px] text-[#1a1a1a] placeholder:text-[#8a8a8a] focus:outline-none shadow-sm"
          />
        </div>
        <button className="w-11 h-11 rounded-full bg-[#1a1a1a] flex items-center justify-center shadow-lg">
          <SlidersHorizontal size={16} className="text-white" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              to={action.path}
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", action.color)}>
                <Icon size={20} className="text-white" />
              </div>
              <h3 className="text-[14px] font-semibold text-[#1a1a1a]">{action.title}</h3>
              <p className="text-[12px] text-[#8a8a8a]">{action.description}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent Calculations - Mostrar apenas se categoria for "Todos" */}
      {category === "Todos" && <RecentCalculations />}

      {/* Section Title */}
      <h2 className="text-[15px] font-semibold text-[#1a1a1a] -mb-3">
        Categorias
      </h2>

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 py-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all",
              category === cat
                ? "bg-[#1a1a1a] text-white"
                : "bg-white text-[#1a1a1a] shadow-sm"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Conteúdo Filtrado */}
      {category === "Cálculos" && (
        <FilteredCalculations calculations={allCalculations.slice(0, 5)} isLoading={isLoading} />
      )}

      {category === "Operações" && (
        <Operacoes isLoading={isLoading} />
      )}

      {category === "Relatórios" && (
        <Relatorios isLoading={isLoading} />
      )}

      {/* Hero Card - Mostrar apenas se categoria for "Todos" */}
      {category === "Todos" && (
      <div className="relative rounded-[24px] overflow-hidden shadow-xl">
        {/* Background Image */}
        <div className="relative h-[240px]">
          <img
            src={featuredCard.image}
            alt={featuredCard.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Favorite Button */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg"
          >
            <Heart
              size={18}
              className={cn(
                "transition-colors",
                isFavorite ? "fill-red-500 text-red-500" : "text-[#1a1a1a]"
              )}
            />
          </button>

          {/* Drone Icon */}
          <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center">
            <Plane size={18} className="text-white" />
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Tag */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-[11px] font-medium rounded-full mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {featuredCard.tag}
            </span>

            {/* Title */}
            <h3 className="text-[22px] font-bold text-white mb-1.5">
              {featuredCard.title}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
                <Star size={10} className="text-yellow-400 fill-yellow-400" />
                <span className="text-[10px] font-semibold text-white">
                  {featuredCard.rating}
                </span>
              </div>
              <span className="text-[10px] text-white/80">
                {featuredCard.reviews} usuários
              </span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Link to="/app/calc" className="bg-[#1a1a1a] px-4 py-3 flex items-center justify-between">
          <span className="text-white text-[13px] font-medium">Abrir Calculadora</span>
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <ArrowRight size={16} className="text-white" />
          </div>
        </Link>
      </div>
      )}

      {/* Galeria de Imagens - Mostrar apenas se categoria for "Todos" */}
      {category === "Todos" && (
        <div className="space-y-3">
          <h2 className="text-[15px] font-semibold text-[#1a1a1a]">Galeria</h2>
          <div className="grid grid-cols-3 gap-2">
            {galleryImages.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para mostrar cálculos filtrados
function FilteredCalculations({ calculations, isLoading }: { calculations: SavedCalculationData[]; isLoading: boolean }) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-[#8a8a8a]">Carregando cálculos...</p>
      </div>
    );
  }

  if (calculations.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
        <Calculator size={32} className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-[#8a8a8a]">Nenhum cálculo encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-[#1a1a1a]">Cálculos</h2>
        <Link to="/app/calculos" className="text-[12px] text-green-600 font-medium">
          Ver todos
        </Link>
      </div>
      {calculations.map((calc) => (
        <div
          key={calc.id}
          onClick={() => navigate(`/app/favoritos/${calc.id}`)}
          className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <Calculator size={16} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#1a1a1a] truncate">
                  {calc.title}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Calendar size={10} className="text-[#8a8a8a]" />
                  <span className="text-[10px] text-[#8a8a8a]">
                    {formatDate(calc.timestamp)}
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight size={16} className="text-[#8a8a8a] flex-shrink-0 ml-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente para mostrar cálculos recentes
function RecentCalculations() {
  const navigate = useNavigate();
  const [recentCalculations, setRecentCalculations] = useState<SavedCalculationData[]>([]);

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const all = await getSavedCalculations();
        setRecentCalculations(all.slice(0, 3)); // Mostrar apenas os 3 mais recentes
      } catch (error) {
        console.error("Erro ao carregar cálculos recentes:", error);
      }
    };
    loadRecent();

    // Listener para recarregar quando um cálculo é salvo
    const handleCalculationSaved = () => {
      loadRecent();
    };

    window.addEventListener("calculationSaved", handleCalculationSaved);
    return () => {
      window.removeEventListener("calculationSaved", handleCalculationSaved);
    };
  }, []);

  if (recentCalculations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-[#1a1a1a]">Cálculos Recentes</h2>
        <Link to="/app/favoritos" className="text-[12px] text-green-600 font-medium">
          Ver todos
        </Link>
      </div>
      <div className="space-y-2">
        {recentCalculations.map((calc) => (
          <div
            key={calc.id}
            onClick={() => navigate(`/app/favoritos/${calc.id}`)}
            className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Calculator size={16} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#1a1a1a] truncate">
                    {calc.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Calendar size={10} className="text-[#8a8a8a]" />
                    <span className="text-[10px] text-[#8a8a8a]">
                      {formatDate(calc.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight size={14} className="text-[#8a8a8a] flex-shrink-0 ml-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


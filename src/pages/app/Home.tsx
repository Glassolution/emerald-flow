import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Bell, Star, ArrowRight, Calculator, Droplets, Plane, Calendar, ChevronRight, BookOpen, FlaskConical, Package, History, MoreVertical, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, UserProfile } from "@/lib/userProfile";
import { getSavedCalculations, formatCalculationDate as formatDate, type SavedCalculationData } from "@/lib/favoritesService";
import { getRecipes, type Recipe } from "@/lib/recipesService";
import { getAllProducts, type CatalogProduct } from "@/lib/productCatalogService";
import { Operacoes } from "@/components/home/Operacoes";
import { Relatorios } from "@/components/home/Relatorios";
import { Avatar } from "@/components/profile/Avatar";
import { useNavigate } from "react-router-dom";
import dronePainelImg from "@/assets/drone painel 1.webp";

const categories = ["Todos", "Cálculos", "Operações", "Relatórios"];

export default function Home() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("Todos");
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [search, setSearch] = useState("");
  const [allCalculations, setAllCalculations] = useState<SavedCalculationData[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [allProducts, setAllProducts] = useState<CatalogProduct[]>([]);
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
    loadData();
  }, [user]);

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
    setIsLoading(true);
    try {
      const products = await getAllProducts(user?.id || "");
      setAllProducts(products);

      if (user) {
        const [calculations, recipes] = await Promise.all([
          getSavedCalculations(),
          getRecipes(user.id),
        ]);
        setAllCalculations(calculations);
        setAllRecipes(recipes);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const userName = userProfile?.fullName?.split(" ")[0] || "Piloto";

  const filteredCalculations = allCalculations.filter((calc) =>
    calc.title.toLowerCase().includes(search.toLowerCase()) ||
    calc.input.products.some((p) => p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredRecipes = allRecipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(search.toLowerCase()) ||
    recipe.description?.toLowerCase().includes(search.toLowerCase()) ||
    recipe.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase())) ||
    recipe.products.some((p) => p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredProducts = allProducts.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.category.toLowerCase().includes(search.toLowerCase()) ||
    product.indication.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-7 pb-24 animate-fade-in bg-[#fdfdfd]">
      {/* Redesigned Header */}
      <div className="flex items-center justify-between pt-4 px-2">
        <div className="flex items-center gap-3">
          <Avatar linkTo="/app/perfil" size="md" />
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center relative">
            <Bell size={20} className="text-[#1a1a1a]" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center">
            <Star size={20} className="text-[#1a1a1a]" />
          </button>
        </div>
      </div>

      <div className="px-2">
        <p className="text-[18px] text-[#8a8a8a] font-medium">Olá,</p>
        <h1 className="text-[32px] font-bold text-[#1a1a1a] leading-tight">
          {userName}
        </h1>
      </div>

      {/* Redesigned Search Bar */}
      <div className="px-2">
        <div className="relative group">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8a8a8a] group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Clique para pesquisar..."
            className="w-full h-[60px] pl-14 pr-6 bg-[#f2f4f7] rounded-[24px] text-[16px] text-[#1a1a1a] placeholder:text-[#8a8a8a] focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all border-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Feature Cards - Side by Side Large Cards */}
      {!search && (
        <div className="grid grid-cols-2 gap-4 px-2">
          <Link
            to="/app/calc"
            className="bg-[#ffe7d4] rounded-[32px] p-6 h-[180px] flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/50 backdrop-blur-sm flex items-center justify-center">
              <Calculator size={24} className="text-[#1a1a1a]" />
            </div>
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-[17px] font-bold text-[#1a1a1a]">Calculadora</h3>
                <p className="text-[13px] text-[#1a1a1a]/60">Nova mistura</p>
              </div>
              <MoreVertical size={16} className="text-[#1a1a1a]/40 mb-1" />
            </div>
          </Link>

          <Link
            to="/app/favoritos"
            className="bg-[#e7e7ff] rounded-[32px] p-6 h-[180px] flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/50 backdrop-blur-sm flex items-center justify-center">
              <History size={24} className="text-[#1a1a1a]" />
            </div>
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-[17px] font-bold text-[#1a1a1a]">Histórico</h3>
                <p className="text-[13px] text-[#1a1a1a]/60">{allCalculations.length} Registros</p>
              </div>
              <MoreVertical size={16} className="text-[#1a1a1a]/40 mb-1" />
            </div>
          </Link>
        </div>
      )}

      {/* Measurement Style Cards for Inventory/Recipes */}
      {!search && (
        <div className="px-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[22px] font-bold text-[#1a1a1a]">Suas Atividades</h2>
            <button className="text-[#8a8a8a]">
              <LayoutGrid size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link to="/app/produtos" className="bg-[#f8faff] rounded-[28px] p-5 border border-gray-50 shadow-sm flex flex-col gap-4 active:scale-95 transition-all">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <Package size={16} className="text-blue-500" />
                </div>
                <span className="text-[13px] font-semibold text-[#1a1a1a]">Produtos</span>
              </div>
              <div>
                <span className="text-[24px] font-bold text-[#1a1a1a]">{allProducts.length}</span>
                <span className="text-[13px] text-[#8a8a8a] ml-1">itens</span>
              </div>
            </Link>

            <Link to="/app/receitas" className="bg-[#fffcf8] rounded-[28px] p-5 border border-gray-50 shadow-sm flex flex-col gap-4 active:scale-95 transition-all">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                  <FlaskConical size={16} className="text-orange-500" />
                </div>
                <span className="text-[13px] font-semibold text-[#1a1a1a]">Receitas</span>
              </div>
              <div>
                <span className="text-[24px] font-bold text-[#1a1a1a]">{allRecipes.length}</span>
                <span className="text-[13px] text-[#8a8a8a] ml-1">salvas</span>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Category Tabs & Content */}
      {!search && (
        <div className="px-2 space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-[14px] font-bold whitespace-nowrap transition-all",
                  category === cat
                    ? "bg-[#1a1a1a] text-white shadow-md"
                    : "bg-[#f2f4f7] text-[#8a8a8a]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="mt-2">
            {category === "Todos" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[20px] font-bold text-[#1a1a1a]">Últimos Cálculos</h2>
                  <Link to="/app/favoritos" className="text-[14px] font-semibold text-green-600">Ver todos</Link>
                </div>
                <RecentCalculations />
              </div>
            )}
            {category === "Cálculos" && (
              <FilteredCalculations calculations={allCalculations.slice(0, 10)} isLoading={isLoading} />
            )}
            {category === "Operações" && <Operacoes isLoading={isLoading} />}
            {category === "Relatórios" && <Relatorios isLoading={isLoading} />}
          </div>
        </div>
      )}

      {/* Active Search Results Overlay */}
      {search && (
        <div className="px-2">
          <SearchResults
            calculations={filteredCalculations}
            recipes={filteredRecipes}
            products={filteredProducts}
            isLoading={isLoading}
            searchTerm={search}
          />
        </div>
      )}

      {/* Featured Banner - Modern Style */}
      {!search && category === "Todos" && (
        <div className="px-2 pb-6">
          <div className="relative rounded-[32px] overflow-hidden shadow-xl group">
            <div className="relative h-[260px]">
              <img src={dronePainelImg} alt="Banner" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute top-6 left-6 flex gap-2">
                <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white text-[12px] font-bold border border-white/20">
                  Drones
                </div>
                <div className="px-3 py-1.5 bg-primary/80 backdrop-blur-md rounded-full text-white text-[12px] font-bold border border-white/10">
                  Novo
                </div>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-[26px] font-bold text-white mb-2 leading-tight">Pulverização Agrícola de Precisão</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-[14px] font-bold text-white">5.0</span>
                  </div>
                  <span className="text-[14px] text-white/70">143 pilotos ativos</span>
                </div>
              </div>
            </div>
            <Link to="/app/calc" className="bg-[#1a1a1a] px-6 py-4 flex items-center justify-between group-hover:bg-primary transition-colors">
              <span className="text-white text-[15px] font-bold tracking-wide uppercase">Começar Agora</span>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <ArrowRight size={20} className="text-white" />
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

interface SearchResultsProps {
  calculations: SavedCalculationData[];
  recipes: Recipe[];
  products: CatalogProduct[];
  isLoading: boolean;
  searchTerm: string;
}

function SearchResults({ calculations, recipes, products, isLoading, searchTerm }: SearchResultsProps) {
  const navigate = useNavigate();
  const totalResults = calculations.length + recipes.length + products.length;

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#8a8a8a] font-medium">Buscando...</p>
      </div>
    );
  }

  if (totalResults === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-[32px] border border-gray-50 shadow-sm">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search size={32} className="text-gray-300" />
        </div>
        <p className="text-[18px] font-bold text-[#1a1a1a] mb-1">Nenhum resultado</p>
        <p className="text-[14px] text-[#8a8a8a] px-8">
          Tente buscar por "{searchTerm}" com outros termos.
        </p>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      Herbicida: { bg: "bg-orange-100", text: "text-orange-600" },
      Inseticida: { bg: "bg-red-100", text: "text-red-600" },
      Fungicida: { bg: "bg-blue-100", text: "text-blue-600" },
      Fertilizante: { bg: "bg-emerald-100", text: "text-emerald-600" },
      Adjuvante: { bg: "bg-cyan-100", text: "text-cyan-600" },
    };
    return colors[category] || { bg: "bg-gray-100", text: "text-gray-600" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className="px-3 py-1 bg-primary/10 rounded-full">
          <span className="text-[13px] font-bold text-primary">
            {totalResults} RESULTADOS
          </span>
        </div>
        <span className="text-[13px] text-[#8a8a8a]">para "{searchTerm}"</span>
      </div>

      {products.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[#1a1a1a] uppercase tracking-wider">Produtos</h2>
            <Link to="/app/produtos" className="text-[12px] font-bold text-amber-600">VER TODOS</Link>
          </div>
          {products.slice(0, 3).map((product) => {
            const categoryColor = getCategoryColor(product.category);
            return (
              <div
                key={product.id}
                onClick={() => navigate("/app/produtos")}
                className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-50 cursor-pointer active:scale-95 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <Package size={20} className="text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-[#1a1a1a] truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", categoryColor.bg, categoryColor.text)}>
                          {product.category}
                        </span>
                        <span className="text-[11px] font-medium text-[#8a8a8a]">
                          {product.doseValue} {product.doseUnit}/ha
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[#8a8a8a]/40" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {recipes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[#1a1a1a] uppercase tracking-wider">Receitas</h2>
            <Link to="/app/receitas" className="text-[12px] font-bold text-purple-600">VER TODOS</Link>
          </div>
          {recipes.slice(0, 3).map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => navigate("/app/receitas")}
              className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-50 cursor-pointer active:scale-95 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={20} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-[#1a1a1a] truncate">{recipe.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-bold text-purple-600 bg-purple-100/50 px-2 py-0.5 rounded-full uppercase">
                        {recipe.products.length} PRODUTOS
                      </span>
                      {recipe.tags && recipe.tags.length > 0 && (
                        <span className="text-[11px] font-medium text-[#8a8a8a] truncate">
                          • {recipe.tags.slice(0, 2).join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#8a8a8a]/40" />
              </div>
            </div>
          ))}
        </div>
      )}

      {calculations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[#1a1a1a] uppercase tracking-wider">Cálculos</h2>
            <Link to="/app/calculos" className="text-[12px] font-bold text-green-600">VER TODOS</Link>
          </div>
          {calculations.slice(0, 3).map((calc) => (
            <div
              key={calc.id}
              onClick={() => navigate(`/app/favoritos/${calc.id}`)}
              className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-50 cursor-pointer active:scale-95 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Calculator size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-[#1a1a1a] truncate">{calc.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar size={12} className="text-[#8a8a8a]" />
                      <span className="text-[11px] font-medium text-[#8a8a8a]">{formatDate(calc.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#8a8a8a]/40" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilteredCalculations({ calculations, isLoading }: { calculations: SavedCalculationData[]; isLoading: boolean }) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-primary rounded-full animate-spin mx-auto mb-4" />
      </div>
    );
  }

  if (calculations.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-[32px] border border-gray-50 shadow-sm">
        <Calculator size={40} className="mx-auto text-gray-200 mb-3" />
        <p className="text-[#8a8a8a] font-medium">Nenhum cálculo encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {calculations.map((calc) => (
        <div
          key={calc.id}
          onClick={() => navigate(`/app/favoritos/${calc.id}`)}
          className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-50 cursor-pointer active:scale-95 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <Calculator size={20} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-[#1a1a1a] truncate">{calc.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar size={12} className="text-[#8a8a8a]" />
                  <span className="text-[11px] font-medium text-[#8a8a8a]">{formatDate(calc.timestamp)}</span>
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-[#8a8a8a]/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentCalculations() {
  const navigate = useNavigate();
  const [recentCalculations, setRecentCalculations] = useState<SavedCalculationData[]>([]);

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const all = await getSavedCalculations();
        setRecentCalculations(all.slice(0, 3));
      } catch (error) {
        console.error("Erro ao carregar cálculos recentes:", error);
      }
    };
    loadRecent();

    const handleCalculationSaved = () => loadRecent();
    window.addEventListener("calculationSaved", handleCalculationSaved);
    return () => window.removeEventListener("calculationSaved", handleCalculationSaved);
  }, []);

  if (recentCalculations.length === 0) return null;

  return (
    <div className="space-y-3">
      {recentCalculations.map((calc) => (
        <div
          key={calc.id}
          onClick={() => navigate(`/app/favoritos/${calc.id}`)}
          className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 cursor-pointer active:scale-95 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <Calculator size={20} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-[#1a1a1a] truncate">{calc.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar size={12} className="text-[#8a8a8a]" />
                  <span className="text-[11px] font-medium text-[#8a8a8a]">{formatDate(calc.timestamp)}</span>
                </div>
              </div>
            </div>
            <ChevronRight size={18} className="text-[#8a8a8a]/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

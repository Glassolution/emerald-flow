import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calculator, Trash2, Calendar, ChevronRight, Search, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  getSavedCalculations,
  deleteCalculation,
  formatCalculationDate,
  type SavedCalculationData 
} from "@/lib/favoritesService";
import { useAuth } from "@/contexts/AuthContext";

export default function Calculos() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [calculations, setCalculations] = useState<SavedCalculationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user) {
      loadCalculations();
    }
  }, [user]);

  // Listener para recarregar quando um cálculo é salvo
  useEffect(() => {
    const handleCalculationSaved = () => {
      if (user) {
        loadCalculations();
      }
    };

    window.addEventListener("calculationSaved", handleCalculationSaved);
    return () => {
      window.removeEventListener("calculationSaved", handleCalculationSaved);
    };
  }, [user]);

  const loadCalculations = async () => {
    setIsLoading(true);
    try {
      const allCalculations = await getSavedCalculations();
      console.log("📊 [Calculos] Cálculos carregados:", allCalculations.length);
      setCalculations(allCalculations);
    } catch (error) {
      console.error("❌ [Calculos] Erro ao carregar:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar cálculos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm("Tem certeza que deseja excluir este cálculo?")) {
      const { error } = await deleteCalculation(id);
      
      if (error) {
        toast({
          title: "Erro",
          description: error.message || "Erro ao excluir cálculo.",
          variant: "destructive",
        });
      } else {
        loadCalculations();
        toast({
          title: "Excluído",
          description: "Cálculo removido com sucesso.",
        });
      }
    }
  };

  const handleCardClick = (id: string) => {
    navigate(`/app/favoritos/${id}`);
  };

  const filteredCalculations = calculations.filter((calc) =>
    calc.title.toLowerCase().includes(search.toLowerCase()) ||
    calc.input.products.some((p) => p.name.toLowerCase().includes(search.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center animate-fade-in pt-4">
        <div className="w-12 h-12 border-2 border-gray-300 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm text-[#8a8a8a]">Carregando cálculos...</p>
      </div>
    );
  }

  if (calculations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center animate-fade-in pt-4">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
          <Calculator size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">Nenhum cálculo ainda</h2>
        <p className="text-sm text-[#8a8a8a] max-w-[250px]">
          Faça cálculos na calculadora para vê-los aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-[#1a1a1a]">Cálculos</h1>
          <p className="text-[12px] text-[#8a8a8a]">
            {filteredCalculations.length} de {calculations.length} cálculo{calculations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={loadCalculations}
          disabled={isLoading}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
          title="Recarregar"
        >
          <RefreshCw size={18} className={cn("text-gray-600", isLoading && "animate-spin")} />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar cálculos..."
          className="w-full h-11 pl-10 pr-4 bg-white rounded-full text-[14px] text-[#1a1a1a] placeholder:text-[#8a8a8a] focus:outline-none shadow-sm border border-gray-100"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Calculations List */}
      <div className="space-y-3">
        {filteredCalculations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-[#8a8a8a]">Nenhum cálculo encontrado com essa busca.</p>
          </div>
        ) : (
          filteredCalculations.map((calc) => (
            <div
              key={calc.id}
              onClick={() => handleCardClick(calc.id)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all active:scale-[0.98]"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Calculator size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-semibold text-[#1a1a1a] truncate">
                      {calc.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Calendar size={12} className="text-[#8a8a8a] flex-shrink-0" />
                      <span className="text-[11px] text-[#8a8a8a]">
                        {formatCalculationDate(calc.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => handleDelete(calc.id, e)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Trash2 size={14} className="text-gray-600" />
                  </button>
                  <ChevronRight size={18} className="text-[#8a8a8a]" />
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-[11px] text-[#8a8a8a] mb-1">Área</p>
                  <p className="text-[13px] font-semibold text-[#1a1a1a]">
                    {calc.input.areaHa.toFixed(2)} ha
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#8a8a8a] mb-1">Volume Total</p>
                  <p className="text-[13px] font-semibold text-[#1a1a1a]">
                    {calc.result.volumeTotalL.toFixed(1)} L
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#8a8a8a] mb-1">Tanques</p>
                  <p className="text-[13px] font-semibold text-[#1a1a1a]">
                    {calc.result.numeroTanques} tanque{calc.result.numeroTanques !== 1 ? 's' : ''}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#8a8a8a] mb-1">Produtos</p>
                  <p className="text-[13px] font-semibold text-[#1a1a1a]">
                    {calc.input.products.length} produto{calc.input.products.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


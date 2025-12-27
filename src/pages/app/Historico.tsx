import { useState, useEffect } from "react";
import { Heart, Calculator, Trash2, Calendar, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { 
  getSavedCalculations, 
  toggleFavorite, 
  deleteCalculation,
  formatCalculationDate,
  type SavedCalculation 
} from "@/lib/calcHistory";

export default function Historico() {
  const { toast } = useToast();
  const [calculations, setCalculations] = useState<SavedCalculation[]>([]);
  const [filter, setFilter] = useState<"all" | "favorites">("all");

  useEffect(() => {
    loadCalculations();
  }, [filter]);

  const loadCalculations = () => {
    const all = getSavedCalculations();
    if (filter === "favorites") {
      setCalculations(all.filter(calc => calc.isFavorite));
    } else {
      setCalculations(all);
    }
  };

  const handleToggleFavorite = (id: string) => {
    const calc = calculations.find(c => c.id === id);
    const newFavoriteStatus = !calc?.isFavorite;
    const success = toggleFavorite(id, newFavoriteStatus);
    if (success) {
      loadCalculations();
      toast({
        title: newFavoriteStatus ? "Adicionado aos favoritos" : "Removido dos favoritos",
        description: newFavoriteStatus 
          ? "Cálculo adicionado aos favoritos" 
          : "Cálculo removido dos favoritos",
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este cálculo?")) {
      const success = deleteCalculation(id);
      if (success) {
        loadCalculations();
        toast({
          title: "Excluído",
          description: "Cálculo excluído com sucesso",
        });
      }
    }
  };

  return (
    <div className="space-y-4 pt-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-[#1a1a1a]">Histórico</h1>
          <p className="text-[12px] text-[#8a8a8a]">{calculations.length} cálculo{calculations.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "px-4 py-2 rounded-full text-[13px] font-medium transition-all",
            filter === "all"
              ? "bg-[#1a1a1a] text-white"
              : "bg-white text-[#1a1a1a] shadow-sm"
          )}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter("favorites")}
          className={cn(
            "px-4 py-2 rounded-full text-[13px] font-medium transition-all flex items-center gap-1.5",
            filter === "favorites"
              ? "bg-[#1a1a1a] text-white"
              : "bg-white text-[#1a1a1a] shadow-sm"
          )}
        >
          <Heart size={14} className={filter === "favorites" ? "fill-white" : ""} />
          Favoritos
        </button>
      </div>

      {/* Calculations List */}
      {calculations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Calculator size={32} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">
            {filter === "favorites" ? "Nenhum favorito" : "Nenhum cálculo salvo"}
          </h2>
          <p className="text-sm text-[#8a8a8a] max-w-[250px]">
            {filter === "favorites" 
              ? "Favorite cálculos para vê-los aqui."
              : "Salve cálculos para vê-los aqui."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {calculations.map((calc) => (
            <div
              key={calc.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <Calculator size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-semibold text-[#1a1a1a] truncate">
                      {calc.name || `Cálculo - ${calc.input.areaHa} ha`}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Calendar size={12} className="text-[#8a8a8a]" />
                      <span className="text-[11px] text-[#8a8a8a]">
                        {formatCalculationDate(calc.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleFavorite(calc.id)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                      calc.isFavorite
                        ? "bg-red-50 hover:bg-red-100"
                        : "bg-gray-100 hover:bg-gray-200"
                    )}
                  >
                    <Heart 
                      size={16} 
                      className={cn(
                        calc.isFavorite ? "text-red-500 fill-red-500" : "text-gray-600"
                      )} 
                    />
                  </button>
                  <button
                    onClick={() => handleDelete(calc.id)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Trash2 size={14} className="text-gray-600" />
                  </button>
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
          ))}
        </div>
      )}
    </div>
  );
}




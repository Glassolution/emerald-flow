import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { History, Calculator, Trash2, Calendar, Eye, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/I18nContext";
import { 
  getSavedCalculations,
  deleteCalculation,
  formatCalculationDate,
  type SavedCalculationData 
} from "@/lib/favoritesService";

export default function Favoritos() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const [calculations, setCalculations] = useState<SavedCalculationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar cálculos ao montar o componente (não depende do user)
  useEffect(() => {
    loadFavorites();
  }, []);

  // Recarregar quando user mudar
  useEffect(() => {
    loadFavorites();
  }, [user]);

  // Listener para recarregar quando um cálculo é salvo
  useEffect(() => {
    const handleCalculationSaved = () => {
      console.log("📢 [Histórico] Evento calculationSaved recebido");
      loadFavorites();
    };

    window.addEventListener("calculationSaved", handleCalculationSaved);
    return () => {
      window.removeEventListener("calculationSaved", handleCalculationSaved);
    };
  }, []);

  const loadFavorites = async () => {
    console.log("🔄 [Histórico] Iniciando carregamento...");
    setIsLoading(true);
    try {
      const favorites = await getSavedCalculations();
      console.log("📊 [Histórico] Cálculos carregados:", favorites.length, favorites);
      setCalculations(favorites);
    } catch (error) {
      console.error("❌ [Histórico] Erro ao carregar:", error);
      toast({
        title: t('common.error'),
        description: t('favorites.errorLoading'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar navegar ao clicar no botão de deletar
    
    if (confirm(t('favorites.deleteConfirm'))) {
      const { error } = await deleteCalculation(id);
      
      if (error) {
        toast({
          title: t('common.error'),
          description: error.message || t('common.error'),
          variant: "destructive",
        });
      } else {
        loadFavorites();
        toast({
          title: t('favorites.removed'),
          description: t('favorites.removedDesc'),
        });
      }
    }
  };

  const handleCardClick = (id: string) => {
    navigate(`/app/favoritos/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center animate-fade-in pt-4">
        <div className="w-12 h-12 border-2 border-gray-300 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm text-[#8a8a8a]">{t('favorites.loading')}</p>
      </div>
    );
  }

  if (calculations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center animate-fade-in pt-4">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
          <History size={32} className="text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">{t('favorites.noCalculations')}</h2>
        <p className="text-sm text-[#8a8a8a] max-w-[250px]">
          {t('favorites.savedAppearHere')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-[#1a1a1a]">{t('favorites.history')}</h1>
          <p className="text-[12px] text-[#8a8a8a]">{calculations.length} {calculations.length !== 1 ? t('favorites.calculationsSaved') : t('favorites.calculationSaved')}</p>
        </div>
        <button
          onClick={loadFavorites}
          disabled={isLoading}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
          title={t('favorites.reload')}
        >
          <RefreshCw size={18} className={cn("text-gray-600", isLoading && "animate-spin")} />
        </button>
      </div>

      {/* Calculations List */}
      <div className="space-y-3">
        {calculations.map((calc) => (
          <div
            key={calc.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all"
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
              <button
                onClick={(e) => handleDelete(calc.id, e)}
                className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors"
                title={t('common.delete')}
              >
                <Trash2 size={14} className="text-red-500" />
              </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
              <div>
                <p className="text-[11px] text-[#8a8a8a] mb-1">{t('favorites.area')}</p>
                <p className="text-[13px] font-semibold text-[#1a1a1a]">
                  {calc.input.areaHa.toFixed(2)} ha
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#8a8a8a] mb-1">{t('favorites.totalVolume')}</p>
                <p className="text-[13px] font-semibold text-[#1a1a1a]">
                  {calc.result.volumeTotalL.toFixed(1)} L
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#8a8a8a] mb-1">{t('favorites.tanks')}</p>
                <p className="text-[13px] font-semibold text-[#1a1a1a]">
                  {calc.result.numeroTanques} {calc.result.numeroTanques !== 1 ? t('calc.flights') : t('calc.flight')}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#8a8a8a] mb-1">{t('favorites.products')}</p>
                <p className="text-[13px] font-semibold text-[#1a1a1a]">
                  {calc.input.products.length} {calc.input.products.length !== 1 ? t('favorites.products').toLowerCase() : t('calc.product').toLowerCase()}
                </p>
              </div>
            </div>

            {/* Botão Visualizar */}
            <Button
              onClick={() => handleCardClick(calc.id)}
              className="w-full mt-4 h-11 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold"
            >
              <Eye size={18} className="mr-2" />
              {t('favorites.view')}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

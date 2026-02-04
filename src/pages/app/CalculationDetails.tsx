/**
 * Tela de Detalhes do Cálculo Salvo
 * Mostra todos os dados do cálculo de forma didática
 */

import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calculator, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { getSavedCalculations, deleteCalculation, formatCalculationDate, type SavedCalculationData } from "@/lib/favoritesService";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/contexts/I18nContext";

export default function CalculationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useI18n();
  const [calculation, setCalculation] = useState<SavedCalculationData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadCalculation = async () => {
      if (!id) {
        navigate("/app/favoritos", { replace: true });
        return;
      }

      const calculations = await getSavedCalculations();
      const found = calculations.find((calc) => calc.id === id);

      if (!found) {
        toast({
          title: t('calculationDetails.notFound'),
          description: t('calculationDetails.notFoundDesc'),
          variant: "destructive",
        });
        navigate("/app/favoritos", { replace: true });
        return;
      }

      setCalculation(found);
    };

    loadCalculation();
  }, [id, navigate, toast, t]);

  const handleDelete = async () => {
    if (!calculation || !confirm(t('favorites.deleteConfirm'))) {
      return;
    }

    setIsDeleting(true);
    const { error } = await deleteCalculation(calculation.id);

    setIsDeleting(false);

    if (error) {
      toast({
        title: t('common.error'),
        description: error.message || t('favorites.errorLoading'),
        variant: "destructive",
      });
    } else {
      toast({
        title: t('favorites.removed'),
        description: t('favorites.removedDesc'),
      });
      navigate("/app/favoritos", { replace: true });
    }
  };

  const handleRefazer = () => {
    if (!calculation) return;
    
    // Navegar para calculadora com dados pré-preenchidos (opcional)
    navigate("/app/calc", { 
      state: { 
        restoreCalculation: {
          areaHa: calculation.input.areaHa,
          taxaLHa: calculation.input.taxaLHa,
          volumeTanqueL: calculation.input.volumeTanqueL,
          products: calculation.input.products,
        }
      }
    });
  };

  if (!calculation) {
    return (
      <div className="pt-4 pb-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  const { input, result } = calculation;

  // Gerar texto final
  const gerarTextoFinal = (): string => {
    const linhasProdutos = result.produtos.map(
      (p) => t('calculationDetails.productLine', { amount: p.produtoPorTanque, unit: p.unit, name: p.nome })
    );

    return t('calculationDetails.finalResultText', { products: linhasProdutos.join("\n"), volume: input.volumeTanqueL });
  };

  return (
    <div className="pt-4 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/app/favoritos")}
          className="h-10 w-10"
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1">
          <h1 className="text-[20px] font-bold text-foreground">{t('calculationDetails.title')}</h1>
          <p className="text-[12px] text-muted-foreground">
            {formatCalculationDate(calculation.timestamp)}
          </p>
        </div>
      </div>

      {/* Título do Cálculo */}
      <Card className="p-4 mb-6 bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Calculator size={20} className="text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-[16px] font-semibold text-foreground">{calculation.title}</h2>
            <p className="text-[12px] text-muted-foreground">
              {formatCalculationDate(calculation.timestamp)}
            </p>
          </div>
        </div>
      </Card>

      {/* Dados do Cálculo */}
      <Card className="p-5 bg-black text-white mb-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 size={20} className="text-green-500" />
          <h3 className="text-[18px] font-bold text-white">{t('calculationDetails.result')}</h3>
        </div>

        <div className="space-y-4">
          {/* PASSO 1 */}
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-[11px] uppercase tracking-wide text-white/70 mb-1">
              {t('calculationDetails.step1')}
            </p>
            <p className="text-[24px] font-bold text-white">{result.volumeTotalL} L</p>
            <p className="text-[11px] text-white/70 mt-1">
              {input.areaHa} ha × {input.taxaLHa} L/ha = {result.volumeTotalL} L
            </p>
          </div>

          {/* PASSO 2 */}
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-[11px] uppercase tracking-wide text-white/70 mb-1">
              {t('calculationDetails.step2')}
            </p>
            <p className="text-[24px] font-bold text-white">{result.numeroTanques} {t('favorites.tanks')}</p>
            <p className="text-[11px] text-white/70 mt-1">
              {result.volumeTotalL} L ÷ {input.volumeTanqueL} L = {result.numeroTanques} {t('favorites.tanks')}
            </p>
          </div>

          {/* PASSO 3 e 4 — Produtos */}
          {result.produtos.map((produto, idx) => (
            <div key={idx} className="bg-white/5 rounded-xl p-4">
              <p className="text-[13px] font-semibold mb-3 text-white">{produto.nome}</p>

              <div className="space-y-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-white/70 mb-1">
                    {t('calculationDetails.step3')}
                  </p>
                  <p className="text-[20px] font-bold text-white">
                    {produto.totalProduto} {produto.unit}
                  </p>
                  <p className="text-[11px] text-white/70 mt-1">
                    {input.areaHa} ha × {produto.doseHa} {produto.unit}/ha = {produto.totalProduto} {produto.unit}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/20">
                  <p className="text-[11px] uppercase tracking-wide text-white/70 mb-1">
                    {t('calculationDetails.step4')}
                  </p>
                  <p className="text-[24px] font-bold text-green-500">
                    {produto.produtoPorTanque} {produto.unit}
                  </p>
                  <p className="text-[11px] text-white/70 mt-1">
                    {produto.totalProduto} {produto.unit} ÷ {result.numeroTanques} = {produto.produtoPorTanque} {produto.unit}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo Final */}
        <div className="mt-6 pt-4 border-t border-white/20">
          <p className="text-[11px] uppercase tracking-wide text-white/70 mb-2">
            {t('calculationDetails.finalResult')}
          </p>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
            <p className="text-[13px] text-white whitespace-pre-line leading-relaxed">
              {gerarTextoFinal()}
            </p>
          </div>
        </div>
      </Card>

      {/* Ações */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          onClick={handleRefazer}
          className="w-full gap-2 border-primary/20 hover:bg-primary/5 text-primary"
        >
          <RotateCcw size={18} />
          {t('calculationDetails.redo')}
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-full gap-2"
        >
          <Trash2 size={18} />
          {isDeleting ? t('calculationDetails.deleting') : t('calculationDetails.deleteFromFavorites')}
        </Button>
      </div>
    </div>
  );
}

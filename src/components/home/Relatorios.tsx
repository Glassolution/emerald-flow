import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, DollarSign, Calculator, Receipt } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getOperations } from "@/lib/operationsService";
import { getSavedCalculations } from "@/lib/favoritesService";
import { formatCurrency } from "@/lib/currencyUtils";
import type { Operation } from "@/types/operation";
import type { SavedCalculationData } from "@/lib/favoritesService";
import { Card } from "@/components/ui/card";

interface RelatoriosProps {
  isLoading: boolean;
}

interface ReportData {
  totalOperacoes: number;
  mediaAreaPulverizada: number;
  totalReceita: number;
  ticketMedio: number;
  totalCalculos: number;
}

export function Relatorios({ isLoading: parentLoading }: RelatoriosProps) {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && !parentLoading) {
      loadReportData();
    }
  }, [user, parentLoading]);

  // Listener para recarregar quando uma operação é salva
  useEffect(() => {
    const handleOperationSaved = () => {
      if (user) {
        loadReportData();
      }
    };

    window.addEventListener("operationSaved", handleOperationSaved);
    return () => {
      window.removeEventListener("operationSaved", handleOperationSaved);
    };
  }, [user]);

  const loadReportData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Carregar operações e cálculos
      const [operations, calculations] = await Promise.all([
        getOperations(user.id),
        getSavedCalculations(),
      ]);

      // Calcular estatísticas
      const totalOperacoes = operations.length;
      const totalCalculos = calculations.length;
      
      // Calcular média de área pulverizada
      const somaArea = operations.reduce((sum, op) => sum + op.area_ha, 0);
      const mediaAreaPulverizada = totalOperacoes > 0 ? somaArea / totalOperacoes : 0;

      // Calcular total de receita (soma de todos os valores cobrados)
      const totalReceita = operations.reduce((sum, op) => sum + (op.price_charged || 0), 0);

      // Calcular ticket médio (receita total / número de operações)
      const ticketMedio = totalOperacoes > 0 ? totalReceita / totalOperacoes : 0;

      setReportData({
        totalOperacoes,
        mediaAreaPulverizada,
        totalReceita,
        ticketMedio,
        totalCalculos,
      });
    } catch (error) {
      console.error("Erro ao carregar dados do relatório:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || parentLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-[#8a8a8a]">Carregando relatórios...</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
        <BarChart3 size={32} className="mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-[#8a8a8a]">Nenhum dado disponível para relatório.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-[#1a1a1a]">Relatórios</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Card: Total de Operações */}
        <Card className="p-4 bg-white border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Calculator size={20} className="text-green-600" />
            </div>
          </div>
          <p className="text-[11px] text-[#8a8a8a] mb-1">Total de Operações</p>
          <p className="text-[20px] font-bold text-[#1a1a1a]">
            {reportData.totalOperacoes}
          </p>
        </Card>

        {/* Card: Total de Cálculos */}
        <Card className="p-4 bg-white border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <BarChart3 size={20} className="text-blue-600" />
            </div>
          </div>
          <p className="text-[11px] text-[#8a8a8a] mb-1">Total de Cálculos</p>
          <p className="text-[20px] font-bold text-[#1a1a1a]">
            {reportData.totalCalculos}
          </p>
        </Card>

        {/* Card: Média de Área */}
        <Card className="p-4 bg-white border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <TrendingUp size={20} className="text-purple-600" />
            </div>
          </div>
          <p className="text-[11px] text-[#8a8a8a] mb-1">Média de Área (ha)</p>
          <p className="text-[20px] font-bold text-[#1a1a1a]">
            {reportData.mediaAreaPulverizada.toFixed(2)}
          </p>
        </Card>

        {/* Card: Total de Receita */}
        <Card className="p-4 bg-white border border-gray-100 col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Receipt size={20} className="text-green-600" />
            </div>
          </div>
          <p className="text-[11px] text-[#8a8a8a] mb-1">Total de Receita</p>
          <p className="text-[24px] font-bold text-green-600">
            {formatCurrency(reportData.totalReceita)}
          </p>
        </Card>

        {/* Card: Ticket Médio */}
        <Card className="p-4 bg-white border border-gray-100 col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
              <DollarSign size={20} className="text-yellow-600" />
            </div>
          </div>
          <p className="text-[11px] text-[#8a8a8a] mb-1">Ticket Médio</p>
          <p className="text-[24px] font-bold text-[#1a1a1a]">
            {formatCurrency(reportData.ticketMedio)}
          </p>
        </Card>
      </div>
    </div>
  );
}


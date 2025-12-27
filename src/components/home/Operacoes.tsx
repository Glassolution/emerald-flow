import { useState, useEffect } from "react";
import { Plus, Trash2, Calendar, ChevronRight, Crop, RefreshCw, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getOperations,
  deleteOperation,
  formatOperationDate,
  type Operation 
} from "@/lib/operationsService";
import { Button } from "@/components/ui/button";
import { NewOperationModal } from "@/components/operations/NewOperationModal";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface OperacoesProps {
  isLoading: boolean;
}

export function Operacoes({ isLoading: parentLoading }: OperacoesProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    if (user && !parentLoading) {
      loadOperations();
    }
  }, [user, parentLoading]);

  // Listener para recarregar quando uma operação é salva
  useEffect(() => {
    const handleOperationSaved = async () => {
      console.log("🔄 [Operacoes] Evento operationSaved recebido, recarregando...");
      if (user) {
        // Aguardar um pouco para garantir que o salvamento foi concluído
        await new Promise(resolve => setTimeout(resolve, 300));
        await loadOperations();
      }
    };

    window.addEventListener("operationSaved", handleOperationSaved);
    return () => {
      window.removeEventListener("operationSaved", handleOperationSaved);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadOperations = async () => {
    if (!user) {
      console.warn("⚠️ [Operacoes] Usuário não autenticado, não é possível carregar operações");
      return;
    }
    setIsLoading(true);
    try {
      console.log("🔄 [Operacoes] Carregando operações para userId:", user.id);
      const allOperations = await getOperations(user.id);
      console.log("✅ [Operacoes] Operações carregadas:", {
        total: allOperations.length,
        operations: allOperations.map(op => ({
          id: op.id,
          name: op.operation_name || op.farm_name,
          client: op.client_name,
          crop: op.crop,
          date: op.date,
        }))
      });
      setOperations(allOperations);
      
      // Log adicional para debug
      if (allOperations.length === 0) {
        console.log("ℹ️ [Operacoes] Nenhuma operação encontrada. Verificando localStorage...");
        const storageKey = `calc_operations_${user.id}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log("📦 [Operacoes] Dados encontrados no localStorage:", parsed.length, parsed);
        } else {
          console.log("📦 [Operacoes] Nenhum dado no localStorage");
        }
      }
    } catch (error) {
      console.error("❌ [Operacoes] Erro ao carregar operações:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar operações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm("Tem certeza que deseja excluir esta operação?")) {
      if (!user) return;
      const { error } = await deleteOperation(user.id, id);
      
      if (error) {
        toast({
          title: "Erro",
          description: error.message || "Erro ao excluir operação.",
          variant: "destructive",
        });
      } else {
        loadOperations();
        toast({
          title: "Excluído",
          description: "Operação removida com sucesso.",
        });
      }
    }
  };

  const handleOperationSaved = async () => {
    console.log("✅ [Operacoes] Callback onSave chamado, fechando modal e recarregando...");
    setAddModalOpen(false);
    // Aguardar um pouco para garantir que o salvamento foi concluído
    await new Promise(resolve => setTimeout(resolve, 200));
    await loadOperations();
  };

  if (isLoading || parentLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-[#8a8a8a]">Carregando operações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-[#1a1a1a]">Operações</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={loadOperations}
            disabled={isLoading}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
            title="Recarregar"
          >
            <RefreshCw size={16} className={cn("text-gray-600", isLoading && "animate-spin")} />
          </button>
          <Button
            onClick={() => setAddModalOpen(true)}
            size="sm"
            className="h-9 bg-green-500 text-white hover:bg-green-600 text-[12px]"
          >
            <Plus size={14} className="mr-1" />
            Nova Operação
          </Button>
        </div>
      </div>

      {operations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Crop size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-[#8a8a8a]">Nenhuma operação encontrada.</p>
          <Button
            onClick={() => setAddModalOpen(true)}
            className="mt-4 bg-green-500 hover:bg-green-600"
            size="sm"
          >
            <Plus size={16} className="mr-2" />
            Criar primeira operação
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {operations.map((operation) => (
            <div
              key={operation.id}
              className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate(`/app/operacoes/${operation.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Crop size={16} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#1a1a1a] truncate">
                      {operation.operation_name || operation.farm_name || "Operação sem nome"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[11px] text-[#8a8a8a]">
                        {operation.client_name || operation.farm_name}
                      </span>
                      <span className="text-[11px] text-[#8a8a8a]">•</span>
                      <span className="text-[11px] text-[#8a8a8a]">{operation.crop}</span>
                      <span className="text-[11px] text-[#8a8a8a]">•</span>
                      <span className="text-[11px] text-[#8a8a8a]">{operation.area_ha.toFixed(2)} ha</span>
                      <span className="text-[11px] text-[#8a8a8a]">•</span>
                      <div className="flex items-center gap-1">
                        <Calendar size={10} className="text-[#8a8a8a]" />
                        <span className="text-[11px] text-[#8a8a8a]">
                          {formatOperationDate(operation.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(operation.id, e);
                  }}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0 ml-2"
                >
                  <Trash2 size={14} className="text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Profissional de Nova Operação */}
      <NewOperationModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleOperationSaved}
      />
    </div>
  );
}


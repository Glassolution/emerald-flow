import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, MapPin, Sprout, Package, Plane, CheckCircle2, Clock, Trash2, Eye, Search, Filter, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { 
  getOperations,
  deleteOperation,
  formatOperationDate,
  type Operation 
} from "@/lib/operationsService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currencyUtils";
import { NewOperationModal } from "@/components/operations/NewOperationModal";

export default function OperacoesPage() {
  const { toast } = useToast();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "planned" | "completed">("all");
  const [isNewOperationModalOpen, setIsNewOperationModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadOperations();
    }
  }, [user]);

  // Listener para recarregar quando uma operação é salva
  useEffect(() => {
    const handleOperationSaved = () => {
      if (user) {
        loadOperations();
      }
    };

    window.addEventListener("operationSaved", handleOperationSaved);
    return () => {
      window.removeEventListener("operationSaved", handleOperationSaved);
    };
  }, [user]);

  const loadOperations = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const allOperations = await getOperations(user.id);
      setOperations(allOperations);
    } catch (error) {
      console.error("Erro ao carregar operações:", error);
      toast({
        title: t("common.error"),
        description: t("operations.errorLoading"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    if (confirm(t("operations.deleteConfirm"))) {
      const { error } = await deleteOperation(user.id, id);
      if (error) {
        toast({
          title: t("common.error"),
          description: error.message || t("operations.errorDeleting"),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("common.success"),
          description: t("operations.deleted"),
        });
        loadOperations();
      }
    }
  };

  const filteredOperations = operations.filter((op) => {
    const matchesSearch = 
      (op.operation_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (op.client_name || op.farm_name || "").toLowerCase().includes(search.toLowerCase()) ||
      op.farm_name.toLowerCase().includes(search.toLowerCase()) ||
      op.field_name.toLowerCase().includes(search.toLowerCase()) ||
      op.crop.toLowerCase().includes(search.toLowerCase()) ||
      (op.target_pest || op.target || "").toLowerCase().includes(search.toLowerCase()) ||
      op.product_name.toLowerCase().includes(search.toLowerCase()) ||
      (op.location || "").toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || op.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-[#8a8a8a]">{t("operations.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-[#1a1a1a]">{t("operations.title")}</h1>
          <p className="text-[12px] text-[#8a8a8a]">{t("operations.subtitle")}</p>
        </div>
        <Button
          onClick={() => setIsNewOperationModalOpen(true)}
          className="h-10 bg-green-500 text-white hover:bg-green-600 text-[13px] font-semibold rounded-full px-4"
        >
          <Plus size={16} className="mr-2" />
          {t("operations.newOperation")}
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8a8a]" />
          <Input
            placeholder={t("operations.searchPlaceholder")}
            className="pl-10 h-11 rounded-full bg-white text-[14px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 py-1">
          {(["all", "planned", "completed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-2 rounded-full text-[12px] font-medium whitespace-nowrap transition-all",
                statusFilter === status
                  ? "bg-[#1a1a1a] text-white"
                  : "bg-white text-[#1a1a1a] shadow-sm"
              )}
            >
              {status === "all" && t("operations.status.all")}
              {status === "planned" && t("operations.status.planned")}
              {status === "completed" && t("operations.status.completed")}
            </button>
          ))}
        </div>
      </div>

      {/* Operations List */}
      {filteredOperations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Package size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-[#8a8a8a]">
            {search || statusFilter !== "all" 
              ? t("operations.noOperations")
              : t("operations.noOperationsYet")}
          </p>
          {!search && statusFilter === "all" && (
            <Button
              onClick={() => setIsNewOperationModalOpen(true)}
              className="mt-4 bg-green-500 text-white hover:bg-green-600"
            >
              <Plus size={16} className="mr-2" />
              {t("operations.createFirst")}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOperations.map((operation) => (
            <div
              key={operation.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate(`/app/operacoes/${operation.id}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-semibold text-[#1a1a1a] truncate">
                        {operation.operation_name || operation.farm_name}
                      </h3>
                      <p className="text-[12px] text-[#8a8a8a] truncate">
                        {operation.client_name || operation.farm_name} • {operation.field_name} • {operation.crop}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "ml-2 flex-shrink-0",
                        operation.status === "completed"
                          ? "bg-green-50 text-green-600 border-green-200"
                          : "bg-yellow-50 text-yellow-600 border-yellow-200"
                      )}
                    >
                      {operation.status === "completed" ? (
                        <>
                          <CheckCircle2 size={12} className="mr-1" />
                          {t("operations.completed")}
                        </>
                      ) : (
                        <>
                          <Clock size={12} className="mr-1" />
                          {t("operations.planned")}
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="flex items-center gap-1.5">
                      <Package size={12} className="text-[#8a8a8a]" />
                      <span className="text-[11px] text-[#8a8a8a] truncate">
                        {operation.product_name || t("calc.product")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-[#8a8a8a]" />
                      <span className="text-[11px] text-[#8a8a8a]">
                        {operation.area_ha.toFixed(2)} ha
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Plane size={12} className="text-[#8a8a8a]" />
                      <span className="text-[11px] text-[#8a8a8a] truncate">
                        {operation.drone_model || "Drone"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-[#8a8a8a]" />
                      <span className="text-[11px] text-[#8a8a8a]">
                        {formatOperationDate(operation.date)}
                      </span>
                    </div>
                  </div>

                  {/* Valor Cobrado */}
                  {operation.price_charged !== undefined && operation.price_charged > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <DollarSign size={14} className="text-green-600" />
                          <span className="text-[11px] text-[#8a8a8a]">Valor Cobrado</span>
                        </div>
                        <span className="text-[14px] font-semibold text-green-600">
                          {formatCurrency(operation.price_charged)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Target */}
                  {operation.target && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-[10px] bg-gray-50">
                        <Sprout size={10} className="mr-1" />
                        {operation.target}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/app/operacoes/${operation.id}`);
                    }}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    title={t("favorites.view")}
                  >
                    <Eye size={14} className="text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(operation.id, e)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors"
                    title={t("common.delete")}
                  >
                    <Trash2 size={14} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Operation Modal */}
      <NewOperationModal
        open={isNewOperationModalOpen}
        onClose={() => setIsNewOperationModalOpen(false)}
        onSave={() => {
          setIsNewOperationModalOpen(false);
          loadOperations();
        }}
      />
    </div>
  );
}


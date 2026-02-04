import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Sprout, Package, Plane, CheckCircle2, Clock, Trash2, Edit, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { 
  getOperations,
  deleteOperation,
  formatOperationDate,
  type Operation 
} from "@/lib/operationsService";
import { formatCurrency } from "@/lib/currencyUtils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function OperationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useI18n();
  const [operation, setOperation] = useState<Operation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      loadOperation();
    }
  }, [id, user]);

  const loadOperation = async () => {
    if (!id || !user) return;
    setIsLoading(true);
    try {
      const operations = await getOperations(user.id);
      const found = operations.find((op) => op.id === id);
      if (found) {
        setOperation(found);
      } else {
        toast({
          title: t("operations.notFound"),
          description: t("operations.notFoundDesc"),
          variant: "destructive",
        });
        navigate("/app/operacoes", { replace: true });
      }
    } catch (error) {
      console.error("Erro ao carregar operação:", error);
      toast({
        title: t("common.error"),
        description: t("operations.errorLoading"),
        variant: "destructive",
      });
      navigate("/app/operacoes", { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!operation || !user) return;

    if (confirm(t("operations.deleteConfirm"))) {
      const { error } = await deleteOperation(user.id, operation.id);
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
        navigate("/app/operacoes", { replace: true });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-[#8a8a8a]">{t("operations.loadingOne")}</p>
        </div>
      </div>
    );
  }

  if (!operation) {
    return null;
  }

  return (
    <div className="space-y-6 pt-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/app/operacoes")}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-[20px] font-bold text-[#1a1a1a]">{t("operations.detailsTitle")}</h1>
            <p className="text-[12px] text-[#8a8a8a]">{operation.farm_name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="h-9 text-[12px]"
          >
            <Trash2 size={14} className="mr-1" />
            {t("operations.delete")}
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex justify-center">
        <Badge
          variant="outline"
          className={cn(
            "px-4 py-2 text-[13px]",
            operation.status === "completed"
              ? "bg-green-50 text-green-600 border-green-200"
              : "bg-yellow-50 text-yellow-600 border-yellow-200"
          )}
        >
          {operation.status === "completed" ? (
            <>
              <CheckCircle2 size={14} className="mr-2" />
              {t("operations.completed")}
            </>
          ) : (
            <>
              <Clock size={14} className="mr-2" />
              {t("operations.planned")}
            </>
          )}
        </Badge>
      </div>

      {/* Main Info Card */}
      <Card className="p-5 space-y-4">
        {/* Farm and Field */}
          <div>
            <h2 className="text-[16px] font-semibold text-[#1a1a1a] mb-3">{t("operations.generalInfo")}</h2>
            <div className="space-y-3">
              {operation.operation_name && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-[12px] text-[#8a8a8a] mb-0.5">{t("operations.name")}</p>
                    <p className="text-[14px] font-medium text-[#1a1a1a]">{operation.operation_name}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[12px] text-[#8a8a8a] mb-0.5">{t("operations.clientFarm")}</p>
                  <p className="text-[14px] font-medium text-[#1a1a1a]">
                    {operation.client_name || operation.farm_name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[12px] text-[#8a8a8a] mb-0.5">{t("operations.field")}</p>
                  <p className="text-[14px] font-medium text-[#1a1a1a]">{operation.field_name}</p>
                </div>
              </div>
              {operation.location && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-[12px] text-[#8a8a8a] mb-0.5">{t("operations.location")}</p>
                    <p className="text-[14px] font-medium text-[#1a1a1a]">{operation.location}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Sprout size={18} className="text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[12px] text-[#8a8a8a] mb-0.5">{t("operations.crop")}</p>
                  <p className="text-[14px] font-medium text-[#1a1a1a]">{operation.crop}</p>
                </div>
              </div>
              {(operation.target_pest || operation.target) && (
                <div className="flex items-start gap-3">
                  <Sprout size={18} className="text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-[12px] text-[#8a8a8a] mb-0.5">{t("operations.target")}</p>
                    <p className="text-[14px] font-medium text-[#1a1a1a]">
                      {operation.target_pest || operation.target}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[12px] text-[#8a8a8a] mb-0.5">{t("operations.date")}</p>
                  <p className="text-[14px] font-medium text-[#1a1a1a]">
                    {formatOperationDate(operation.date)}
                  </p>
                </div>
              </div>
            </div>
          </div>
      </Card>

      {/* Product and Application Card */}
      <Card className="p-5 space-y-4">
        <h2 className="text-[16px] font-semibold text-[#1a1a1a] mb-3">{t("operations.productAndApplication")}</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Package size={18} className="text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-[12px] text-[#8a8a8a] mb-0.5">{t("operations.product")}</p>
              <p className="text-[14px] font-medium text-[#1a1a1a]">{operation.product_name}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[12px] text-[#8a8a8a] mb-1">{t("operations.area")}</p>
              <p className="text-[14px] font-medium text-[#1a1a1a]">{operation.area_ha.toFixed(2)} ha</p>
            </div>
            <div>
              <p className="text-[12px] text-[#8a8a8a] mb-1">{t("operations.dose")}</p>
              <p className="text-[14px] font-medium text-[#1a1a1a]">
                {operation.dose_value} {operation.dose_unit}
              </p>
            </div>
            <div>
              <p className="text-[12px] text-[#8a8a8a] mb-1">{t("operations.volumePerHa")}</p>
              <p className="text-[14px] font-medium text-[#1a1a1a]">{operation.volume_l_ha} L/ha</p>
            </div>
            <div>
              <p className="text-[12px] text-[#8a8a8a] mb-1">{t("operations.drone")}</p>
              <p className="text-[14px] font-medium text-[#1a1a1a]">{operation.drone_model}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Calculations Card */}
      {(operation.total_volume_l || operation.total_product_quantity) && (
        <Card className="p-5 space-y-4 bg-green-50 border-green-200">
          <h2 className="text-[16px] font-semibold text-[#1a1a1a] mb-3">{t("operations.automaticCalculations")}</h2>
          <div className="grid grid-cols-2 gap-4">
            {operation.total_volume_l && (
              <div className="bg-white rounded-lg p-3">
                <p className="text-[11px] text-[#8a8a8a] mb-1">{t("operations.totalSprayVolume")}</p>
                <p className="text-[18px] font-bold text-green-600">
                  {operation.total_volume_l.toFixed(2)} L
                </p>
              </div>
            )}
            {operation.total_product_quantity && (
              <div className="bg-white rounded-lg p-3">
                <p className="text-[11px] text-[#8a8a8a] mb-1">{t("operations.totalProductQuantity")}</p>
                <p className="text-[18px] font-bold text-green-600">
                  {operation.total_product_quantity.toFixed(2)} {operation.dose_unit}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Back Button */}
      <Button
        onClick={() => navigate("/app/operacoes")}
        variant="outline"
        className="w-full h-12 text-[14px] font-semibold rounded-full"
      >
        <ArrowLeft size={16} className="mr-2" />
        {t("operations.backToOperations")}
      </Button>
    </div>
  );
}


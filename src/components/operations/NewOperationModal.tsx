import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { saveOperation, type OperationFormData } from "@/lib/operationsService";
import { getAllProducts } from "@/lib/productCatalogService";
import type { CatalogProduct } from "@/types/product";
import { Package, Search, MapPin, Sprout, Calculator, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewOperationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

const commonCrops = ["Soja", "Milho", "Algodão", "Café", "Cana-de-açúcar", "Trigo", "Outro"];
const commonTargets = [
  "Lagarta",
  "Ferrugem Asiática",
  "Mato Resistente",
  "Pulgão",
  "Ácaro",
  "Mosca-branca",
  "Outro",
];
const commonDrones = [
  "DJI Agras T40",
  "DJI Agras T30",
  "DJI Agras T20",
  "DJI Phantom 4",
  "DJI Mavic 3",
  "Outro",
];

export function NewOperationModal({ open, onClose, onSave }: NewOperationModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);

  // Identificação da Operação
  const [operationName, setOperationName] = useState("");
  const [clientName, setClientName] = useState("");
  const [farmName, setFarmName] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [location, setLocation] = useState("");

  // Informações Agrícolas
  const [crop, setCrop] = useState("");
  const [customCrop, setCustomCrop] = useState("");
  const [targetPest, setTargetPest] = useState("");
  const [customTarget, setCustomTarget] = useState("");
  const [productName, setProductName] = useState("");
  const [productId, setProductId] = useState<string | undefined>(undefined);

  // Dados Operacionais
  const [areaHa, setAreaHa] = useState("");
  const [doseValue, setDoseValue] = useState("");
  const [doseUnit, setDoseUnit] = useState("mL/ha");
  const [volumeLHa, setVolumeLHa] = useState("");
  const [droneModel, setDroneModel] = useState("");
  const [customDrone, setCustomDrone] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Dados Financeiros
  const [priceCharged, setPriceCharged] = useState("");

  // Status
  const [status, setStatus] = useState<"planned" | "completed">("planned");

  // Load products when modal opens
  useEffect(() => {
    if (open && user) {
      loadProducts();
    }
  }, [open, user]);

  const loadProducts = async () => {
    if (!user) return;
    try {
      const allProducts = await getAllProducts(user.id);
      setProducts(allProducts);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleSelectProduct = (product: CatalogProduct) => {
    setSelectedProduct(product);
    setProductName(product.name);
    setProductId(product.id);
    setDoseValue(product.doseValue.toString());
    setDoseUnit(product.doseUnit);
    setProductSearch("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    // Validações - Identificação
    if (!operationName.trim()) {
      toast({
        title: "Erro",
        description: "Digite o nome da operação.",
        variant: "destructive",
      });
      return;
    }

    if (!clientName.trim()) {
      toast({
        title: "Erro",
        description: "Digite o nome do cliente/fazenda.",
        variant: "destructive",
      });
      return;
    }

    if (!farmName.trim()) {
      toast({
        title: "Erro",
        description: "Digite o nome da fazenda.",
        variant: "destructive",
      });
      return;
    }

    if (!fieldName.trim()) {
      toast({
        title: "Erro",
        description: "Digite o talhão/área específica.",
        variant: "destructive",
      });
      return;
    }

    // Validações - Agrícolas
    const finalCrop = crop === "Outro" ? customCrop.trim() : crop;
    if (!finalCrop) {
      toast({
        title: "Erro",
        description: "Selecione ou digite o tipo de cultura.",
        variant: "destructive",
      });
      return;
    }

    const finalTarget = targetPest === "Outro" ? customTarget.trim() : targetPest;
    if (!finalTarget) {
      toast({
        title: "Erro",
        description: "Selecione ou digite a praga/doença alvo.",
        variant: "destructive",
      });
      return;
    }

    if (!productName.trim()) {
      toast({
        title: "Erro",
        description: "Selecione um produto.",
        variant: "destructive",
      });
      return;
    }

    // Validações - Operacionais
    const area = parseFloat(areaHa);
    if (isNaN(area) || area <= 0) {
      toast({
        title: "Erro",
        description: "Área deve ser um número maior que zero.",
        variant: "destructive",
      });
      return;
    }

    const dose = parseFloat(doseValue);
    if (isNaN(dose) || dose <= 0) {
      toast({
        title: "Erro",
        description: "Dose deve ser um número maior que zero.",
        variant: "destructive",
      });
      return;
    }

    const volume = parseFloat(volumeLHa);
    if (isNaN(volume) || volume <= 0) {
      toast({
        title: "Erro",
        description: "Volume de aplicação deve ser um número maior que zero.",
        variant: "destructive",
      });
      return;
    }

    // Validações - Financeiros
    const price = parseFloat(priceCharged);
    if (isNaN(price) || price < 0) {
      toast({
        title: "Erro",
        description: "Valor cobrado deve ser um número maior ou igual a zero.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const operationData: OperationFormData = {
      // Identificação
      operation_name: operationName.trim(),
      client_name: clientName.trim(),
      farm_name: farmName.trim(),
      field_name: fieldName.trim(),
      location: location.trim() || undefined,
      // Agrícolas
      crop: finalCrop,
      target_pest: finalTarget,
      product_name: productName.trim(),
      product_id: productId,
      // Operacionais
      area_ha: area,
      dose_value: dose,
      dose_unit: doseUnit,
      volume_l_ha: volume,
      drone_model: droneModel ? (droneModel === "Outro" ? customDrone.trim() : droneModel) : undefined,
      date: date,
      status,
      // Financeiros
      price_charged: price,
    };

    const { id, error } = await saveOperation(user.id, operationData);

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar operação.",
        variant: "destructive",
      });
    } else if (id) {
      console.log("✅ [NewOperationModal] Operação salva com sucesso, ID:", id);
      
      // Reset form primeiro
      setOperationName("");
      setClientName("");
      setFarmName("");
      setFieldName("");
      setLocation("");
      setCrop("");
      setCustomCrop("");
      setTargetPest("");
      setCustomTarget("");
      setProductName("");
      setProductId(undefined);
      setSelectedProduct(null);
      setAreaHa("");
      setDoseValue("");
      setDoseUnit("mL/ha");
      setVolumeLHa("");
      setDroneModel("");
      setCustomDrone("");
      setDate(new Date().toISOString().split('T')[0]);
      setStatus("planned");
      setPriceCharged("");
      setProductSearch("");
      
      // Disparar evento primeiro (antes de fechar modal)
      console.log("📢 [NewOperationModal] Disparando evento operationSaved");
      window.dispatchEvent(new CustomEvent("operationSaved"));
      
      // Fechar modal e chamar callback (com delay para garantir que o evento foi processado)
      setTimeout(() => {
        onSave();
      }, 200);
      
      toast({
        title: "Sucesso",
        description: "Operação registrada com sucesso!",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-bold">Nova Operação</DialogTitle>
          <DialogDescription className="text-[13px]">
            Registro técnico completo de pulverização agrícola
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Seção: Identificação da Operação */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <MapPin size={16} className="text-green-600" />
              <h3 className="text-[14px] font-semibold text-[#1a1a1a]">Identificação da Operação</h3>
            </div>

            <div>
              <Label htmlFor="operation_name" className="text-[13px] font-medium mb-2 block">
                Nome da Operação *
              </Label>
              <Input
                id="operation_name"
                placeholder="Ex: Pulverização Soja – Talhão 03"
                value={operationName}
                onChange={(e) => setOperationName(e.target.value)}
                className="h-10 text-[14px]"
                required
              />
            </div>

            <div>
              <Label htmlFor="client_name" className="text-[13px] font-medium mb-2 block">
                Nome do Cliente / Fazenda *
              </Label>
              <Input
                id="client_name"
                placeholder="Ex: Fazenda Boa Vista / João Silva"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="h-10 text-[14px]"
                required
              />
            </div>

            <div>
              <Label htmlFor="farm_name" className="text-[13px] font-medium mb-2 block">
                Nome da Fazenda *
              </Label>
              <Input
                id="farm_name"
                placeholder="Ex: Fazenda Boa Vista"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="h-10 text-[14px]"
                required
              />
            </div>

            <div>
              <Label htmlFor="field_name" className="text-[13px] font-medium mb-2 block">
                Talhão / Área Específica *
              </Label>
              <Input
                id="field_name"
                placeholder="Ex: Talhão 3 • Área Norte • Lote A"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                className="h-10 text-[14px]"
                required
              />
            </div>

            <div>
              <Label htmlFor="location" className="text-[13px] font-medium mb-2 block">
                Localidade (Cidade / Estado)
              </Label>
              <Input
                id="location"
                placeholder="Ex: Sorriso - MT"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-10 text-[14px]"
              />
            </div>
          </div>

          {/* Seção: Informações Agrícolas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Sprout size={16} className="text-green-600" />
              <h3 className="text-[14px] font-semibold text-[#1a1a1a]">Informações Agrícolas</h3>
            </div>

            <div>
              <Label htmlFor="crop" className="text-[13px] font-medium mb-2 block">
                Tipo de Cultura *
              </Label>
              <Select value={crop} onValueChange={setCrop} required>
                <SelectTrigger className="h-10 text-[14px]">
                  <SelectValue placeholder="Ex: Soja, Milho, Algodão" />
                </SelectTrigger>
                <SelectContent>
                  {commonCrops.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {crop === "Outro" && (
                <Input
                  placeholder="Digite o tipo de cultura"
                  value={customCrop}
                  onChange={(e) => setCustomCrop(e.target.value)}
                  className="h-10 text-[14px] mt-2"
                  required
                />
              )}
            </div>

            <div>
              <Label htmlFor="target_pest" className="text-[13px] font-medium mb-2 block">
                Praga / Doença Alvo *
              </Label>
              <Select value={targetPest} onValueChange={setTargetPest} required>
                <SelectTrigger className="h-10 text-[14px]">
                  <SelectValue placeholder="Selecione o alvo" />
                </SelectTrigger>
                <SelectContent>
                  {commonTargets.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {targetPest === "Outro" && (
                <Input
                  placeholder="Digite a praga/doença"
                  value={customTarget}
                  onChange={(e) => setCustomTarget(e.target.value)}
                  className="h-10 text-[14px] mt-2"
                  required
                />
              )}
            </div>

            <div>
              <Label htmlFor="product" className="text-[13px] font-medium mb-2 block">
                Produto Aplicado *
              </Label>
              {!selectedProduct ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Buscar produto no catálogo..."
                      className="pl-10 h-10 text-[14px]"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </div>
                  {productSearch && (
                    <div className="max-h-40 overflow-y-auto border rounded-lg bg-white">
                      {filteredProducts.length === 0 ? (
                        <div className="p-3 text-center text-sm text-gray-500">
                          Nenhum produto encontrado
                        </div>
                      ) : (
                        filteredProducts.slice(0, 5).map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => handleSelectProduct(product)}
                            className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0 flex items-center gap-2"
                          >
                            <Package size={16} className="text-gray-400" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium truncate">{product.name}</p>
                              <p className="text-[11px] text-gray-500">
                                {product.doseValue} {product.doseUnit}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{selectedProduct.name}</p>
                    <p className="text-[11px] text-gray-600">
                      {selectedProduct.doseValue} {selectedProduct.doseUnit}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(null);
                      setProductName("");
                      setProductId(undefined);
                      setDoseValue("");
                      setDoseUnit("mL/ha");
                    }}
                    className="h-8 text-[12px]"
                  >
                    Trocar
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Seção: Dados Operacionais */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Calculator size={16} className="text-green-600" />
              <h3 className="text-[14px] font-semibold text-[#1a1a1a]">Dados Operacionais</h3>
            </div>

            <div>
              <Label htmlFor="area_ha" className="text-[13px] font-medium mb-2 block">
                Área aplicada (ha) *
              </Label>
              <Input
                id="area_ha"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 12.5"
                value={areaHa}
                onChange={(e) => setAreaHa(e.target.value)}
                className="h-10 text-[14px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dose_value" className="text-[12px] font-medium mb-1 block">
                  Dose do Produto *
                </Label>
                <Input
                  id="dose_value"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="200"
                  value={doseValue}
                  onChange={(e) => setDoseValue(e.target.value)}
                  className="h-10 text-[14px]"
                  required
                />
              </div>
              <div>
                <Label htmlFor="dose_unit" className="text-[12px] font-medium mb-1 block">
                  Unidade
                </Label>
                <Select value={doseUnit} onValueChange={setDoseUnit}>
                  <SelectTrigger className="h-10 text-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mL/ha">mL/ha</SelectItem>
                    <SelectItem value="L/ha">L/ha</SelectItem>
                    <SelectItem value="g/ha">g/ha</SelectItem>
                    <SelectItem value="kg/ha">kg/ha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="volume_l_ha" className="text-[13px] font-medium mb-2 block">
                Volume de Aplicação (L/ha) *
              </Label>
              <Input
                id="volume_l_ha"
                type="number"
                step="0.1"
                min="0"
                placeholder="Ex: 12"
                value={volumeLHa}
                onChange={(e) => setVolumeLHa(e.target.value)}
                className="h-10 text-[14px]"
                required
              />
            </div>

            <div>
              <Label htmlFor="drone_model" className="text-[13px] font-medium mb-2 block">
                Drone Utilizado
              </Label>
              <Select value={droneModel} onValueChange={setDroneModel}>
                <SelectTrigger className="h-10 text-[14px]">
                  <SelectValue placeholder="Selecione o drone (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {commonDrones.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {droneModel === "Outro" && (
                <Input
                  placeholder="Digite o modelo do drone"
                  value={customDrone}
                  onChange={(e) => setCustomDrone(e.target.value)}
                  className="h-10 text-[14px] mt-2"
                />
              )}
            </div>

            <div>
              <Label htmlFor="date" className="text-[13px] font-medium mb-2 block">
                Data da Operação *
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 text-[14px]"
                required
              />
            </div>
          </div>

          {/* Seção: Dados Financeiros */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <DollarSign size={16} className="text-green-600" />
              <h3 className="text-[14px] font-semibold text-[#1a1a1a]">Dados Financeiros</h3>
            </div>

            <div>
              <Label htmlFor="price_charged" className="text-[13px] font-medium mb-2 block">
                Valor Cobrado pela Operação (R$) *
              </Label>
              <Input
                id="price_charged"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 2400.00"
                value={priceCharged}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^\d*\.?\d*$/.test(value)) {
                    setPriceCharged(value);
                  }
                }}
                className="h-10 text-[14px]"
                required
              />
              <p className="text-[11px] text-[#8a8a8a] mt-1">
                Valor total cobrado por esta operação
              </p>
            </div>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status" className="text-[13px] font-medium mb-2 block">
              Status *
            </Label>
            <Select value={status} onValueChange={(v) => setStatus(v as "planned" | "completed")}>
              <SelectTrigger className="h-10 text-[14px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planejada</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-500 hover:bg-green-600 h-11 text-[14px] font-semibold"
            >
              {isSubmitting ? "Salvando..." : "Registrar Operação"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 text-[14px]"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

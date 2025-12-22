import { useState } from "react";
import { Calculator, Plus, Trash2, Save, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  calculateCalda,
  formatNumber,
  type CalculationInput,
  type CalculationResult,
  type Product,
  type DoseMode,
  type ProductUnit,
} from "@/lib/calcUtils";

export default function Calc() {
  const { toast } = useToast();
  
  // Estados dos campos principais
  const [areaHa, setAreaHa] = useState<string>("");
  const [applicationRate, setApplicationRate] = useState<string>("");
  const [tankVolume, setTankVolume] = useState<string>("");
  
  // Estados dos produtos
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Produto 1",
      dose: 0,
      unit: "mL",
      mode: "por_ha",
    },
  ]);
  
  // Estado de erros
  const [errors, setErrors] = useState<{ fieldErrors?: any; messages?: string[] } | null>(null);
  
  // Estado do resultado
  const [result, setResult] = useState<CalculationResult | null>(null);
  
  // Estado de arredondamento
  const [roundDecimals, setRoundDecimals] = useState<boolean>(true);

  // Adicionar novo produto
  const addProduct = () => {
    setProducts([
      ...products,
      {
        id: Date.now().toString(),
        name: `Produto ${products.length + 1}`,
        dose: 0,
        unit: "mL",
        mode: "por_ha",
      },
    ]);
  };

  // Remover produto
  const removeProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter((p, idx) => (p.id || idx.toString()) !== id));
    }
  };

  // Atualizar produto
  const updateProduct = (id: string, field: keyof Product, value: any) => {
    setProducts(
      products.map((p, idx) => {
        const productId = p.id || idx.toString();
        return productId === id ? { ...p, [field]: value } : p;
      })
    );
  };

  // Calcular
  const handleCalculate = () => {
    const area = parseFloat(areaHa);
    const rate = parseFloat(applicationRate);
    const tank = parseFloat(tankVolume);

    const input: CalculationInput = {
      areaHa: area,
      taxaLHa: rate,
      volumeTanqueL: tank,
      products,
    };

    const calculation = calculateCalda(input);
    
    if (calculation.result) {
      let result = calculation.result;
      
      // Aplicar arredondamento se necessário
      if (roundDecimals) {
        result = {
          ...result,
          volumeTotalL: formatNumber(result.volumeTotalL),
          volumesPorTanque: result.volumesPorTanque.map(v => formatNumber(v)),
          produtosPorTanque: result.produtosPorTanque.map(tank => ({
            ...tank,
            volume: formatNumber(tank.volume),
            products: tank.products.map(p => ({
              ...p,
              quantity: formatNumber(p.quantity),
            })),
          })),
          produtosTotal: result.produtosTotal.map(p => ({
            ...p,
            totalQuantity: formatNumber(p.totalQuantity),
          })),
        };
      }
      
      setResult(result);
      setErrors(null);
    } else {
      setErrors(calculation.errors);
      setResult(null);
      
      // Mostrar toast com erros
      const errorMessages = calculation.errors?.messages || [];
      if (errorMessages.length > 0) {
        toast({
          title: "Erro de validação",
          description: errorMessages.join(", "),
          variant: "destructive",
        });
      }
    }
  };

  // Limpar campos
  const handleClear = () => {
    setAreaHa("");
    setApplicationRate("");
    setTankVolume("");
    setProducts([
      {
        id: "1",
        name: "Produto 1",
        dose: 0,
        unit: "mL",
        mode: "por_ha",
      },
    ]);
    setResult(null);
    setErrors(null);
  };

  // Salvar cálculo
  const handleSave = () => {
    if (!result) {
      toast({
        title: "Erro",
        description: "Calcule primeiro antes de salvar",
        variant: "destructive",
      });
      return;
    }

    // Salvar no localStorage
    const saved = localStorage.getItem("calc_history");
    const history = saved ? JSON.parse(saved) : [];
    
    const calculationToSave = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      input: {
        areaHa: parseFloat(areaHa),
        taxaLHa: parseFloat(applicationRate),
        volumeTanqueL: parseFloat(tankVolume),
        products,
      },
      result,
    };

    history.unshift(calculationToSave);
    // Manter apenas os últimos 50
    const limitedHistory = history.slice(0, 50);
    localStorage.setItem("calc_history", JSON.stringify(limitedHistory));

    toast({
      title: "Salvo!",
      description: "Cálculo salvo com sucesso",
    });
  };

  return (
    <div className="pt-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <Calculator size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-[20px] font-bold text-[#1a1a1a]">Calculadora de Calda</h1>
          <p className="text-[12px] text-[#8a8a8a]">Pulverização com drones</p>
        </div>
      </div>

      {/* Campos principais */}
      <div className="space-y-4 mb-6">
        <div>
          <Label htmlFor="area" className="text-[13px] font-medium text-[#1a1a1a] mb-2 block">
            Área a aplicar (ha)
          </Label>
          <Input
            id="area"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={areaHa}
            onChange={(e) => setAreaHa(e.target.value)}
            className="h-12 rounded-2xl bg-white border-transparent text-[14px]"
          />
        </div>

        <div>
          <Label htmlFor="rate" className="text-[13px] font-medium text-[#1a1a1a] mb-2 block">
            Taxa de aplicação (L/ha)
          </Label>
          <Input
            id="rate"
            type="number"
            step="0.1"
            placeholder="0.0"
            value={applicationRate}
            onChange={(e) => setApplicationRate(e.target.value)}
            className="h-12 rounded-2xl bg-white border-transparent text-[14px]"
          />
        </div>

        <div>
          <Label htmlFor="tank" className="text-[13px] font-medium text-[#1a1a1a] mb-2 block">
            Volume do tanque (L)
          </Label>
          <Input
            id="tank"
            type="number"
            step="0.1"
            placeholder="0.0"
            value={tankVolume}
            onChange={(e) => setTankVolume(e.target.value)}
            className="h-12 rounded-2xl bg-white border-transparent text-[14px]"
          />
        </div>
      </div>

      {/* Produtos */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-[#1a1a1a]">Produtos</h2>
          <Button
            onClick={addProduct}
            size="sm"
            variant="outline"
            className="h-8 text-[12px]"
          >
            <Plus size={14} className="mr-1" />
            Adicionar
          </Button>
        </div>

        <div className="space-y-4">
          {products.map((product, index) => (
            <Card key={product.id || index} className="p-4 bg-white border-0 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-[13px] font-medium text-[#1a1a1a]">
                  {product.name || `Produto ${index + 1}`}
                </Label>
                {products.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => removeProduct(product.id || index.toString())}
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-[11px] text-[#8a8a8a] mb-1 block">Modo de dose</Label>
                  <Select
                    value={product.mode}
                    onValueChange={(value: DoseMode) =>
                      updateProduct(product.id || index.toString(), "mode", value)
                    }
                  >
                    <SelectTrigger className="h-10 rounded-xl bg-[#f5f5f5] border-transparent text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="por_ha">Por hectare</SelectItem>
                      <SelectItem value="por_volume">Por volume</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-[11px] text-[#8a8a8a] mb-1 block">
                    Dose {product.mode === "por_ha" ? "(por ha)" : "(por L)"}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={product.dose || ""}
                    onChange={(e) =>
                      updateProduct(product.id || index.toString(), "dose", parseFloat(e.target.value) || 0)
                    }
                    className="h-10 rounded-xl bg-[#f5f5f5] border-transparent text-[13px]"
                  />
                </div>

                <div>
                  <Label className="text-[11px] text-[#8a8a8a] mb-1 block">Unidade</Label>
                  <Select
                    value={product.unit}
                    onValueChange={(value: ProductUnit) =>
                      updateProduct(product.id || index.toString(), "unit", value)
                    }
                  >
                    <SelectTrigger className="h-10 rounded-xl bg-[#f5f5f5] border-transparent text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mL">mL</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Mensagens de erro */}
      {errors && errors.messages && errors.messages.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <div className="flex items-start gap-2">
            <AlertCircle size={18} className="text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-red-800 mb-1">Erros encontrados:</p>
              <ul className="list-disc list-inside space-y-1">
                {errors.messages.map((msg, idx) => (
                  <li key={idx} className="text-[12px] text-red-700">{msg}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Opções */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="round"
            checked={roundDecimals}
            onChange={(e) => setRoundDecimals(e.target.checked)}
            className="w-4 h-4 rounded border-[#1a1a1a]"
          />
          <Label htmlFor="round" className="text-[12px] text-[#8a8a8a]">
            Arredondar valores (2 casas decimais)
          </Label>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="space-y-3 mb-6">
        <Button
          onClick={handleCalculate}
          className="w-full h-12 bg-primary text-white text-[14px] font-semibold rounded-full"
        >
          Calcular
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleClear}
            variant="outline"
            className="h-12 bg-white text-[#1a1a1a] text-[14px] font-semibold rounded-full border-0 shadow-sm"
          >
            <RotateCcw size={16} className="mr-2" />
            Novo
          </Button>
          <Button
            onClick={handleSave}
            variant="outline"
            className="h-12 bg-white text-[#1a1a1a] text-[14px] font-semibold rounded-full border-0 shadow-sm"
            disabled={!result}
          >
            <Save size={16} className="mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Resultado */}
      {result && (
        <Card className="p-5 bg-[#1a1a1a] text-white mb-6">
          <h3 className="text-[18px] font-bold mb-4">Resultado</h3>

          <div className="space-y-4">
            <div>
              <p className="text-[12px] text-white/70 mb-1">Volume total de calda</p>
              <p className="text-[20px] font-bold">{result.volumeTotalL.toFixed(2)} L</p>
            </div>

            <div>
              <p className="text-[12px] text-white/70 mb-1">Número de tanques</p>
              <p className="text-[20px] font-bold">{result.numeroTanques}</p>
            </div>

            <div className="pt-4 border-t border-white/20">
              <p className="text-[14px] font-semibold mb-3">Por tanque:</p>
              <div className="space-y-3">
                {result.produtosPorTanque.map((tank) => (
                  <div key={tank.tankNumber} className="bg-white/10 rounded-xl p-3">
                    <p className="text-[13px] font-semibold mb-2">
                      Tanque {tank.tankNumber}: {tank.volume.toFixed(2)} L
                    </p>
                    <div className="space-y-1">
                      {tank.products.map((prod, idx) => (
                        <p key={idx} className="text-[12px] text-white/80">
                          {prod.productName}: {prod.quantity.toFixed(2)} {prod.unit}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/20">
              <p className="text-[14px] font-semibold mb-2">Total de produtos:</p>
              <div className="space-y-1">
                {result.produtosTotal.map((prod, idx) => (
                  <p key={idx} className="text-[12px] text-white/80">
                    {prod.productName}: {prod.totalQuantity.toFixed(2)} {prod.unit}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

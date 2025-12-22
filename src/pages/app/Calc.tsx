import { useState } from "react";
import { Calculator, Plus, Trash2, Save, RotateCcw, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  calculateCalda,
  type CalculationInput,
  type CalculationResult,
  type Product,
  type ProductUnit,
} from "@/lib/calcUtils";
import { incrementCalculations, addHectares, incrementSavedCalculations } from "@/lib/userStats";
import { saveCalculation } from "@/lib/calcHistory";

export default function Calc() {
  const { toast } = useToast();
  
  // Estados dos campos principais
  const [areaHa, setAreaHa] = useState<string>("");
  const [litrosPorHa, setLitrosPorHa] = useState<string>("");
  const [volumeTanque, setVolumeTanque] = useState<string>("");
  
  // Estados dos produtos
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Produto 1",
      dose: 0,
      unit: "mL",
    },
  ]);
  
  // Estado de erros
  const [errors, setErrors] = useState<string[] | null>(null);
  
  // Estado do resultado
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Adicionar novo produto
  const addProduct = () => {
    setProducts([
      ...products,
      {
        id: Date.now().toString(),
        name: `Produto ${products.length + 1}`,
        dose: 0,
        unit: "mL",
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
    const taxa = parseFloat(litrosPorHa);
    const tanque = parseFloat(volumeTanque);

    const input: CalculationInput = {
      areaHa: area,
      taxaLHa: taxa,
      volumeTanqueL: tanque,
      products,
    };

    const calculation = calculateCalda(input);
    
    if (calculation.result) {
      setResult(calculation.result);
      setErrors(null);
      
      // Registrar cálculo e hectares
      incrementCalculations().catch(console.error);
      addHectares(area).catch(console.error);
    } else {
      setErrors(calculation.errors.messages);
      setResult(null);
      
      toast({
        title: "Verifique os dados",
        description: calculation.errors.messages[0],
        variant: "destructive",
      });
    }
  };

  // Limpar campos
  const handleClear = () => {
    setAreaHa("");
    setLitrosPorHa("");
    setVolumeTanque("");
    setProducts([
      {
        id: "1",
        name: "Produto 1",
        dose: 0,
        unit: "mL",
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

    saveCalculation({
      input: {
        areaHa: parseFloat(areaHa),
        taxaLHa: parseFloat(litrosPorHa),
        volumeTanqueL: parseFloat(volumeTanque),
        products,
      },
      result,
      isFavorite: false,
    });

    incrementSavedCalculations().catch(console.error);

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
          <Calculator size={20} className="text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-[20px] font-bold text-foreground">Calculadora de Calda</h1>
          <p className="text-[12px] text-muted-foreground">Simples e direto para o campo</p>
        </div>
      </div>

      {/* Campos principais */}
      <div className="space-y-4 mb-6">
        <div>
          <Label htmlFor="area" className="text-[13px] font-medium text-foreground mb-2 block">
            Área a aplicar (hectares)
          </Label>
          <Input
            id="area"
            type="number"
            step="0.01"
            placeholder="Ex: 10"
            value={areaHa}
            onChange={(e) => setAreaHa(e.target.value)}
            className="h-12 rounded-2xl bg-card border-border text-[14px]"
          />
        </div>

        <div>
          <Label htmlFor="taxa" className="text-[13px] font-medium text-foreground mb-2 block">
            Litros por hectare
          </Label>
          <Input
            id="taxa"
            type="number"
            step="0.1"
            placeholder="Ex: 10"
            value={litrosPorHa}
            onChange={(e) => setLitrosPorHa(e.target.value)}
            className="h-12 rounded-2xl bg-card border-border text-[14px]"
          />
        </div>

        <div>
          <Label htmlFor="tanque" className="text-[13px] font-medium text-foreground mb-2 block">
            Volume do tanque (litros)
          </Label>
          <Input
            id="tanque"
            type="number"
            step="0.1"
            placeholder="Ex: 10"
            value={volumeTanque}
            onChange={(e) => setVolumeTanque(e.target.value)}
            className="h-12 rounded-2xl bg-card border-border text-[14px]"
          />
        </div>
      </div>

      {/* Produtos */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-foreground">Produtos</h2>
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
            <Card key={product.id || index} className="p-4 bg-card border-border">
              <div className="flex items-center justify-between mb-3">
                <Input
                  value={product.name || ""}
                  onChange={(e) => updateProduct(product.id || index.toString(), "name", e.target.value)}
                  placeholder={`Produto ${index + 1}`}
                  className="h-8 text-[13px] font-medium bg-transparent border-0 p-0 focus-visible:ring-0"
                />
                {products.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => removeProduct(product.id || index.toString())}
                  >
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[11px] text-muted-foreground mb-1 block">
                    Dose por hectare
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 200"
                    value={product.dose || ""}
                    onChange={(e) =>
                      updateProduct(product.id || index.toString(), "dose", parseFloat(e.target.value) || 0)
                    }
                    className="h-10 rounded-xl bg-muted border-transparent text-[13px]"
                  />
                </div>

                <div>
                  <Label className="text-[11px] text-muted-foreground mb-1 block">Unidade</Label>
                  <Select
                    value={product.unit}
                    onValueChange={(value: ProductUnit) =>
                      updateProduct(product.id || index.toString(), "unit", value)
                    }
                  >
                    <SelectTrigger className="h-10 rounded-xl bg-muted border-transparent text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mL">mL</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Mensagens de erro */}
      {errors && errors.length > 0 && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl">
          <div className="flex items-start gap-2">
            <AlertCircle size={18} className="text-destructive mt-0.5" />
            <div className="flex-1">
              <ul className="space-y-1">
                {errors.map((msg, idx) => (
                  <li key={idx} className="text-[12px] text-destructive">{msg}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Botões de ação */}
      <div className="space-y-3 mb-6">
        <Button
          onClick={handleCalculate}
          className="w-full h-12 bg-primary text-primary-foreground text-[14px] font-semibold rounded-full"
        >
          Calcular
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleClear}
            variant="outline"
            className="h-12 text-[14px] font-semibold rounded-full"
          >
            <RotateCcw size={16} className="mr-2" />
            Novo
          </Button>
          <Button
            onClick={handleSave}
            variant="outline"
            className="h-12 text-[14px] font-semibold rounded-full"
            disabled={!result}
          >
            <Save size={16} className="mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Resultado */}
      {result && (
        <Card className="p-5 bg-primary text-primary-foreground mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={20} />
            <h3 className="text-[18px] font-bold">Resultado</h3>
          </div>

          <div className="space-y-4">
            {/* PASSO 1 */}
            <div className="bg-primary-foreground/10 rounded-xl p-4">
              <p className="text-[11px] uppercase tracking-wide opacity-70 mb-1">Volume total de calda</p>
              <p className="text-[24px] font-bold">{result.volumeTotalL} L</p>
              <p className="text-[11px] opacity-70 mt-1">
                {areaHa} ha × {litrosPorHa} L/ha = {result.volumeTotalL} litros
              </p>
            </div>

            {/* PASSO 2 */}
            <div className="bg-primary-foreground/10 rounded-xl p-4">
              <p className="text-[11px] uppercase tracking-wide opacity-70 mb-1">Quantidade de tanques</p>
              <p className="text-[24px] font-bold">{result.numeroTanques} tanques</p>
              <p className="text-[11px] opacity-70 mt-1">
                {result.volumeTotalL} L ÷ {volumeTanque} L = {result.numeroTanques} tanques
              </p>
            </div>

            {/* PASSO 3 e 4 - Produtos */}
            {result.produtos.map((produto, idx) => (
              <div key={idx} className="bg-primary-foreground/10 rounded-xl p-4">
                <p className="text-[13px] font-semibold mb-3">{produto.nome}</p>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide opacity-70 mb-1">Total no trabalho</p>
                    <p className="text-[20px] font-bold">{produto.totalProduto} {produto.unit}</p>
                    <p className="text-[11px] opacity-70 mt-1">
                      {areaHa} ha × {produto.doseHa} {produto.unit}/ha
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t border-primary-foreground/20">
                    <p className="text-[11px] uppercase tracking-wide opacity-70 mb-1">Por tanque</p>
                    <p className="text-[24px] font-bold text-primary-foreground">
                      {produto.produtoPorTanque} {produto.unit}
                    </p>
                    <p className="text-[11px] opacity-70 mt-1">
                      {produto.totalProduto} {produto.unit} ÷ {result.numeroTanques} tanques
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Instrução final */}
            <div className="bg-primary-foreground/20 rounded-xl p-4 mt-4">
              <p className="text-[13px] font-semibold mb-2">Para cada tanque do drone:</p>
              <ul className="space-y-1">
                {result.produtos.map((produto, idx) => (
                  <li key={idx} className="text-[12px]">
                    • Coloque {produto.produtoPorTanque} {produto.unit} de {produto.nome}
                  </li>
                ))}
                <li className="text-[12px] mt-2">
                  • Complete com água até {volumeTanque} litros
                </li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Calculator, RotateCcw, AlertCircle, CheckCircle2, Plus, Trash2, Package, History, Save, ChevronRight, FlaskConical, Droplets, Info, MoreVertical, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { calculateCalda, type CalculationResult, type ProductUnit, type Product as CalcProduct, type CalculationInput } from "@/lib/calcUtils";
import { produtosAgricolas, type Product } from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { saveCalculation } from "@/lib/favoritesService";
import { useToast } from "@/hooks/use-toast";
import { SelectCustomProductModal } from "@/components/calc/SelectCustomProductModal";
import { AddProductModal } from "@/components/catalog/AddProductModal";
import { addCustomProduct } from "@/lib/productCatalogService";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type { ProductCategory, ProductUnit as CatalogProductUnit } from "@/types/product";

interface LocationState {
  produtoSelecionado?: Product;
}

interface ProdutoNoCalculo {
  id: string;
  nome: string;
  dose: number;
  unidade: ProductUnit;
  produtoOriginal?: Product;
}

const coresPorTipo: Record<string, string> = {
  Herbicida: "bg-orange-100 text-orange-600 border-orange-200",
  Inseticida: "bg-blue-100 text-blue-600 border-blue-200",
  Fungicida: "bg-purple-100 text-purple-600 border-purple-200",
  Fertilizante: "bg-emerald-100 text-emerald-600 border-emerald-200",
};

export default function Calc() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const { toast } = useToast();
  const { user } = useAuth();

  const [areaHa, setAreaHa] = useState<string>("");
  const [litrosPorHa, setLitrosPorHa] = useState<string>("");
  const [volumeTanque, setVolumeTanque] = useState<string>("");
  const [produtos, setProdutos] = useState<ProdutoNoCalculo[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [customProductModalOpen, setCustomProductModalOpen] = useState(false);
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    if (state?.produtoSelecionado) {
      const produto = state.produtoSelecionado;
      adicionarProdutoDoCatalogo(produto);
      window.history.replaceState({}, document.title);
    }
  }, [state]);

  const adicionarProdutoDoCatalogo = (produto: Product) => {
    const novoProduto: ProdutoNoCalculo = {
      id: Date.now().toString(),
      nome: produto.nome,
      dose: produto.dosePadrao,
      unidade: produto.unidade,
      produtoOriginal: produto,
    };
    setProdutos(prev => [...prev, novoProduto]);
    setDialogAberto(false);
  };

  const handleSelectCustomProduct = (product: { nome: string; dose: number; unidade: ProductUnit }) => {
    const novoProduto: ProdutoNoCalculo = {
      id: Date.now().toString(),
      nome: product.nome,
      dose: product.dose,
      unidade: product.unidade,
    };
    setProdutos(prev => [...prev, novoProduto]);
    toast({ title: "Produto adicionado", description: `${product.nome} foi adicionado ao cálculo.` });
  };

  const handleSaveNewProduct = async (productData: {
    name: string;
    category: ProductCategory;
    description: string;
    dose_value: number;
    dose_unit: CatalogProductUnit;
    dose_min?: number;
    dose_max?: number;
    recommendations?: string;
    notes?: string;
    image_url?: string;
  }) => {
    if (!user) {
      toast({ title: "Erro", description: "Você precisa estar logado.", variant: "destructive" });
      return;
    }
    try {
      const { product, error } = await addCustomProduct(user.id, productData);
      if (error) {
        toast({ title: "Erro", description: error.message || "Erro ao salvar produto.", variant: "destructive" });
        return;
      }
      if (product) {
        toast({ title: "Produto criado", description: "Produto personalizado criado com sucesso!" });
        const novoProduto: ProdutoNoCalculo = {
          id: Date.now().toString(),
          nome: product.name,
          dose: product.dose_value,
          unidade: product.dose_unit === "mL" || product.dose_unit === "mL/L" ? "mL" : "L",
        };
        setProdutos(prev => [...prev, novoProduto]);
        setAddProductModalOpen(false);
      }
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao salvar produto personalizado.", variant: "destructive" });
    }
  };

  const removerProduto = (id: string) => {
    setProdutos(prev => prev.filter((p) => p.id !== id));
  };

  const atualizarProduto = (id: string, campo: keyof ProdutoNoCalculo, valor: any) => {
    setProdutos(prev => prev.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)));
  };

  const handleCalculate = () => {
    setError(null);
    setResult(null);

    const area = parseFloat(areaHa);
    const taxa = parseFloat(litrosPorHa);
    const tanque = parseFloat(volumeTanque);

    if (!area || area <= 0 || !taxa || taxa <= 0 || !tanque || tanque <= 0) {
      setError("Preencha Área, L/ha e Tanque corretamente.");
      return;
    }

    if (produtos.length === 0) {
      setError("Adicione pelo menos um produto.");
      return;
    }

    const produtosParaCalculo: CalcProduct[] = produtos.map((p) => ({
      id: p.id,
      name: p.nome,
      dose: p.dose,
      unit: p.unidade,
    }));

    const calculation = calculateCalda({
      areaHa: area,
      taxaLHa: taxa,
      volumeTanqueL: tanque,
      products: produtosParaCalculo,
    });

    if (calculation.result) {
      setResult(calculation.result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setError(calculation.errors?.messages[0] || "Erro ao calcular.");
    }
  };

  const handleClear = () => {
    setAreaHa("");
    setLitrosPorHa("");
    setVolumeTanque("");
    setProdutos([]);
    setResult(null);
    setError(null);
  };

  const handleSaveCalculation = async () => {
    if (!result) return;
    setIsSaving(true);

    const produtosParaCalculo: CalcProduct[] = produtos.map((p) => ({
      id: p.id,
      name: p.nome,
      dose: p.dose,
      unit: p.unidade,
    }));

    const input: CalculationInput = {
      areaHa: parseFloat(areaHa),
      taxaLHa: parseFloat(litrosPorHa),
      volumeTanqueL: parseFloat(volumeTanque),
      products: produtosParaCalculo,
    };

    const { error } = await saveCalculation(input, result);
    setIsSaving(false);

    if (error) {
      toast({ title: "Erro", description: error.message || "Erro ao salvar cálculo.", variant: "destructive" });
    } else {
      window.dispatchEvent(new CustomEvent("calculationSaved"));
      toast({ title: "Cálculo salvo", description: "Acesse o Histórico para visualizar." });
    }
  };

  return (
    <div 
      className="space-y-6 pb-32 animate-fade-in bg-[#fdfdfd] min-h-screen min-h-[100dvh] px-2"
      style={{
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm">
            <Calculator size={24} className="text-emerald-600" />
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-[#1a1a1a]">Calculadora</h1>
            <p className="text-[13px] text-[#8a8a8a] font-medium tracking-wider">Mistura de calda</p>
          </div>
        </div>
        <button onClick={handleClear} className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center active:scale-90 transition-all">
          <RotateCcw size={18} className="text-[#8a8a8a]" />
        </button>
      </div>

      {!result ? (
        <div className="space-y-6">
          <Card className="p-6 rounded-[32px] border-none shadow-sm bg-white space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                <Plane size={16} className="text-emerald-600" />
              </div>
              <span className="text-[15px] font-bold text-[#1a1a1a]">Dados da Área</span>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Label htmlFor="area" className="text-[13px] font-bold text-[#1a1a1a] mb-2 block ml-1">Área total (ha)</Label>
                <div className="relative">
                  <Input id="area" type="number" step="0.01" placeholder="Ex: 10.0" value={areaHa} onChange={(e) => setAreaHa(e.target.value)} className="h-[56px] px-5 rounded-[20px] bg-[#f8f9fb] border-none text-[16px] font-semibold text-[#1a1a1a] placeholder:text-[#b4b4b4] focus:ring-2 focus:ring-primary/20" />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[14px] font-bold text-[#8a8a8a]">ha</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Label htmlFor="taxa" className="text-[13px] font-bold text-[#1a1a1a] mb-2 block ml-1">Taxa (L/ha)</Label>
                  <div className="relative">
                    <Input id="taxa" type="number" step="0.1" placeholder="Ex: 10" value={litrosPorHa} onChange={(e) => setLitrosPorHa(e.target.value)} className="h-[56px] px-5 rounded-[20px] bg-[#f8f9fb] border-none text-[16px] font-semibold text-[#1a1a1a] placeholder:text-[#b4b4b4] focus:ring-2 focus:ring-primary/20" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-[#8a8a8a]">L/ha</span>
                  </div>
                </div>
                <div className="relative">
                  <Label htmlFor="tanque" className="text-[13px] font-bold text-[#1a1a1a] mb-2 block ml-1">Tanque (L)</Label>
                  <div className="relative">
                    <Input id="tanque" type="number" step="0.1" placeholder="Ex: 10" value={volumeTanque} onChange={(e) => setVolumeTanque(e.target.value)} className="h-[56px] px-5 rounded-[20px] bg-[#f8f9fb] border-none text-[16px] font-semibold text-[#1a1a1a] placeholder:text-[#b4b4b4] focus:ring-2 focus:ring-primary/20" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold text-[#8a8a8a]">L</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-bold text-[#1a1a1a]">Produtos</h2>
                <Badge variant="secondary" className="bg-[#f2f4f7] text-[#8a8a8a] rounded-lg px-2 h-6">{produtos.length}</Badge>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setDialogAberto(true)} variant="outline" size="sm" className="rounded-full h-9 bg-white text-[12px] font-bold border-gray-100 shadow-sm px-4">
                  <Plus size={14} className="mr-1.5" /> Catálogo
                </Button>
                <Button onClick={() => setCustomProductModalOpen(true)} variant="outline" size="sm" className="rounded-full h-9 bg-white text-[12px] font-bold border-gray-100 shadow-sm px-4">
                  <Plus size={14} className="mr-1.5" /> Manual
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {produtos.map((produto) => (
                <div key={produto.id} className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-50 relative group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", produto.produtoOriginal ? coresPorTipo[produto.produtoOriginal.tipo] : "bg-gray-100")}>
                          <Package size={16} />
                        </div>
                        <input 
                          value={produto.nome} 
                          onChange={(e) => atualizarProduto(produto.id, "nome", e.target.value)} 
                          placeholder="Nome do produto" 
                          className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-[15px] font-bold text-[#1a1a1a] placeholder:text-[#b4b4b4]" 
                        />
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="Dose" 
                            value={produto.dose || ""} 
                            onChange={(e) => atualizarProduto(produto.id, "dose", parseFloat(e.target.value) || 0)} 
                            className="h-11 px-4 rounded-xl bg-[#f8f9fb] border-none text-[14px] font-bold text-[#1a1a1a]" 
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#8a8a8a] uppercase">{produto.unidade}/ha</span>
                        </div>
                        <div className="w-24">
                          <Select value={produto.unidade} onValueChange={(value: ProductUnit) => atualizarProduto(produto.id, "unidade", value)}>
                            <SelectTrigger className="h-11 rounded-xl bg-[#f8f9fb] border-none text-[13px] font-bold"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mL">mL</SelectItem>
                              <SelectItem value="L">L</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removerProduto(produto.id)} className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 active:scale-90 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {produtos.length === 0 && (
                <div className="text-center py-12 bg-[#f2f4f7]/50 border-2 border-dashed border-gray-200 rounded-[32px]">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <FlaskConical size={24} className="text-[#8a8a8a]" />
                  </div>
                  <p className="text-[14px] font-bold text-[#1a1a1a]">Nenhum produto</p>
                  <p className="text-[12px] text-[#8a8a8a] mt-1">Adicione os produtos da mistura acima</p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-[24px] flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-[13px] text-red-600 font-medium leading-relaxed">{error}</p>
            </div>
          )}

          <div className="px-1 pt-4 pb-8">
            <Button 
              onClick={handleCalculate} 
              className="w-full h-12 bg-[#1a1a1a] text-white text-[15px] font-bold rounded-2xl shadow-md active:scale-95 transition-all hover:bg-black"
            >
              Realizar cálculo
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[22px] font-bold text-[#1a1a1a]">Resultado Final</h2>
              <div className="flex gap-2">
                <button onClick={handleSaveCalculation} disabled={isSaving} className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center active:scale-90 transition-all">
                  <Save size={18} className="text-emerald-600" />
                </button>
                <button onClick={handleClear} className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center active:scale-90 transition-all">
                  <RotateCcw size={18} className="text-[#8a8a8a]" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#f0f9ff] rounded-[32px] p-6 shadow-sm border border-blue-50 flex flex-col justify-between h-[160px]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Droplets size={16} className="text-blue-600" />
                  </div>
                  <span className="text-[13px] font-bold text-[#1a1a1a] uppercase tracking-wider">Volume Total</span>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[32px] font-black text-[#1a1a1a]">{result.volumeTotalL}</span>
                    <span className="text-[14px] font-bold text-[#8a8a8a]">L</span>
                  </div>
                  <p className="text-[11px] text-[#8a8a8a] mt-1 font-medium">{areaHa}ha × {litrosPorHa}L/ha</p>
                </div>
              </div>

              <div className="bg-[#f0fff4] rounded-[32px] p-6 shadow-sm border border-emerald-50 flex flex-col justify-between h-[160px]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Calculator size={16} className="text-emerald-600" />
                  </div>
                  <span className="text-[13px] font-bold text-[#1a1a1a] uppercase tracking-wider">Tanques</span>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[32px] font-black text-[#1a1a1a]">{result.numeroTanques}</span>
                    <span className="text-[14px] font-bold text-[#8a8a8a]">{result.numeroTanques === 1 ? 'Voo' : 'Voos'}</span>
                  </div>
                  <p className="text-[11px] text-[#8a8a8a] mt-1 font-medium">{result.volumeTotalL}L ÷ {volumeTanque}L</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[16px] font-bold text-[#1a1a1a] uppercase tracking-wider ml-1">Mistura por Tanque</h3>
              
              {result.produtos.map((produto, idx) => (
                <div key={idx} className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-50 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#f8f9fb] flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                      <FlaskConical size={20} className="text-[#8a8a8a] group-hover:text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-[#1a1a1a] leading-tight mb-1">{produto.nome}</p>
                      <p className="text-[12px] text-[#8a8a8a] font-medium uppercase tracking-tighter">Produto no Tanque</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-[22px] font-black text-emerald-600">{produto.produtoPorTanque}</span>
                      <span className="text-[12px] font-bold text-emerald-600/60 uppercase">{produto.unit}</span>
                    </div>
                    <p className="text-[10px] text-[#b4b4b4] font-bold mt-0.5">TOTAL: {produto.totalProduto}{produto.unit}</p>
                  </div>
                </div>
              ))}

              <div className="bg-[#f0f9ff]/50 rounded-[28px] p-5 border border-blue-100 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center">
                    <Droplets size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-[#1a1a1a] leading-tight mb-1">Água</p>
                    <p className="text-[12px] text-[#8a8a8a] font-medium uppercase tracking-tighter">Adicionar ao Tanque</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-[22px] font-black text-blue-600">{result.aguaPorTanqueL}</span>
                    <span className="text-[12px] font-bold text-blue-600/60 uppercase">L</span>
                  </div>
                  <p className="text-[10px] text-blue-400/60 font-bold mt-0.5 whitespace-nowrap">PARA COMPLETAR {volumeTanque}L</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 pb-10">
              <Button onClick={handleSaveCalculation} disabled={isSaving} className="w-full h-12 bg-emerald-600 text-white text-[15px] font-bold rounded-2xl shadow-md active:scale-95 transition-all hover:bg-emerald-700">
                {isSaving ? "Salvando..." : "Salvar no histórico"}
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => navigate("/app/favoritos")} variant="outline" className="h-12 rounded-2xl text-[#1a1a1a] font-bold border-gray-200 text-[14px]">
                  <History size={18} className="mr-2" /> Histórico
                </Button>
                <Button onClick={handleClear} variant="outline" className="h-12 rounded-2xl text-[#1a1a1a] font-bold border-gray-200 text-[14px]">
                  <Plus size={18} className="mr-2" /> Novo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 rounded-[32px] border-none overflow-hidden">
          <DialogHeader className="px-6 pt-8 pb-4 bg-white">
            <DialogTitle className="text-[22px] font-bold text-[#1a1a1a]">Catálogo</DialogTitle>
            <DialogDescription className="text-[14px] text-[#8a8a8a] font-medium">Selecione um produto para o cálculo.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-8 bg-white">
            <div className="space-y-3 mt-2">
              {produtosAgricolas.map((produto) => (
                <div key={produto.id} className="p-4 bg-[#f8f9fb] rounded-2xl cursor-pointer active:scale-95 transition-all flex items-center justify-between" onClick={() => adicionarProdutoDoCatalogo(produto)}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-[15px] font-bold text-[#1a1a1a]">{produto.nome}</p>
                      <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0 h-5 uppercase tracking-tighter border-none", coresPorTipo[produto.tipo])}>{produto.tipo}</Badge>
                    </div>
                    <p className="text-[12px] text-[#8a8a8a] font-medium">Dose: {produto.dosePadrao} {produto.unidade}/ha</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Plus size={16} className="text-emerald-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SelectCustomProductModal open={customProductModalOpen} onClose={() => setCustomProductModalOpen(false)} onSelectProduct={handleSelectCustomProduct} onAddNew={() => setAddProductModalOpen(true)} />
      {user && <AddProductModal open={addProductModalOpen} onClose={() => setAddProductModalOpen(false)} onSubmit={handleSaveNewProduct} />}
    </div>
  );
}

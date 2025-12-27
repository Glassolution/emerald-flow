import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Calculator, RotateCcw, AlertCircle, CheckCircle2, Plus, Trash2, Package, History, Save, Plane } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  calculateCalda,
  type CalculationResult,
  type ProductUnit,
  type Product as CalcProduct,
  type CalculationInput,
} from "@/lib/calcUtils";
import { produtosAgricolas, type Product } from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { saveCalculation } from "@/lib/favoritesService";
import { useToast } from "@/hooks/use-toast";
import { SelectCustomProductModal } from "@/components/calc/SelectCustomProductModal";
import { AddProductModal } from "@/components/catalog/AddProductModal";
import { addCustomProduct, getCustomProducts } from "@/lib/productCatalogService";
import { useAuth } from "@/contexts/AuthContext";
import type { ProductCategory, ProductUnit as CatalogProductUnit } from "@/types/product";

interface LocationState {
  produtoSelecionado?: Product;
}

interface ProdutoNoCalculo {
  id: string;
  nome: string;
  dose: number;
  unidade: ProductUnit;
  produtoOriginal?: Product; // Referência ao produto do catálogo
}

const coresPorTipo: Record<string, string> = {
  Herbicida: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Inseticida: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Fungicida: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Fertilizante: "bg-green-500/10 text-green-500 border-green-500/20",
};

export default function Calc() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const { toast } = useToast();
  const { user } = useAuth();

  // Estados dos campos principais
  const [areaHa, setAreaHa] = useState<string>("");
  const [litrosPorHa, setLitrosPorHa] = useState<string>("");
  const [volumeTanque, setVolumeTanque] = useState<string>("");

  // Estado da lista de produtos
  const [produtos, setProdutos] = useState<ProdutoNoCalculo[]>([]);

  // Estado do dialog de seleção de produtos
  const [dialogAberto, setDialogAberto] = useState(false);
  
  // Estado do modal de produtos personalizados
  const [customProductModalOpen, setCustomProductModalOpen] = useState(false);
  
  // Estado do modal de adicionar produto
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  
  // Estado de salvamento
  const [isSaving, setIsSaving] = useState(false);

  // Preencher quando um produto é selecionado via navegação
  useEffect(() => {
    if (state?.produtoSelecionado) {
      const produto = state.produtoSelecionado;
      adicionarProdutoDoCatalogo(produto);
      // Limpar o state após usar
      window.history.replaceState({}, document.title);
    }
  }, [state]);

  // Adicionar produto do catálogo
  const adicionarProdutoDoCatalogo = (produto: Product) => {
    const novoProduto: ProdutoNoCalculo = {
      id: Date.now().toString(),
      nome: produto.nome,
      dose: produto.dosePadrao,
      unidade: produto.unidade,
      produtoOriginal: produto,
    };
    setProdutos([...produtos, novoProduto]);
    setDialogAberto(false);
  };

  // Abrir modal de produtos personalizados
  const adicionarProdutoManual = () => {
    setCustomProductModalOpen(true);
  };

  // Adicionar produto personalizado selecionado
  const handleSelectCustomProduct = (product: {
    nome: string;
    dose: number;
    unidade: ProductUnit;
  }) => {
    const novoProduto: ProdutoNoCalculo = {
      id: Date.now().toString(),
      nome: product.nome,
      dose: product.dose,
      unidade: product.unidade,
    };
    setProdutos([...produtos, novoProduto]);
    toast({
      title: "Produto adicionado",
      description: `${product.nome} foi adicionado ao cálculo.`,
    });
  };

  // Abrir modal de adicionar novo produto
  const handleAddNewProduct = () => {
    setAddProductModalOpen(true);
  };

  // Salvar novo produto personalizado
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
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar produtos personalizados.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { product, error } = await addCustomProduct(user.id, productData);
      
      if (error) {
        toast({
          title: "Erro",
          description: error.message || "Erro ao salvar produto.",
          variant: "destructive",
        });
        return;
      }

      if (product) {
        toast({
          title: "Produto criado",
          description: "Produto personalizado criado com sucesso!",
        });

        // Adicionar automaticamente ao cálculo
        const novoProduto: ProdutoNoCalculo = {
          id: Date.now().toString(),
          nome: product.name,
          dose: product.dose_value,
          unidade: product.dose_unit === "mL" || product.dose_unit === "mL/L" ? "mL" : "L",
        };
        setProdutos([...produtos, novoProduto]);
        setAddProductModalOpen(false);
      }
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar produto personalizado.",
        variant: "destructive",
      });
    }
  };

  // Remover produto
  const removerProduto = (id: string) => {
    setProdutos(produtos.filter((p) => p.id !== id));
  };

  // Atualizar produto
  const atualizarProduto = (id: string, campo: keyof ProdutoNoCalculo, valor: any) => {
    setProdutos(
      produtos.map((p) => (p.id === id ? { ...p, [campo]: valor } : p))
    );
  };

  // Estado de erro
  const [error, setError] = useState<string | null>(null);

  // Estado do resultado
  const [result, setResult] = useState<CalculationResult | null>(null);

  // Calcular
  const handleCalculate = () => {
    setError(null);
    setResult(null);

    const area = parseFloat(areaHa);
    const taxa = parseFloat(litrosPorHa);
    const tanque = parseFloat(volumeTanque);

    // Validar campos principais
    if (!area || area <= 0) {
      setError("Preencha Área, L/ha e Tanque corretamente.");
      return;
    }

    if (!taxa || taxa <= 0) {
      setError("Preencha Área, L/ha e Tanque corretamente.");
      return;
    }

    if (!tanque || tanque <= 0) {
      setError("Preencha Área, L/ha e Tanque corretamente.");
      return;
    }

    if (produtos.length === 0) {
      setError("Adicione pelo menos um produto.");
      return;
    }

    // Converter produtos para o formato da função de cálculo
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
    } else {
      setError(calculation.errors.messages[0] || "Erro ao calcular.");
    }
  };

  // Limpar campos
  const handleClear = () => {
    setAreaHa("");
    setLitrosPorHa("");
    setVolumeTanque("");
    setProdutos([]);
    setResult(null);
    setError(null);
  };

  // Gerar texto final com múltiplos produtos
  const gerarTextoFinal = (): string => {
    if (!result) return "";

    const linhasProdutos = result.produtos.map(
      (p) => `- Coloque ${p.produtoPorTanque} ${p.unit} de ${p.nome}`
    );

    return `Para cada tanque do drone:\n${linhasProdutos.join("\n")}\n- Complete com água até fechar ${volumeTanque} litros do tanque.`;
  };

  // Salvar cálculo
  const handleSaveCalculation = async () => {
    if (!result) return;

    setIsSaving(true);

    // Converter produtos para o formato CalculationInput
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

    const { id, error } = await saveCalculation(input, result);

    setIsSaving(false);

    if (error) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar cálculo.",
        variant: "destructive",
      });
    } else if (id) {
      // Disparar evento para recarregar cálculos nas outras páginas
      window.dispatchEvent(new CustomEvent("calculationSaved"));
      
      toast({
        title: "Cálculo salvo com sucesso",
        description: "O cálculo foi adicionado aos favoritos.",
      });
    }
  };

  return (
    <div className="pt-4 pb-24">
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
            Área (hectares)
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
            Litros por hectare (L/ha)
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
            Volume do tanque (L)
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

      {/* Seção de Produtos */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Label className="text-[13px] font-medium text-foreground">
            Produtos ({produtos.length})
          </Label>
          <div className="flex gap-2">
            <Button
              onClick={() => setDialogAberto(true)}
              variant="outline"
              size="sm"
              className="h-9 text-[12px]"
            >
              <Package size={14} className="mr-1" />
              Do catálogo
            </Button>
            <Button
              onClick={adicionarProdutoManual}
              variant="outline"
              size="sm"
              className="h-9 text-[12px]"
            >
              <Plus size={14} className="mr-1" />
              Manual
            </Button>
          </div>
        </div>

        {/* Lista de Produtos */}
        <div className="space-y-3">
          {produtos.map((produto) => (
            <Card key={produto.id} className="p-4 bg-card border-border">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      value={produto.nome}
                      onChange={(e) => atualizarProduto(produto.id, "nome", e.target.value)}
                      placeholder="Nome do produto"
                      className="h-8 text-[13px] font-medium bg-transparent border-0 p-0 focus-visible:ring-0"
                    />
                    {produto.produtoOriginal && (
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1.5 py-0 ${coresPorTipo[produto.produtoOriginal.tipo] || ""}`}
                      >
                        {produto.produtoOriginal.tipo}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label className="text-[11px] text-muted-foreground mb-1 block">
                        Dose por hectare
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 200"
                        value={produto.dose || ""}
                        onChange={(e) =>
                          atualizarProduto(produto.id, "dose", parseFloat(e.target.value) || 0)
                        }
                        className="h-9 rounded-xl bg-muted border-transparent text-[13px]"
                      />
                    </div>
                    <div className="w-20">
                      <Label className="text-[11px] text-muted-foreground mb-1 block">
                        Unidade
                      </Label>
                      <Select
                        value={produto.unidade}
                        onValueChange={(value: ProductUnit) =>
                          atualizarProduto(produto.id, "unidade", value)
                        }
                      >
                        <SelectTrigger className="h-9 rounded-xl bg-muted border-transparent text-[13px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mL">mL</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                {produtos.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => removerProduto(produto.id)}
                  >
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                )}
              </div>
            </Card>
          ))}

          {produtos.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-2xl">
              <Package size={32} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-[12px] text-muted-foreground">
                Nenhum produto adicionado. Adicione produtos do catálogo ou manualmente.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dialog de Seleção de Produtos do Catálogo */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Selecionar Produto do Catálogo</DialogTitle>
            <DialogDescription>
              Escolha um produto para adicionar ao cálculo com as especificações já preenchidas.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="space-y-2">
              {produtosAgricolas.map((produto) => (
                <Card
                  key={produto.id}
                  className="p-3 cursor-pointer hover:bg-accent active:bg-accent/80 transition-colors"
                  onClick={() => adicionarProdutoDoCatalogo(produto)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-[14px] font-semibold">{produto.nome}</p>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0 ${coresPorTipo[produto.tipo] || ""}`}
                        >
                          {produto.tipo}
                        </Badge>
                      </div>
                      <p className="text-[12px] text-muted-foreground">
                        Dose: {produto.dosePadrao} {produto.unidade}/ha
                      </p>
                    </div>
                    <Plus size={18} className="text-primary flex-shrink-0 ml-2" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Seleção de Produtos Personalizados */}
      <SelectCustomProductModal
        open={customProductModalOpen}
        onClose={() => setCustomProductModalOpen(false)}
        onSelectProduct={handleSelectCustomProduct}
        onAddNew={handleAddNewProduct}
      />

      {/* Modal de Adicionar Novo Produto Personalizado */}
      {user && (
        <AddProductModal
          open={addProductModalOpen}
          onClose={() => setAddProductModalOpen(false)}
          onSubmit={handleSaveNewProduct}
        />
      )}

      {/* Mensagem de erro */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl">
          <div className="flex items-start gap-2">
            <AlertCircle size={18} className="text-destructive mt-0.5" />
            <p className="text-[13px] text-destructive flex-1">{error}</p>
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
        {result && (
          <>
            <Button
              onClick={handleSaveCalculation}
              disabled={isSaving}
              className="w-full h-12 bg-green-500 text-white text-[14px] font-semibold rounded-full hover:bg-green-600"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Salvar cálculo
                </>
              )}
            </Button>
            <Button
              onClick={() => navigate("/app/favoritos")}
              variant="outline"
              className="w-full h-12 text-[14px] font-semibold rounded-full border-green-500/20 hover:bg-green-500/10"
            >
              <History size={16} className="mr-2 text-green-500" />
              Ver histórico
            </Button>
            <Button
              onClick={() => navigate("/app/operacoes")}
              variant="outline"
              className="w-full h-12 text-[14px] font-semibold rounded-full border-blue-500/20 hover:bg-blue-500/10"
            >
              <Plane size={16} className="mr-2 text-blue-500" />
              Operações
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              className="w-full h-12 text-[14px] font-semibold rounded-full"
            >
              <RotateCcw size={16} className="mr-2" />
              Novo cálculo
            </Button>
          </>
        )}
      </div>

      {/* Resultado */}
      {result && (
        <Card className="p-5 bg-black text-white mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={20} className="text-green-500" />
            <h3 className="text-[18px] font-bold text-white">Resultado</h3>
          </div>

          <div className="space-y-4">
            {/* PASSO 1 */}
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-[11px] uppercase tracking-wide text-white/70 mb-1">
                PASSO 1 — Volume total de calda
              </p>
              <p className="text-[24px] font-bold text-white">{result.volumeTotalL} L</p>
              <p className="text-[11px] text-white/70 mt-1">
                {areaHa} ha × {litrosPorHa} L/ha = {result.volumeTotalL} L
              </p>
            </div>

            {/* PASSO 2 */}
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-[11px] uppercase tracking-wide text-white/70 mb-1">
                PASSO 2 — Número de tanques
              </p>
              <p className="text-[24px] font-bold text-white">{result.numeroTanques} tanques</p>
              <p className="text-[11px] text-white/70 mt-1">
                {result.volumeTotalL} L ÷ {volumeTanque} L = {result.numeroTanques} tanques
              </p>
            </div>

            {/* PASSO 3 e 4 — Produtos */}
            {result.produtos.map((produto, idx) => (
              <div key={idx} className="bg-white/5 rounded-xl p-4">
                <p className="text-[13px] font-semibold mb-3 text-white">{produto.nome}</p>

                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-white/70 mb-1">
                      PASSO 3 — Produto total no trabalho
                    </p>
                    <p className="text-[20px] font-bold text-white">
                      {produto.totalProduto} {produto.unit}
                    </p>
                    <p className="text-[11px] text-white/70 mt-1">
                      {areaHa} ha × {produto.doseHa} {produto.unit}/ha = {produto.totalProduto} {produto.unit}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/20">
                    <p className="text-[11px] uppercase tracking-wide text-white/70 mb-1">
                      PASSO 4 — Produto por tanque
                    </p>
                    <p className="text-[24px] font-bold text-green-500">
                      {produto.produtoPorTanque} {produto.unit}
                    </p>
                    <p className="text-[11px] text-white/70 mt-1">
                      {produto.totalProduto} {produto.unit} ÷ {result.numeroTanques} tanques
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* RESULTADO FINAL */}
            <div className="bg-white/10 rounded-xl p-4 mt-4 border-2 border-green-500/30">
              <p className="text-[14px] font-bold mb-3 text-white">RESULTADO FINAL</p>
              <p className="text-[13px] leading-relaxed whitespace-pre-line text-white">
                {gerarTextoFinal()}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

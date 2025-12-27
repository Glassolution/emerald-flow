import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getCustomProducts } from "@/lib/productCatalogService";
import { useAuth } from "@/contexts/AuthContext";
import type { CatalogProduct, CustomProduct } from "@/types/product";
import type { ProductUnit } from "@/lib/calcUtils";

interface SelectCustomProductModalProps {
  open: boolean;
  onClose: () => void;
  onSelectProduct: (product: {
    nome: string;
    dose: number;
    unidade: ProductUnit;
  }) => void;
  onAddNew: () => void;
}

const coresPorCategoria: Record<string, string> = {
  Herbicida: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Inseticida: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Fungicida: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Fertilizante: "bg-green-500/10 text-green-500 border-green-500/20",
  Adjuvante: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export function SelectCustomProductModal({
  open,
  onClose,
  onSelectProduct,
  onAddNew,
}: SelectCustomProductModalProps) {
  const { user } = useAuth();
  const [customProducts, setCustomProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Carregar produtos personalizados
  useEffect(() => {
    if (open && user) {
      loadCustomProducts();
    }
  }, [open, user]);

  const loadCustomProducts = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Buscar apenas produtos custom diretamente
      const customProductsList: CustomProduct[] = await getCustomProducts(user.id);
      
      // Converter CustomProduct para CatalogProduct
      const custom: CatalogProduct[] = customProductsList.map((p) => ({
        id: `custom_${p.id}`,
        customId: p.id,
        name: p.name,
        category: p.category,
        doseValue: p.dose_value,
        doseUnit: p.dose_unit as CatalogProduct["doseUnit"],
        indication: p.recommendations || p.description || "Produto personalizado",
        imageUrl: p.image_url || undefined,
        details: {
          description: p.description,
          doseMin: p.dose_min || undefined,
          doseMax: p.dose_max || undefined,
          recommendations: p.recommendations || "",
          notes: p.notes || undefined,
        },
        isCustom: true,
      }));
      
      setCustomProducts(custom);
    } catch (error) {
      console.error("Erro ao carregar produtos custom:", error);
      setCustomProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar produtos por busca
  const filteredProducts = customProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Converter unidade do catálogo para unidade da calculadora
  const convertUnit = (unit: CatalogProduct["doseUnit"]): ProductUnit => {
    // Converter mL/L, g, kg para mL ou L (calculadora só aceita mL ou L)
    if (unit === "mL" || unit === "mL/L") return "mL";
    if (unit === "L") return "L";
    if (unit === "g" || unit === "kg") return "mL"; // Default para mL
    return "mL";
  };

  const handleSelect = (product: CatalogProduct) => {
    onSelectProduct({
      nome: product.name,
      dose: product.doseValue,
      unidade: convertUnit(product.doseUnit),
    });
    onClose();
  };

  const handleAddNew = () => {
    onAddNew();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Selecionar Produto Personalizado</DialogTitle>
          <DialogDescription>
            Escolha um produto que você criou ou adicione um novo.
          </DialogDescription>
        </DialogHeader>

        {/* Botão Adicionar Novo */}
        <div className="px-6 pb-4">
          <Button
            onClick={handleAddNew}
            className="w-full h-12 bg-green-500 text-white rounded-xl hover:bg-green-600 font-semibold"
          >
            <Plus size={18} className="mr-2" />
            Adicionar novo produto
          </Button>
        </div>

        {/* Busca */}
        {customProducts.length > 0 && (
          <div className="px-6 pb-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar produto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 pl-9 rounded-xl bg-muted border-transparent text-[13px]"
              />
            </div>
          </div>
        )}

        {/* Lista de Produtos */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 text-[14px]">Carregando produtos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-[14px] mb-4">
                {customProducts.length === 0
                  ? "Você ainda não criou produtos personalizados."
                  : "Nenhum produto encontrado com essa busca."}
              </p>
              {customProducts.length === 0 && (
                <Button
                  onClick={handleAddNew}
                  variant="outline"
                  className="mt-2"
                >
                  Criar primeiro produto
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="p-3 cursor-pointer hover:bg-accent active:bg-accent/80 transition-colors"
                  onClick={() => handleSelect(product)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-[14px] font-semibold">{product.name}</p>
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0 ${
                            coresPorCategoria[product.category] || ""
                          }`}
                        >
                          {product.category}
                        </Badge>
                      </div>
                      <p className="text-[12px] text-muted-foreground">
                        Dose: {product.doseValue} {product.doseUnit}/ha
                      </p>
                      {product.indication && (
                        <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                          {product.indication}
                        </p>
                      )}
                    </div>
                    <Plus size={18} className="text-primary flex-shrink-0 ml-2" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


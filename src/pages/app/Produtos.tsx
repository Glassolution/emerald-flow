import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Filter, Plus, Package, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductDetailsSheet } from "@/components/catalog/ProductDetailsSheet";
import { AddProductModal } from "@/components/catalog/AddProductModal";
import { useI18n } from "@/contexts/I18nContext";
import {
  getAllProducts,
  filterProducts,
  addCustomProduct,
  updateCustomProduct,
  deleteCustomProduct,
  uploadProductImage,
  getDefaultProducts,
} from "@/lib/productCatalogService";
import { classifySupabaseError, isTableNotFoundError, isAuthError } from "@/lib/supabaseErrorHandler";
import type { CatalogProduct, ProductFilters, ProductCategory } from "@/types/product";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const categories: ProductCategory[] = ["Herbicida", "Inseticida", "Fungicida", "Fertilizante", "Adjuvante"];

export default function Produtos() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);

  // Carregar produtos
  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  // Filtrar produtos quando filters mudarem
  useEffect(() => {
    const filtered = filterProducts(products, filters);
    setFilteredProducts(filtered);
  }, [products, filters]);

  const loadProducts = async (showToast = true) => {
    if (!user) {
      console.warn("⚠️ [Produtos] Usuário não autenticado");
      return;
    }

    setLoading(true);
    try {
      console.log("🔄 [Produtos] Carregando produtos para userId:", user.id);
      const allProducts = await getAllProducts(user.id);
      setProducts(allProducts);
      
      const customCount = allProducts.filter(p => p.isCustom).length;
      const defaultCount = allProducts.filter(p => !p.isCustom).length;
      
      console.log("✅ [Produtos] Produtos carregados:", {
        total: allProducts.length,
        custom: customCount,
        default: defaultCount,
      });

      if (showToast && customCount === 0 && defaultCount > 0) {
        // Silenciosamente carregou apenas padrão (pode ser normal se não tem custom)
        console.log("ℹ️ [Produtos] Apenas produtos padrão disponíveis (normal se não houver produtos custom)");
      }
    } catch (error: any) {
      console.error("❌ [Produtos] Erro ao carregar produtos:", error);
      
      // Classificar o erro
      const errorInfo = classifySupabaseError(error);
      
      // Mesmo com erro, tentar carregar produtos padrão
      const defaultProductsList = getDefaultProducts();
      const defaultProducts = defaultProductsList.map((p) => ({
        id: `default_${p.id}`,
        name: p.name,
        category: p.category,
        doseValue: p.doseValue,
        doseUnit: p.doseUnit,
        indication: p.indication,
        imageUrl: p.imageUrl,
        badges: p.badges,
        details: p.details,
        isCustom: false,
      }));
      setProducts(defaultProducts);
      
      // Mostrar toast apenas se for erro crítico (não tabela não encontrada)
      if (showToast && !isTableNotFoundError(error)) {
        if (isAuthError(error)) {
          toast({
            title: t('common.error'),
            description: errorInfo.userMessage,
            variant: "destructive",
          });
        } else {
          toast({
            title: t('common.error'),
            description: t('products.toast.loadingError'),
            variant: "default",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUseProduct = (product: CatalogProduct) => {
    // Navegar para calculadora com produto selecionado
    navigate("/app/calc", {
      state: {
        produtoSelecionado: {
          id: product.id,
          nome: product.name,
          tipo: product.category,
          dosePadrao: product.doseValue,
          unidade: product.doseUnit,
        },
      },
    });
  };

  const handleDetails = (product: CatalogProduct) => {
    setSelectedProduct(product);
    setDetailsOpen(true);
  };

  const handleAddProduct = async (productData: Parameters<typeof addCustomProduct>[1]) => {
    if (!user) return;

    try {
      if (editingProduct && editingProduct.customId) {
        // Atualizar produto existente
        const { error } = await updateCustomProduct(editingProduct.customId, user.id, productData);
        if (error) {
          const errorInfo = classifySupabaseError(error);
          
          // Mostrar mensagem apropriada baseada no tipo de erro
          toast({
            title: errorInfo.userMessage,
            description: errorInfo.details || errorInfo.message,
            variant: "destructive",
          });
          
          // Se não for erro de tabela não encontrada, logar para debug
          if (!isTableNotFoundError(error)) {
            console.error("❌ [Produtos] Erro ao atualizar produto:", errorInfo);
          }
          
          return;
        }
        toast({
          title: t('products.toast.updated'),
          description: t('products.toast.updatedDesc'),
        });
      } else {
        // Adicionar novo produto
        const { product, error } = await addCustomProduct(user.id, productData);
        if (error) {
          const errorInfo = classifySupabaseError(error);
          
          // Mostrar mensagem apropriada baseada no tipo de erro
          toast({
            title: errorInfo.userMessage,
            description: errorInfo.details || errorInfo.message,
            variant: "destructive",
          });
          
          // Se não for erro de tabela não encontrada, logar para debug
          if (!isTableNotFoundError(error)) {
            console.error("❌ [Produtos] Erro ao adicionar produto:", errorInfo);
          }
          
          return;
        }

        // Upload de imagem se houver
        if (product && product.id) {
          // TODO: Implementar upload quando necessário
        }

        toast({
          title: t('products.toast.added'),
          description: t('products.toast.addedDesc'),
        });
      }

      await loadProducts();
      setAddModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('common.error'),
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = (product: CatalogProduct) => {
    if (!product.isCustom) return;

    setEditingProduct(product);
    setAddModalOpen(true);
  };

  const handleDeleteProduct = async (product: CatalogProduct) => {
    if (!user || !product.isCustom || !product.customId) return;

    if (!confirm(t('common.confirm'))) return;

    try {
      const { error } = await deleteCustomProduct(product.customId, user.id);
      if (error) throw error;

      toast({
        title: t('products.toast.deleted'),
        description: t('products.toast.deletedDesc'),
      });

      await loadProducts();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      toast({
        title: t('common.error'),
        description: t('common.error'),
        variant: "destructive",
      });
    }
  };

  const handleCategoryFilter = (category: ProductCategory | undefined) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === category ? undefined : category,
    }));
  };
  
  // Helper to translate categories
  const getCategoryLabel = (cat: string) => {
    // @ts-ignore
    return t(`products.categories.${cat}`) || cat;
  };

  return (
    <div className="pt-4 pb-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
            <Package size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-[20px] font-bold text-gray-900">{t('products.catalog')}</h1>
            <p className="text-[12px] text-gray-500">
              {filteredProducts.length} {filteredProducts.length !== 1 ? t('favorites.products').toLowerCase() : t('calc.product').toLowerCase()}
            </p>
          </div>
          <Button
            onClick={() => loadProducts(true)}
            disabled={loading}
            variant="outline"
            size="sm"
            className="h-9 px-3 rounded-xl"
            title={t('products.reloadCatalog')}
          >
            <RefreshCw size={16} className={cn("mr-2", loading && "animate-spin")} />
            {t('favorites.reload')}
          </Button>
        </div>

        {/* Busca e Filtro */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={t('products.searchPlaceholder')}
              value={filters.search || ""}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="h-11 pl-10 rounded-xl bg-white border-gray-200"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-xl"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
          </Button>
        </div>

        {/* Filtros por categoria */}
        {showFilters && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.showOnlyCustom ? "default" : "outline"}
                size="sm"
                className="h-8 text-[11px] rounded-full"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, showOnlyCustom: !prev.showOnlyCustom }))
                }
              >
                {t('products.myProducts')}
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={filters.category === cat ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-8 text-[11px] rounded-full",
                    filters.category === cat && "bg-green-500 text-white"
                  )}
                  onClick={() => handleCategoryFilter(cat)}
                >
                  {getCategoryLabel(cat)}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Botão Adicionar Produto */}
      <div className="mb-4">
        <Button
          onClick={() => {
            setEditingProduct(null);
            setAddModalOpen(true);
          }}
          className="w-full h-12 bg-green-500 text-white rounded-xl hover:bg-green-600 font-semibold"
        >
          <Plus size={18} className="mr-2" />
          {t('products.addMyProduct')}
        </Button>
      </div>

      {/* Lista de Produtos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-[14px]">{t('products.loading')}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-[14px]">
            {filters.search || filters.category
              ? t('products.noProductsFound')
              : t('products.noProductsRegistered')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Separar produtos custom dos padrão */}
          {(() => {
            const customProducts = filteredProducts.filter((p) => p.isCustom);
            const defaultProducts = filteredProducts.filter((p) => !p.isCustom);

            return (
              <>
                {/* Seção: Meus Produtos (apenas custom) */}
                {customProducts.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h2 className="text-[14px] font-semibold text-gray-900">{t('products.myProducts')}</h2>
                      <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20">
                        {customProducts.length}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {customProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onUse={handleUseProduct}
                          onDetails={handleDetails}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Seção: Catálogo Público (produtos padrão) */}
                {defaultProducts.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h2 className="text-[14px] font-semibold text-gray-900">{t('products.publicCatalog')}</h2>
                      <Badge variant="outline" className="text-[10px] text-gray-600">
                        {defaultProducts.length}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {defaultProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onUse={handleUseProduct}
                          onDetails={handleDetails}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Sheet de Detalhes */}
      <ProductDetailsSheet
        product={selectedProduct}
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedProduct(null);
        }}
        onUse={handleUseProduct}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />

      {/* Modal Adicionar/Editar Produto */}
      <AddProductModal
        open={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleAddProduct}
        editingProduct={
          editingProduct
            ? {
                id: editingProduct.customId || "",
                name: editingProduct.name,
                category: editingProduct.category,
                description: editingProduct.details?.description || "",
                doseValue: editingProduct.doseValue,
                doseUnit: editingProduct.doseUnit,
                doseMin: editingProduct.details?.doseMin,
                doseMax: editingProduct.details?.doseMax,
                recommendations: editingProduct.details?.recommendations,
                notes: editingProduct.details?.notes,
                imageUrl: editingProduct.imageUrl,
              }
            : null
        }
      />
    </div>
  );
}

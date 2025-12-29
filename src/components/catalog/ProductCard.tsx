import { Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CatalogProduct } from "@/types/product";

interface ProductCardProps {
  product: CatalogProduct;
  onUse: (product: CatalogProduct) => void;
  onDetails: (product: CatalogProduct) => void;
}

const categoryColors: Record<string, string> = {
  Herbicida: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Inseticida: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Fungicida: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Fertilizante: "bg-green-500/10 text-green-500 border-green-500/20",
  Adjuvante: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export function ProductCard({ product, onUse, onDetails }: ProductCardProps) {
  const categoryColor = categoryColors[product.category] || categoryColors.Adjuvante;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-3 p-4">
        {/* Imagem do produto */}
        <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback se imagem não carregar
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                if (target.nextElementSibling) {
                  (target.nextElementSibling as HTMLElement).style.display = "flex";
                }
              }}
            />
          ) : null}
          <div
            className={cn(
              "w-full h-full flex items-center justify-center",
              product.imageUrl ? "hidden" : "flex"
            )}
          >
            <Package size={32} className="text-gray-400" />
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            {/* Nome e Badge */}
            <div className="flex items-start gap-2 mb-1.5">
              <h3 className="text-[15px] font-bold text-gray-900 flex-1 line-clamp-1">
                {product.name}
              </h3>
              {product.isCustom && (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 bg-green-500/10 text-green-600 border-green-500/20 flex-shrink-0"
                >
                  Meu
                </Badge>
              )}
            </div>

            {/* Categoria */}
            <Badge
              variant="outline"
              className={cn("text-[10px] px-2 py-0.5 mb-2 inline-block", categoryColor)}
            >
              {product.category}
            </Badge>

            {/* Dose recomendada */}
            <p className="text-[12px] text-gray-600 mb-1">
              <span className="font-semibold text-gray-900">
                {product.doseValue} {product.doseUnit}/ha
              </span>
            </p>

            {/* Indicação (1 linha) */}
            <p className="text-[11px] text-gray-500 line-clamp-1">
              {product.indication}
            </p>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <Button
            onClick={() => onUse(product)}
            className="h-9 px-3 bg-green-500 text-white text-[11px] font-semibold rounded-xl hover:bg-green-600 whitespace-nowrap"
          >
            Usar
            <ArrowRight size={12} className="ml-1" />
          </Button>
          <Button
            onClick={() => onDetails(product)}
            variant="outline"
            className="h-8 px-3 text-[11px] rounded-xl border-gray-300"
          >
            Detalhes
          </Button>
        </div>
      </div>
    </div>
  );
}





import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Package, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CatalogProduct } from "@/types/product";

interface ProductDetailsSheetProps {
  product: CatalogProduct | null;
  open: boolean;
  onClose: () => void;
  onUse: (product: CatalogProduct) => void;
  onEdit?: (product: CatalogProduct) => void;
  onDelete?: (product: CatalogProduct) => void;
}

const categoryColors: Record<string, string> = {
  Herbicida: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Inseticida: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Fungicida: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Fertilizante: "bg-green-500/10 text-green-500 border-green-500/20",
  Adjuvante: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export function ProductDetailsSheet({
  product,
  open,
  onClose,
  onUse,
  onEdit,
  onDelete,
}: ProductDetailsSheetProps) {
  if (!product) return null;

  const categoryColor = categoryColors[product.category] || categoryColors.Adjuvante;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto bg-[#ffffff]">
        <SheetHeader>
          <div className="flex items-start gap-4 mb-4">
            {/* Imagem */}
            <div className="w-24 h-24 rounded-2xl bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
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
                <Package size={40} className="text-gray-400" />
              </div>
            </div>

            <div className="flex-1">
              <SheetTitle className="text-[20px] font-bold text-gray-900 mb-2">
                {product.name}
              </SheetTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={cn("text-[11px] px-2 py-1", categoryColor)}
                >
                  {product.category}
                </Badge>
                {product.isCustom && (
                  <Badge
                    variant="outline"
                    className="text-[11px] px-2 py-1 bg-green-500/10 text-green-600 border-green-500/20"
                  >
                    Meu produto
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </SheetHeader>

        <SheetDescription asChild>
          <div className="space-y-6">
            {/* Dose recomendada */}
            <div>
              <h4 className="text-[13px] font-semibold text-gray-900 mb-2">Dose Recomendada</h4>
              <p className="text-[15px] text-gray-700">
                <span className="font-bold text-gray-900">
                  {product.doseValue} {product.doseUnit}/ha
                </span>
                {product.details?.doseMin && product.details?.doseMax && (
                  <span className="text-gray-500 ml-2">
                    (Faixa: {product.details.doseMin} - {product.details.doseMax} {product.doseUnit}/ha)
                  </span>
                )}
              </p>
            </div>

            {/* Descrição */}
            {product.details?.description && (
              <div>
                <h4 className="text-[13px] font-semibold text-gray-900 mb-2">Descrição</h4>
                <p className="text-[14px] text-gray-700 leading-relaxed">
                  {product.details.description}
                </p>
              </div>
            )}

            {/* Recomendações */}
            {product.details?.recommendations && (
              <div>
                <h4 className="text-[13px] font-semibold text-gray-900 mb-2">Recomendações</h4>
                <p className="text-[14px] text-gray-700 leading-relaxed">
                  {product.details.recommendations}
                </p>
              </div>
            )}

            {/* Observações */}
            {product.details?.notes && (
              <div>
                <h4 className="text-[13px] font-semibold text-gray-900 mb-2">Observações</h4>
                <p className="text-[14px] text-gray-700 leading-relaxed">
                  {product.details.notes}
                </p>
              </div>
            )}

            {/* Compatibilidade */}
            {product.details?.compatibility && (
              <div>
                <h4 className="text-[13px] font-semibold text-gray-900 mb-2">
                  Compatibilidade de Mistura
                </h4>
                <p className="text-[14px] text-gray-700 leading-relaxed">
                  {product.details.compatibility}
                </p>
              </div>
            )}

            {/* Badges adicionais */}
            {product.badges && (
              <div>
                <h4 className="text-[13px] font-semibold text-gray-900 mb-2">Especificações</h4>
                <div className="flex flex-wrap gap-2">
                  {product.badges.class && (
                    <Badge variant="outline" className="text-[11px]">
                      Classe: {product.badges.class}
                    </Badge>
                  )}
                  {product.badges.type && (
                    <Badge variant="outline" className="text-[11px]">
                      Tipo: {product.badges.type}
                    </Badge>
                  )}
                  {product.badges.periculosidade && (
                    <Badge variant="outline" className="text-[11px]">
                      {product.badges.periculosidade}
                    </Badge>
                  )}
                  {product.badges.intervaloSeguranca && (
                    <Badge variant="outline" className="text-[11px]">
                      Intervalo: {product.badges.intervaloSeguranca}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              {/* Botões de editar/excluir para produtos custom */}
              {product.isCustom && (onEdit || onDelete) && (
                <div className="flex gap-2">
                  {onEdit && (
                    <Button
                      onClick={() => {
                        onEdit(product);
                        onClose();
                      }}
                      variant="outline"
                      className="flex-1 h-11 rounded-xl"
                    >
                      <Edit size={16} className="mr-2" />
                      Editar
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      onClick={() => {
                        if (confirm("Tem certeza que deseja excluir este produto?")) {
                          onDelete(product);
                          onClose();
                        }
                      }}
                      variant="destructive"
                      className="flex-1 h-11 rounded-xl"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Excluir
                    </Button>
                  )}
                </div>
              )}

              {/* Botão Usar no cálculo */}
              <Button
                onClick={() => {
                  onUse(product);
                  onClose();
                }}
                className="w-full h-12 bg-green-500 text-white text-[14px] font-semibold rounded-full hover:bg-green-600"
              >
                Usar no cálculo
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </SheetDescription>
      </SheetContent>
    </Sheet>
  );
}


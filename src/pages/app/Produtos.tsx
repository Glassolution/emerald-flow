import { useNavigate } from "react-router-dom";
import { Package, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { produtosAgricolas, type Product, type ProductType } from "@/lib/products";
import { Badge } from "@/components/ui/badge";

const coresPorTipo: Record<ProductType, string> = {
  Herbicida: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Inseticida: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Fungicida: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Fertilizante: "bg-green-500/10 text-green-500 border-green-500/20",
};

export default function Produtos() {
  const navigate = useNavigate();

  const handleUsarNoCalculo = (produto: Product) => {
    // Navegar para a calculadora passando o produto via state
    navigate("/app/calc", {
      state: {
        produtoSelecionado: produto,
      },
    });
  };

  return (
    <div className="pt-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <Package size={20} className="text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-[20px] font-bold text-foreground">Catálogo de Produtos</h1>
          <p className="text-[12px] text-muted-foreground">
            Selecione um produto para usar no cálculo da calda
          </p>
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="space-y-4">
        {produtosAgricolas.map((produto) => (
          <Card
            key={produto.id}
            className="p-4 bg-card border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                {/* Nome e Tipo */}
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-[16px] font-semibold text-foreground">{produto.nome}</h3>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-2 py-0.5 ${coresPorTipo[produto.tipo]}`}
                  >
                    {produto.tipo}
                  </Badge>
                </div>

                {/* Dose Padrão */}
                <p className="text-[13px] text-muted-foreground">
                  Dose padrão: <span className="font-medium text-foreground">{produto.dosePadrao} {produto.unidade}/ha</span>
                </p>
              </div>

              {/* Botão Usar no Cálculo */}
              <Button
                onClick={() => handleUsarNoCalculo(produto)}
                className="h-10 px-4 bg-primary text-primary-foreground text-[12px] font-semibold rounded-xl whitespace-nowrap"
              >
                Usar no cálculo
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Mensagem informativa */}
      {produtosAgricolas.length === 0 && (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-[14px]">
            Nenhum produto cadastrado ainda.
          </p>
        </div>
      )}
    </div>
  );
}


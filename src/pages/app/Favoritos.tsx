import { Heart } from "lucide-react";

export default function Favoritos() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-center animate-fade-in">
      <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
        <Heart size={32} className="text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">Seus Favoritos</h2>
      <p className="text-sm text-muted-foreground max-w-[250px]">
        Salve seus cálculos e receitas preferidas para acessar rapidamente aqui.
      </p>
    </div>
  );
}


import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Implement actual password recovery with Supabase
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSuccess(true);
    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="animate-fade-in text-center">
        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-primary" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-2">Verifique seu e-mail</h1>
        <p className="text-muted-foreground mb-8">
          Enviamos um link de recuperação para <strong className="text-foreground">{email}</strong>. 
          Verifique sua caixa de entrada e siga as instruções.
        </p>

        <div className="space-y-4">
          <Button variant="outline" className="w-full h-12" asChild>
            <Link to="/auth/login">
              <ArrowLeft size={18} />
              Voltar para o login
            </Link>
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Não recebeu o e-mail?{" "}
            <button 
              onClick={() => setIsSuccess(false)}
              className="text-primary hover:underline"
            >
              Tentar novamente
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Link 
        to="/auth/login" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Voltar para o login
      </Link>
      
      <h1 className="text-3xl font-bold text-foreground mb-2">Recuperar senha</h1>
      <p className="text-muted-foreground mb-8">
        Digite seu e-mail e enviaremos um link para redefinir sua senha
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12"
          />
        </div>

        <Button type="submit" size="lg" className="w-full h-12" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Enviando...
            </>
          ) : (
            "Enviar link de recuperação"
          )}
        </Button>
      </form>
    </div>
  );
}

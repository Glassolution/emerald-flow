import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Cadastro() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    company: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: "Mínimo 8 caracteres" },
    { met: /[A-Z]/.test(formData.password), text: "Uma letra maiúscula" },
    { met: /[0-9]/.test(formData.password), text: "Um número" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeTerms) {
      toast({
        title: "Termos necessários",
        description: "Você precisa aceitar os termos para continuar.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // TODO: Implement actual signup with Supabase
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "O cadastro será ativado após conectar o backend.",
    });
    
    setIsLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-foreground mb-2">Crie sua conta</h1>
      <p className="text-muted-foreground mb-8">
        Comece seu teste grátis de 14 dias
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Seu nome"
              value={formData.name}
              onChange={handleChange}
              required
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              name="company"
              type="text"
              placeholder="Nome da empresa"
              value={formData.company}
              onChange={handleChange}
              required
              className="h-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail corporativo</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="seu@empresa.com"
            value={formData.email}
            onChange={handleChange}
            required
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Crie uma senha forte"
              value={formData.password}
              onChange={handleChange}
              required
              className="h-12 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          {/* Password Requirements */}
          <div className="flex flex-wrap gap-3 mt-3">
            {passwordRequirements.map((req, i) => (
              <div 
                key={i}
                className={`flex items-center gap-1.5 text-xs ${
                  req.met ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <CheckCircle size={14} className={req.met ? "opacity-100" : "opacity-30"} />
                {req.text}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-3 py-2">
          <Checkbox 
            id="terms" 
            checked={agreeTerms}
            onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
          />
          <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
            Li e aceito os{" "}
            <Link to="/termos" className="text-primary hover:underline">
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link to="/privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
          </Label>
        </div>

        <Button 
          type="submit" 
          size="lg" 
          className="w-full h-12" 
          disabled={isLoading || !agreeTerms}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Criando conta...
            </>
          ) : (
            "Criar conta grátis"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-8">
        Já tem uma conta?{" "}
        <Link to="/auth/login" className="text-primary font-medium hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}

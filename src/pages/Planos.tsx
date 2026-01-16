import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, MessageCircle, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    description: "Para experimentar",
    features: [
      { text: "1 usuário", included: true },
      { text: "5 documentos", included: true },
      { text: "Chat IA limitado", included: true },
      { text: "Métricas básicas", included: false },
      { text: "Integrações", included: false },
    ],
    cta: "Começar grátis",
    highlighted: false
  },
  {
    name: "Pro",
    price: "R$ 97",
    period: "/mês",
    description: "Para pequenas empresas",
    features: [
      { text: "5 usuários", included: true },
      { text: "Documentos ilimitados", included: true },
      { text: "Chat IA ilimitado", included: true },
      { text: "Métricas completas", included: true },
      { text: "Integrações básicas", included: true },
    ],
    cta: "Assinar Pro",
    highlighted: true
  },
  {
    name: "Business",
    price: "R$ 297",
    period: "/mês",
    description: "Para empresas",
    features: [
      { text: "Usuários ilimitados", included: true },
      { text: "Documentos ilimitados", included: true },
      { text: "Chat IA avançado", included: true },
      { text: "Métricas avançadas", included: true },
      { text: "Todas integrações", included: true },
    ],
    cta: "Assinar Business",
    highlighted: false
  }
];

export default function Planos() {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  return (
    <div 
      className="min-h-screen min-h-[100dvh] bg-background flex flex-col"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Header */}
      <header className="px-5 pt-4 pb-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="back-button">
            <ChevronLeft size={24} className="text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Planos</h1>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4">
          <span className={`text-sm font-medium ${billingPeriod === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
            Mensal
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
            className="relative w-14 h-8 bg-secondary rounded-full"
          >
            <span 
              className={`absolute top-1 w-6 h-6 bg-primary rounded-full transition-all ${
                billingPeriod === "yearly" ? "left-7" : "left-1"
              }`} 
            />
          </button>
          <span className={`text-sm font-medium ${billingPeriod === "yearly" ? "text-foreground" : "text-muted-foreground"}`}>
            Anual
            <span className="text-accent text-xs ml-1">-20%</span>
          </span>
        </div>
      </header>

      {/* Plans */}
      <main className="flex-1 px-5 pb-8 space-y-4">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={`card-mobile p-6 animate-fade-up ${
              plan.highlighted ? "ring-2 ring-primary" : ""
            }`}
          >
            {plan.highlighted && (
              <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full mb-4">
                Mais popular
              </span>
            )}
            
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              <div>
                <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  {feature.included ? (
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                      <Check size={12} className="text-accent" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                      <X size={12} className="text-muted-foreground" />
                    </div>
                  )}
                  <span className={`text-sm ${feature.included ? "text-foreground" : "text-muted-foreground"}`}>
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <Button 
              className="w-full h-12 rounded-2xl font-semibold" 
              variant={plan.highlighted ? "default" : "secondary"}
            >
              {plan.cta}
            </Button>
          </div>
        ))}

        {/* Contact Section */}
        <div className="card-mobile p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Precisa de um plano customizado?
          </p>
          <Button variant="secondary" className="h-12 rounded-2xl px-6" asChild>
            <a 
              href="https://wa.me/5511921594404" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <MessageCircle size={20} className="mr-2" />
              Falar com vendas
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
}

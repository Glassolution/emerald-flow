import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const plans = [
  {
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    description: "Para experimentar a plataforma",
    features: [
      { text: "1 usuário", included: true },
      { text: "5 documentos", included: true },
      { text: "Chat IA (limitado)", included: true },
      { text: "Suporte por e-mail", included: true },
      { text: "Métricas básicas", included: false },
      { text: "Integrações", included: false },
      { text: "API", included: false },
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
      { text: "Suporte prioritário", included: true },
      { text: "Métricas completas", included: true },
      { text: "Integrações básicas", included: true },
      { text: "API", included: false },
    ],
    cta: "Assinar Pro",
    highlighted: true
  },
  {
    name: "Business",
    price: "R$ 297",
    period: "/mês",
    description: "Para empresas em crescimento",
    features: [
      { text: "Usuários ilimitados", included: true },
      { text: "Documentos ilimitados", included: true },
      { text: "Chat IA avançado", included: true },
      { text: "Suporte 24/7", included: true },
      { text: "Métricas avançadas", included: true },
      { text: "Todas as integrações", included: true },
      { text: "API completa", included: true },
    ],
    cta: "Assinar Business",
    highlighted: false
  }
];

export default function Planos() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Escolha o plano ideal para você
            </h1>
            <p className="text-lg text-muted-foreground">
              Comece grátis e atualize quando precisar. Cancele a qualquer momento.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className={billingPeriod === "monthly" ? "text-foreground font-medium" : "text-muted-foreground"}>
                Mensal
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
                className="relative w-14 h-7 bg-secondary rounded-full transition-colors"
              >
                <span 
                  className={`absolute top-0.5 w-6 h-6 bg-primary rounded-full transition-all ${
                    billingPeriod === "yearly" ? "left-7" : "left-0.5"
                  }`} 
                />
              </button>
              <span className={billingPeriod === "yearly" ? "text-foreground font-medium" : "text-muted-foreground"}>
                Anual <span className="text-primary text-sm">(-20%)</span>
              </span>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.name}
                className={`rounded-2xl p-8 transition-all ${
                  plan.highlighted 
                    ? "bg-foreground text-background shadow-xl scale-105 relative" 
                    : "bg-card border border-border"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                    Mais popular
                  </div>
                )}
                
                <h3 className={`text-xl font-bold mb-2 ${plan.highlighted ? "" : "text-foreground"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.highlighted ? "text-background/70" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={plan.highlighted ? "text-background/70" : "text-muted-foreground"}>
                    {plan.period}
                  </span>
                </div>

                <Button 
                  className="w-full mb-8" 
                  variant={plan.highlighted ? "hero" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                </Button>

                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check size={18} className={plan.highlighted ? "text-primary" : "text-primary"} />
                      ) : (
                        <X size={18} className={plan.highlighted ? "text-background/30" : "text-muted-foreground/50"} />
                      )}
                      <span className={`text-sm ${
                        feature.included 
                          ? "" 
                          : plan.highlighted ? "text-background/50" : "text-muted-foreground"
                      }`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-4">
              Precisa de um plano customizado para sua empresa?
            </p>
            <Button variant="outline" size="lg" asChild>
              <a 
                href="https://wa.me/5511921594404" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <MessageCircle size={20} />
                Falar com vendas
              </a>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  CheckCircle, 
  Zap, 
  Shield, 
  BarChart3, 
  Users, 
  MessageSquare,
  Star
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const features = [
  {
    icon: Zap,
    title: "Automação Inteligente",
    description: "Automatize tarefas repetitivas e foque no que realmente importa para seu negócio."
  },
  {
    icon: BarChart3,
    title: "Métricas em Tempo Real",
    description: "Acompanhe o desempenho do seu negócio com dashboards personalizados e intuitivos."
  },
  {
    icon: Users,
    title: "Gestão de Equipe",
    description: "Organize sua equipe, defina permissões e acompanhe a produtividade de cada membro."
  },
  {
    icon: MessageSquare,
    title: "Chat com IA",
    description: "Assistente inteligente disponível 24/7 para ajudar sua equipe a tomar decisões."
  },
  {
    icon: Shield,
    title: "Segurança Avançada",
    description: "Seus dados protegidos com criptografia de ponta e controle de acesso granular."
  },
  {
    icon: CheckCircle,
    title: "Fácil Integração",
    description: "Conecte-se com suas ferramentas favoritas em poucos cliques."
  }
];

const testimonials = [
  {
    name: "Carlos Silva",
    role: "CEO, TechBR",
    content: "O ELO transformou completamente a forma como gerenciamos nossa empresa. A produtividade aumentou 40%.",
    rating: 5
  },
  {
    name: "Ana Costa",
    role: "Diretora de Operações, Inovare",
    content: "A interface é incrivelmente intuitiva. Nossa equipe se adaptou em menos de uma semana.",
    rating: 5
  },
  {
    name: "Roberto Lima",
    role: "Fundador, StartupX",
    content: "O melhor investimento que fizemos este ano. O suporte ao cliente é excepcional.",
    rating: 5
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-8 animate-fade-up">
            <Zap size={16} />
            <span>Novo: Integração com IA generativa</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
            Conecte todas as áreas do seu negócio em{" "}
            <span className="text-primary">um só lugar</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "200ms" }}>
            ELO é a plataforma que simplifica a gestão da sua empresa. 
            Automação, métricas, equipe e IA — tudo integrado para você crescer mais rápido.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "300ms" }}>
            <Button size="xl" asChild>
              <Link to="/auth/cadastro">
                Começar grátis
                <ArrowRight size={20} />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link to="/demo">Ver demonstração</Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: "400ms" }}>
            ✓ Sem cartão de crédito &nbsp; ✓ 14 dias grátis &nbsp; ✓ Cancele quando quiser
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground">5.000+</p>
              <p className="text-muted-foreground mt-1">Empresas ativas</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground">98%</p>
              <p className="text-muted-foreground mt-1">Satisfação</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground">40%</p>
              <p className="text-muted-foreground mt-1">Mais produtividade</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground">24/7</p>
              <p className="text-muted-foreground mt-1">Suporte</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Tudo que você precisa para crescer
            </h2>
            <p className="text-lg text-muted-foreground">
              Ferramentas poderosas para cada aspecto do seu negócio, integradas em uma plataforma única.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title} 
                className="card-interactive p-8"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-6">
                  <feature.icon size={24} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-foreground text-background">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Empresas que confiam no ELO
            </h2>
            <p className="text-lg text-background/70">
              Descubra como outras empresas estão transformando seus negócios.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.name}
                className="bg-background/5 rounded-2xl p-8 border border-background/10"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} size={18} className="fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-background/90 mb-6">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-background/60">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="bg-primary rounded-3xl p-12 md:p-16 text-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para transformar seu negócio?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de empresas que já estão crescendo com o ELO.
            </p>
            <Button size="xl" variant="hero" asChild>
              <Link to="/auth/cadastro">
                Começar agora — É grátis
                <ArrowRight size={20} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

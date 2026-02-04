import { useState } from "react";
import { Search, BookOpen, HelpCircle, MessageCircle, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";

export default function Ajuda() {
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useI18n();

  const categories = [
    { 
      id: "conta", 
      name: t('help.categories.account.name'), 
      icon: "👤",
      description: t('help.categories.account.desc'),
      articleCount: 12 
    },
    { 
      id: "planos", 
      name: t('help.categories.plans.name'), 
      icon: "💳",
      description: t('help.categories.plans.desc'),
      articleCount: 8 
    },
    { 
      id: "ia", 
      name: t('help.categories.ai.name'), 
      icon: "🤖",
      description: t('help.categories.ai.desc'),
      articleCount: 15 
    },
    { 
      id: "integrações", 
      name: t('help.categories.integrations.name'), 
      icon: "🔗",
      description: t('help.categories.integrations.desc'),
      articleCount: 10 
    },
    { 
      id: "equipe", 
      name: t('help.categories.team.name'), 
      icon: "👥",
      description: t('help.categories.team.desc'),
      articleCount: 7 
    },
    { 
      id: "inicio", 
      name: t('help.categories.start.name'), 
      icon: "🚀",
      description: t('help.categories.start.desc'),
      articleCount: 5 
    },
  ];

  const popularArticles = [
    { title: "Como criar minha primeira automação", category: "ia", views: 2847 },
    { title: "Gerenciando permissões da equipe", category: "equipe", views: 1923 },
    { title: "Como cancelar minha assinatura", category: "planos", views: 1654 },
    { title: "Conectando com Google Workspace", category: "integrações", views: 1432 },
    { title: "Alterando informações da conta", category: "conta", views: 1287 },
  ];

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24">
        {/* Hero */}
        <section className="bg-foreground text-background py-16 px-4">
          <div className="container mx-auto text-center max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">{t('help.title')}</h1>
            <p className="text-background/70 mb-8">
              {t('help.subtitle')}
            </p>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder={t('help.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-4 text-lg bg-background text-foreground border-0"
              />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8">{t('help.categoriesTitle')}</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/ajuda/categoria/${category.id}`}
                  className="card-interactive p-6 flex items-start gap-4"
                >
                  <span className="text-3xl">{category.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                    <span className="text-xs text-muted-foreground">{category.articleCount} {t('help.articles')}</span>
                  </div>
                  <ChevronRight size={20} className="text-muted-foreground mt-1" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Articles */}
        <section className="py-16 px-4 bg-secondary/30">
          <div className="container mx-auto">
            <div className="flex items-center gap-2 mb-8">
              <BookOpen size={24} className="text-primary" />
              <h2 className="text-2xl font-bold text-foreground">{t('help.popularArticlesTitle')}</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {popularArticles.map((article, index) => (
                <Link
                  key={index}
                  to={`/ajuda/artigo/${index}`}
                  className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors"
                >
                  <div>
                    <h3 className="font-medium text-foreground mb-1">{article.title}</h3>
                    <span className="text-xs text-muted-foreground capitalize">{article.category}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{article.views.toLocaleString()} {t('help.views')}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16 px-4">
          <div className="container mx-auto text-center max-w-2xl">
            <HelpCircle size={48} className="text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('help.notFoundTitle')}</h2>
            <p className="text-muted-foreground mb-8">
              {t('help.notFoundDesc')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="mailto:suporte@calc.com.br">
                  <MessageCircle size={20} />
                  {t('help.sendMessage')}
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a 
                  href="https://wa.me/5511921594404" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {t('help.whatsapp')}
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

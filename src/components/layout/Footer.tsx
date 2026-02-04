import { Link } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";

export function Footer() {
  const { t } = useI18n();
  
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">C</span>
              </div>
              <span className="font-bold text-xl">Calc</span>
            </div>
            <p className="text-background/70 text-sm">
              {t('footer.slogan')}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.product')}</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/recursos" className="text-background/70 hover:text-background transition-colors">
                  {t('footer.resources')}
                </Link>
              </li>
              <li>
                <Link to="/planos" className="text-background/70 hover:text-background transition-colors">
                  {t('footer.plans')}
                </Link>
              </li>
              <li>
                <Link to="/integrações" className="text-background/70 hover:text-background transition-colors">
                  {t('footer.integrations')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.support')}</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/ajuda" className="text-background/70 hover:text-background transition-colors">
                  {t('footer.helpCenter')}
                </Link>
              </li>
              <li>
                <Link to="/ajuda/contato" className="text-background/70 hover:text-background transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <a 
                  href="https://wa.me/5511921594404" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  {t('footer.whatsapp')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/privacidade" className="text-background/70 hover:text-background transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link to="/termos" className="text-background/70 hover:text-background transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-background/20 my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-background/60">
            © {new Date().getFullYear()} Calc. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-background/60 hover:text-background transition-colors">
              Instagram
            </a>
            <a href="#" className="text-background/60 hover:text-background transition-colors">
              LinkedIn
            </a>
            <a href="#" className="text-background/60 hover:text-background transition-colors">
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

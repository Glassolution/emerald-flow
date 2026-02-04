import { NavLink, useLocation } from "react-router-dom";
import { Home, Calculator, Package, History, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/I18nContext";

export function BottomNavigation() {
  const location = useLocation();
  const { t } = useI18n();

  const navItems = [
    { path: "/app/home", icon: Home, label: t('navigation.home') },
    { path: "/app/produtos", icon: Package, label: t('navigation.products') },
    { path: "/app/calc", icon: Plus, label: t('navigation.calculate'), isCenter: true },
    { path: "/app/favoritos", icon: History, label: t('navigation.history') },
    { path: "/app/perfil", icon: User, label: t('navigation.profile') },
  ];

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pb-2 pt-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]" style={{ paddingBottom: `calc(0.5rem + env(safe-area-inset-bottom, 0px))` }}>
      <nav className="flex items-center justify-around w-full relative h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          if (item.isCenter) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center relative -top-5"
              onClick={() => {
                if (item.path === "/app/calc") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}>
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 active:scale-90",
                  isActive 
                    ? "bg-primary text-white scale-105" 
                    : "bg-[#1a1a1a] text-white hover:bg-primary"
                )}>
                  <Icon size={28} strokeWidth={3} />
                </div>
                <span className={cn(
                  "mt-1 text-[10px] font-bold transition-colors duration-200 whitespace-nowrap",
                  isActive ? "text-primary" : "text-[#8a8a8a]"
                )}>
                  {item.label}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-0.5 min-w-[64px] transition-all active:scale-95"
            onClick={() => {
              if (item.path === "/app/calc") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}>
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-[#8a8a8a]"
              )}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[10px] font-bold transition-colors duration-200",
                isActive ? "text-primary" : "text-[#8a8a8a]"
              )}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

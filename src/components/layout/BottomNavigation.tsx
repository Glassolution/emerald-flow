import { NavLink } from "react-router-dom";
import { Home, Calculator, Package, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/app/home", icon: Home, label: "Home" },
  { path: "/app/calc", icon: Calculator, label: "Calc" },
  { path: "/app/produtos", icon: Package, label: "Produtos" },
  { path: "/app/favoritos", icon: Heart, label: "Favoritos" },
  { path: "/app/perfil", icon: User, label: "Perfil" },
];

export function BottomNavigation() {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg px-4 pb-6 pt-2 border-t border-gray-100 safe-area-bottom">
      <nav className="bg-[#1a1a1a] rounded-2xl px-2 py-1.5 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center py-3 px-4 rounded-xl transition-all duration-200 min-w-[60px]",
                  isActive
                    ? "text-green-400 bg-green-500/10"
                    : "text-gray-400 active:text-white active:bg-white/5"
                )
              }
              aria-label={item.label}
            >
              {({ isActive }) => (
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

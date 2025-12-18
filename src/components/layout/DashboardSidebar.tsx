import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  HelpCircle, 
  BarChart3, 
  MessageSquare,
  FileText,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
  adminOnly?: boolean;
}

const mainNav: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/app" },
  { icon: MessageSquare, label: "Chat IA", href: "/app/chat" },
  { icon: FileText, label: "Documentos", href: "/app/documentos" },
  { icon: Users, label: "Equipe", href: "/app/equipe" },
];

const adminNav: NavItem[] = [
  { icon: BarChart3, label: "Métricas", href: "/app/admin/metricas", adminOnly: true },
];

const bottomNav: NavItem[] = [
  { icon: CreditCard, label: "Plano", href: "/app/plano" },
  { icon: Settings, label: "Configurações", href: "/app/configuracoes" },
  { icon: HelpCircle, label: "Ajuda", href: "/ajuda" },
];

export function DashboardSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  // TODO: Replace with actual user role from auth context
  const userRole = "owner";
  const isAdmin = userRole === "owner" || userRole === "admin";

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = location.pathname === item.href;
    
    return (
      <Link
        to={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
          isActive 
            ? "bg-sidebar-primary text-sidebar-primary-foreground" 
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        )}
      >
        <item.icon size={20} className={cn(
          "shrink-0",
          isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
        )} />
        {!collapsed && (
          <>
            <span className="flex-1 text-sm font-medium">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-sidebar-primary/20 text-sidebar-primary">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-40",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-lg">E</span>
            </div>
            <span className="font-bold text-lg text-sidebar-foreground">ELO</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <div className="space-y-1">
          {mainNav.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>

        {isAdmin && (
          <>
            <div className={cn("my-4", collapsed ? "mx-1" : "mx-3")}>
              <hr className="border-sidebar-border" />
            </div>
            {!collapsed && (
              <p className="px-3 mb-2 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
                Admin
              </p>
            )}
            <div className="space-y-1">
              {adminNav.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="space-y-1">
          {bottomNav.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
          <button
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
              "text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive"
            )}
          >
            <LogOut size={20} className="shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Sair</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

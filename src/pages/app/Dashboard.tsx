import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  MessageSquare, 
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const stats = [
  {
    label: "Usuários ativos",
    value: "1,247",
    change: "+12%",
    trend: "up",
    icon: Users
  },
  {
    label: "Conversões",
    value: "324",
    change: "+8.5%",
    trend: "up",
    icon: TrendingUp
  },
  {
    label: "Mensagens",
    value: "2,847",
    change: "-3%",
    trend: "down",
    icon: MessageSquare
  },
  {
    label: "Tempo médio",
    value: "4m 32s",
    change: "+18%",
    trend: "up",
    icon: Clock
  }
];

const recentActivity = [
  { action: "Novo usuário cadastrado", user: "Carlos Silva", time: "Há 5 min" },
  { action: "Documento criado", user: "Ana Costa", time: "Há 12 min" },
  { action: "Plano atualizado para Pro", user: "Roberto Lima", time: "Há 1 hora" },
  { action: "Integração ativada", user: "Maria Santos", time: "Há 2 horas" },
];

const tasks = [
  { title: "Revisar relatório mensal", status: "pending", priority: "high" },
  { title: "Atualizar documentação", status: "in_progress", priority: "medium" },
  { title: "Reunião com equipe", status: "completed", priority: "low" },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo de volta! Aqui está o resumo do seu negócio.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Exportar</Button>
          <Button>
            <BarChart3 size={18} />
            Ver métricas
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="card-elevated p-6">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <stat.icon size={20} className="text-primary" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === "up" ? "text-primary" : "text-destructive"
              }`}>
                {stat.trend === "up" ? (
                  <ArrowUpRight size={16} />
                ) : (
                  <ArrowDownRight size={16} />
                )}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Atividade recente</h2>
            <Button variant="ghost" size="sm">Ver tudo</Button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((item, index) => (
              <div 
                key={index}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-secondary-foreground">
                    {item.user.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.user}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Tarefas</h2>
            <Button variant="ghost" size="sm">+ Nova</Button>
          </div>
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
              >
                <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  task.status === "completed" 
                    ? "bg-primary border-primary" 
                    : "border-border"
                }`}>
                  {task.status === "completed" && (
                    <CheckCircle size={12} className="text-primary-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    task.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"
                  }`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      task.priority === "high" 
                        ? "bg-destructive/10 text-destructive"
                        : task.priority === "medium"
                        ? "bg-warning/10 text-warning"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Média" : "Baixa"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Ações rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            to="/app/chat"
            className="p-4 rounded-xl bg-accent hover:bg-accent/80 transition-colors text-center"
          >
            <MessageSquare size={24} className="text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Chat IA</p>
          </Link>
          <Link 
            to="/app/documentos"
            className="p-4 rounded-xl bg-accent hover:bg-accent/80 transition-colors text-center"
          >
            <BarChart3 size={24} className="text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Documentos</p>
          </Link>
          <Link 
            to="/app/equipe"
            className="p-4 rounded-xl bg-accent hover:bg-accent/80 transition-colors text-center"
          >
            <Users size={24} className="text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Equipe</p>
          </Link>
          <Link 
            to="/app/configuracoes"
            className="p-4 rounded-xl bg-accent hover:bg-accent/80 transition-colors text-center"
          >
            <TrendingUp size={24} className="text-primary mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">Configurações</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

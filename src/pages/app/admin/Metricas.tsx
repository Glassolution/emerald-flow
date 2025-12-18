import { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  CreditCard, 
  MousePointer,
  Eye,
  ShoppingCart,
  Download,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const metrics = [
  {
    label: "Visitas na Landing",
    value: "12,847",
    change: "+18.2%",
    trend: "up",
    icon: Eye
  },
  {
    label: "Acessos ao App",
    value: "4,392",
    change: "+8.5%",
    trend: "up",
    icon: Users
  },
  {
    label: "Visitas Página de Pagamento",
    value: "1,247",
    change: "+12%",
    trend: "up",
    icon: ShoppingCart
  },
  {
    label: "Cliques no Botão Pagar",
    value: "892",
    change: "-3.2%",
    trend: "down",
    icon: MousePointer
  },
  {
    label: "Pagamentos Aprovados",
    value: "324",
    change: "+15.4%",
    trend: "up",
    icon: CreditCard
  },
  {
    label: "Taxa de Conversão",
    value: "36.3%",
    change: "+4.1%",
    trend: "up",
    icon: TrendingUp
  }
];

const funnelData = [
  { stage: "Landing", count: 12847, percentage: 100 },
  { stage: "Cadastro", count: 4392, percentage: 34.2 },
  { stage: "Onboarding", count: 3124, percentage: 24.3 },
  { stage: "Checkout", count: 1247, percentage: 9.7 },
  { stage: "Pagamento", count: 324, percentage: 2.5 },
];

const planConversions = [
  { plan: "Free", users: 2847, percentage: 65 },
  { plan: "Pro", users: 892, percentage: 20 },
  { plan: "Business", users: 324, percentage: 7.4 },
  { plan: "Enterprise", users: 42, percentage: 1 },
];

export default function AdminMetricas() {
  const [period, setPeriod] = useState("30d");

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Métricas</h1>
          <p className="text-muted-foreground">Painel de análise de funil e conversões</p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <Calendar size={16} className="mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="year">Este ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download size={18} />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="card-elevated p-6">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <metric.icon size={20} className="text-primary" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                metric.trend === "up" ? "text-primary" : "text-destructive"
              }`}>
                {metric.trend === "up" ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                {metric.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">{metric.value}</p>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Funnel */}
      <div className="card-elevated p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Funil de Conversão</h2>
        </div>
        
        <div className="space-y-4">
          {funnelData.map((item, index) => (
            <div key={item.stage}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs font-medium text-accent-foreground">
                    {index + 1}
                  </span>
                  <span className="font-medium text-foreground">{item.stage}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">{item.count.toLocaleString()} usuários</span>
                  <span className="font-medium text-foreground w-16 text-right">{item.percentage}%</span>
                </div>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversions by Plan */}
      <div className="card-elevated p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CreditCard size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Conversões por Plano</h2>
          </div>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6">
          {planConversions.map((plan) => (
            <div key={plan.plan} className="text-center p-4 rounded-xl bg-secondary/50">
              <p className="text-2xl font-bold text-foreground">{plan.users}</p>
              <p className="text-sm text-muted-foreground mb-2">{plan.plan}</p>
              <span className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground">
                {plan.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Abandonment Alert */}
      <div className="p-6 rounded-xl border-2 border-warning/20 bg-warning/5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center shrink-0">
            <TrendingDown size={20} className="text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Taxa de abandono do checkout</h3>
            <p className="text-muted-foreground text-sm mb-3">
              71.5% dos usuários abandonam o checkout antes de completar o pagamento. 
              Considere revisar o fluxo de pagamento ou adicionar incentivos.
            </p>
            <Button variant="outline" size="sm">Ver detalhes</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

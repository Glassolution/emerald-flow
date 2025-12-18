import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Building2, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Camera
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Configuracoes() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Configurações salvas",
      description: "Suas alterações foram salvas com sucesso."
    });
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Gerencie sua conta e preferências</p>
      </div>

      <Tabs defaultValue="perfil" className="space-y-8">
        <TabsList className="bg-secondary">
          <TabsTrigger value="perfil" className="gap-2">
            <User size={16} />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="empresa" className="gap-2">
            <Building2 size={16} />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="gap-2">
            <Bell size={16} />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="gap-2">
            <Shield size={16} />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-6">
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Informações pessoais</h2>
            
            {/* Avatar */}
            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-2xl font-bold text-secondary-foreground">
                  CS
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <Camera size={14} />
                </button>
              </div>
              <div>
                <p className="font-medium text-foreground">Foto de perfil</p>
                <p className="text-sm text-muted-foreground">JPG, PNG ou GIF. Máximo 2MB.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" defaultValue="Carlos Silva" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" defaultValue="carlos@empresa.com" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" type="tel" defaultValue="+55 11 99999-9999" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Cargo</Label>
                <Input id="role" defaultValue="CEO" className="h-11" />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="empresa" className="space-y-6">
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Dados da empresa</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="company">Nome da empresa</Label>
                <Input id="company" defaultValue="Empresa LTDA" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" defaultValue="00.000.000/0001-00" className="h-11" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" defaultValue="Rua Exemplo, 123 - São Paulo, SP" className="h-11" />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-6">
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Preferências de notificação</h2>
            
            <div className="space-y-6">
              {[
                { label: "Notificações por e-mail", description: "Receba atualizações importantes por e-mail" },
                { label: "Notificações push", description: "Notificações no navegador" },
                { label: "Resumo semanal", description: "Relatório semanal de atividades" },
                { label: "Novidades do produto", description: "Atualizações sobre novos recursos" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="seguranca" className="space-y-6">
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Segurança da conta</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Autenticação em duas etapas</p>
                  <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                </div>
                <Button variant="outline">Configurar</Button>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Alterar senha</p>
                  <p className="text-sm text-muted-foreground">Última alteração há 3 meses</p>
                </div>
                <Button variant="outline">Alterar</Button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-foreground">Sessões ativas</p>
                  <p className="text-sm text-muted-foreground">Gerencie seus dispositivos conectados</p>
                </div>
                <Button variant="outline">Ver sessões</Button>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border-2 border-destructive/20 bg-destructive/5">
            <h3 className="font-semibold text-destructive mb-2">Zona de perigo</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ações irreversíveis. Tenha cuidado.
            </p>
            <Button variant="destructive" size="sm">Excluir conta</Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-8">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save size={18} />
          {isSaving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}

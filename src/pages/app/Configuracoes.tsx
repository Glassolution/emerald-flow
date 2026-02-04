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
import { useI18n } from "@/contexts/I18nContext";

export default function Configuracoes() {
  const { toast } = useToast();
  const { t } = useI18n();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: t('settings.savedTitle'),
      description: t('settings.savedDesc')
    });
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <Tabs defaultValue="perfil" className="space-y-8">
        <TabsList className="bg-secondary">
          <TabsTrigger value="perfil" className="gap-2">
            <User size={16} />
            {t('settings.tabs.profile')}
          </TabsTrigger>
          <TabsTrigger value="empresa" className="gap-2">
            <Building2 size={16} />
            {t('settings.tabs.company')}
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="gap-2">
            <Bell size={16} />
            {t('settings.tabs.notifications')}
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="gap-2">
            <Shield size={16} />
            {t('settings.tabs.security')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-6">
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">{t('settings.profile.personalInfo')}</h2>
            
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
                <p className="font-medium text-foreground">{t('settings.profile.photo')}</p>
                <p className="text-sm text-muted-foreground">{t('settings.profile.photoDesc')}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t('settings.profile.fullName')}</Label>
                <Input id="name" defaultValue="Carlos Silva" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('settings.profile.email')}</Label>
                <Input id="email" type="email" defaultValue="carlos@empresa.com" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t('settings.profile.phone')}</Label>
                <Input id="phone" type="tel" defaultValue="+55 11 99999-9999" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">{t('settings.profile.role')}</Label>
                <Input id="role" defaultValue="CEO" className="h-11" />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="empresa" className="space-y-6">
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">{t('settings.company.data')}</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="company">{t('settings.company.name')}</Label>
                <Input id="company" defaultValue="Empresa LTDA" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">{t('settings.company.cnpj')}</Label>
                <Input id="cnpj" defaultValue="00.000.000/0001-00" className="h-11" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">{t('settings.company.address')}</Label>
                <Input id="address" defaultValue="Rua Exemplo, 123 - São Paulo, SP" className="h-11" />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-6">
          <div className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">{t('settings.notifications.preferences')}</h2>
            
            <div className="space-y-6">
              {[
                { label: t('settings.notifications.email'), description: t('settings.notifications.emailDesc') },
                { label: t('settings.notifications.push'), description: t('settings.notifications.pushDesc') },
                { label: t('settings.notifications.weekly'), description: t('settings.notifications.weeklyDesc') },
                { label: t('settings.notifications.product'), description: t('settings.notifications.productDesc') },
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
            <h2 className="text-lg font-semibold text-foreground mb-6">{t('settings.security.accountSecurity')}</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">{t('settings.security.2fa')}</p>
                  <p className="text-sm text-muted-foreground">{t('settings.security.2faDesc')}</p>
                </div>
                <Button variant="outline">{t('settings.security.configure')}</Button>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">{t('settings.security.changePassword')}</p>
                  <p className="text-sm text-muted-foreground">{t('settings.security.changePasswordDesc')}</p>
                </div>
                <Button variant="outline">{t('settings.security.change')}</Button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-foreground">{t('settings.security.activeSessions')}</p>
                  <p className="text-sm text-muted-foreground">{t('settings.security.activeSessionsDesc')}</p>
                </div>
                <Button variant="outline">{t('settings.security.viewSessions')}</Button>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl border-2 border-destructive/20 bg-destructive/5">
            <h3 className="font-semibold text-destructive mb-2">{t('settings.security.dangerZone')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('settings.security.dangerZoneDesc')}
            </p>
            <Button variant="destructive" size="sm">{t('settings.security.deleteAccount')}</Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-8">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save size={18} />
          {isSaving ? t('settings.saving') : t('settings.save')}
        </Button>
      </div>
    </div>
  );
}

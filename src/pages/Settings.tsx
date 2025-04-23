
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from "sonner";

const specialties = [
  'Cardiologia', 
  'Clínica Médica',
  'Dermatologia',
  'Endocrinologia',
  'Gastroenterologia',
  'Geriatria',
  'Ginecologia',
  'Neurologia',
  'Oftalmologia',
  'Ortopedia',
  'Pediatria',
  'Psiquiatria',
  'Radiologia',
  'Urologia'
];

const Settings = () => {
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Dr. João Silva',
    email: 'joao.silva@exemplo.com',
    specialty: 'Cardiologia',
  });
  
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      push: true,
      reminders: true,
    },
    export: {
      includePaid: true,
      includePending: true,
    }
  });
  
  const handleProfileChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNotificationChange = (field: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      }
    }));
  };
  
  const handleExportChange = (field: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      export: {
        ...prev.export,
        [field]: value,
      }
    }));
  };
  
  const saveChanges = () => {
    setSaving(true);
    
    // Simulate saving data
    setTimeout(() => {
      setSaving(false);
      toast.success("Configurações salvas com sucesso!");
    }, 1000);
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Configurações</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais e profissionais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade principal</Label>
                  <Select
                    value={profile.specialty}
                    onValueChange={(value) => handleProfileChange('specialty', value)}
                  >
                    <SelectTrigger id="specialty">
                      <SelectValue placeholder="Selecione sua especialidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha atual</Label>
                <Input id="currentPassword" type="password" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova senha</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>
                Configure como deseja receber lembretes e avisos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications" className="text-base">Notificações por email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba lembretes de plantões e pagamentos por email
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={preferences.notifications.email}
                    onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotifications" className="text-base">Notificações push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações no seu navegador ou dispositivo móvel
                    </p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={preferences.notifications.push}
                    onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="reminderNotifications" className="text-base">Lembretes de plantão</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba lembretes um dia antes dos seus plantões
                    </p>
                  </div>
                  <Switch
                    id="reminderNotifications"
                    checked={preferences.notifications.reminders}
                    onCheckedChange={(checked) => handleNotificationChange('reminders', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Exportação de dados</CardTitle>
              <CardDescription>
                Configure os padrões para exportações de relatórios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="includePaid" className="text-base">Incluir plantões pagos</Label>
                    <p className="text-sm text-muted-foreground">
                      Incluir plantões que já foram pagos nos relatórios
                    </p>
                  </div>
                  <Switch
                    id="includePaid"
                    checked={preferences.export.includePaid}
                    onCheckedChange={(checked) => handleExportChange('includePaid', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="includePending" className="text-base">Incluir plantões pendentes</Label>
                    <p className="text-sm text-muted-foreground">
                      Incluir plantões com pagamento pendente nos relatórios
                    </p>
                  </div>
                  <Switch
                    id="includePending"
                    checked={preferences.export.includePending}
                    onCheckedChange={(checked) => handleExportChange('includePending', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Account Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Sua conta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-medical-purple flex items-center justify-center text-white text-2xl font-bold">
                    {profile.name.split(' ').map(name => name[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-medium">{profile.name}</h3>
                    <p className="text-sm text-muted-foreground">{profile.specialty}</p>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm">Membro desde</p>
                  <p className="font-medium">Abril 2023</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm">Plantões registrados</p>
                  <p className="font-medium">42</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-4">
            <Button className="w-full" onClick={saveChanges} disabled={saving}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
            <Button variant="outline" className="w-full">
              Exportar todos os dados
            </Button>
            <Button variant="destructive" className="w-full">
              Excluir minha conta
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Settings;

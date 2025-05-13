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
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';

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

interface DoctorProfile {
  id: number;
  name: string;
  email: string;
  main_specialty: string;
  created_at: string;
  shifts_count?: number;
}

const Settings = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DoctorProfile>({
    id: 0,
    name: '',
    email: '',
    main_specialty: '',
    created_at: '',
    shifts_count: 0
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.getMyData();
        setProfile(response);
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (field: keyof DoctorProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const saveChanges = async () => {
    const isChangingPassword = passwordData.newPassword || passwordData.confirmPassword;

    if (isChangingPassword) {
      if (!passwordData.currentPassword) {
        toast.error("Por favor, informe sua senha atual");
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error("As novas senhas não coincidem");
        return;
      }

      if (passwordData.newPassword.length < 6) {
        toast.error("A nova senha deve ter pelo menos 6 caracteres");
        return;
      }
    }

    setSaving(true);

    try {
      const updateData = {
        name: profile.name,
        main_specialty: profile.main_specialty
      };

      await api.updateMyData(updateData);

      if (isChangingPassword) {
        await api.updateMyData({
          password: passwordData.newPassword
        });
        toast.success("Senha alterada com sucesso!");

        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }

      toast.success("Perfil atualizado com sucesso!");

      if (isChangingPassword) {
        await api.logout();
        navigate('/login', { replace: true });
        return;
      }
    } catch (error: any) {
      toast.error("Erro ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    }).replace(/^./, c => c.toUpperCase());
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <p>Carregando perfil...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Configurações</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
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
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade principal</Label>
                  <Select
                    value={profile.main_specialty}
                    onValueChange={(value) => handleProfileChange('main_specialty', value)}
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
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  placeholder="Informe para alterar sua senha"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    placeholder="Repita a nova senha"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
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
                    <p className="text-sm text-muted-foreground">{profile.main_specialty}</p>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm">Membro desde</p>
                  <p className="font-medium">{formatDate(profile.created_at)}</p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm">Plantões registrados</p>
                  <p className="font-medium">{profile.shifts_count || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Button className="w-full" onClick={saveChanges} disabled={saving}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
            {/*<Button variant="destructive" className="w-full">
              Excluir minha conta
            </Button>*/}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Settings;
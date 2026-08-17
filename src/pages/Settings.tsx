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
import { Settings as SettingsIcon } from 'lucide-react';
import { NotificationPreferencesCard } from '@/components/notifications/NotificationPreferencesCard';

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

  // Metas financeiras
  const [goalDefault, setGoalDefault] = useState('');
  const [goalDefaultSaved, setGoalDefaultSaved] = useState<number | null>(null);
  const [goalMonth, setGoalMonth] = useState('');
  const [goalMonthSaved, setGoalMonthSaved] = useState<number | null>(null);
  const [goalMonthCustom, setGoalMonthCustom] = useState(false);
  const [goalsList, setGoalsList] = useState<{ year: number; month: number; value: number }[]>([]);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthName = now.toLocaleString('default', { month: 'long' });

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

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const def = await api.getGoal(0, 0);
        setGoalDefault(def.value ? String(def.value) : '');
        setGoalDefaultSaved(def.value || null);
        const cur = await api.getGoal(year, month);
        setGoalMonth(cur.value ? String(cur.value) : '');
        setGoalMonthSaved(cur.custom ? cur.value : null);
        setGoalMonthCustom(cur.custom);
        const list = await api.listGoals();
        setGoalsList(list.filter((g: any) => !(g.year === 0 && g.month === 0)));
      } catch {}
    };
    fetchGoals();
  }, [year, month]);

  const handleProfileChange = (field: keyof DoctorProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const saveGoalDefault = async () => {
    try {
      await api.setGoal(0, 0, Number(goalDefault));
      setGoalDefaultSaved(Number(goalDefault));
      toast.success('Meta padrão salva!');
    } catch { toast.error('Erro ao salvar meta padrão'); }
  };
  const saveGoalMonth = async () => {
    try {
      if (!goalMonth) return;
      await api.setGoal(year, month, Number(goalMonth));
      setGoalMonthSaved(Number(goalMonth));
      setGoalMonthCustom(true);
      toast.success('Meta personalizada salva!');
    } catch { toast.error('Erro ao salvar meta personalizada'); }
  };
  const removeGoalMonth = async () => {
    try {
      await api.removeGoal(year, month);
      setGoalMonth('');
      setGoalMonthSaved(null);
      setGoalMonthCustom(false);
      toast.success('Meta personalizada removida!');
    } catch { toast.error('Erro ao remover meta personalizada'); }
  };
  const removeGoal = async (gYear: number, gMonth: number) => {
    try {
      await api.removeGoal(gYear, gMonth);
      setGoalsList(goalsList.filter(g => !(g.year === gYear && g.month === gMonth)));
      toast.success('Meta removida!');
    } catch { toast.error('Erro ao remover meta'); }
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

          {/* Metas Financeiras */}
          <Card>
            <CardHeader>
              <CardTitle>Metas Financeiras</CardTitle>
              <CardDescription>
                Configure suas metas mensais e como calcular o progresso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="font-semibold flex items-center gap-2"><span className="text-lg">$</span> Meta mensal padrão</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="number"
                    value={goalDefault}
                    onChange={e => setGoalDefault(e.target.value)}
                    placeholder="Ex: 8000"
                  />
                  <Button onClick={saveGoalDefault} disabled={!goalDefault}>Salvar</Button>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Esta será sua meta padrão para todos os meses</div>
                {goalDefaultSaved !== null && <div className="text-xs mt-1">Meta atual: R$ {goalDefaultSaved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>}
              </div>
              <Separator className="my-4" />
              <div>
                <Label className="font-semibold flex items-center gap-2">Meta para {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year} {goalMonthCustom && <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs font-semibold">Personalizada</span>}</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="number"
                    value={goalMonth}
                    onChange={e => setGoalMonth(e.target.value)}
                    placeholder="Ex: 10000"
                  />
                  <Button onClick={saveGoalMonth} disabled={!goalMonth}>Salvar</Button>
                  {goalMonthCustom && <Button variant="outline" onClick={removeGoalMonth}>Remover</Button>}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Defina uma meta específica para este mês (deixe vazio para usar a meta padrão)</div>
              </div>
              <Separator className="my-4" />
              <div>
                <div className="font-semibold mb-2">Metas personalizadas</div>
                <div className="space-y-1">
                  {goalsList.length === 0 && <div className="text-xs text-muted-foreground">Nenhuma meta personalizada cadastrada.</div>}
                  {goalsList.map(g => (
                    <div key={`${g.year}-${g.month}`} className="flex items-center justify-between border-b py-1">
                      <span>{new Date(g.year, g.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                      <span>R$ {g.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <Button size="sm" variant="ghost" onClick={() => removeGoal(g.year, g.month)}>Remover</Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <NotificationPreferencesCard audience="doctor" />
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
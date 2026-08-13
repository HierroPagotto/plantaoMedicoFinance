import { useEffect, useState } from 'react';
import { HospitalShell } from '@/components/layout/HospitalShell';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type StaffMember = {
  id: number;
  name: string;
  email?: string;
  staff_role: string;
  is_active?: boolean;
  phone?: string;
};

const HospitalStaffPage = () => {
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    staff_role: 'hospital_recruiter' as 'hospital_admin' | 'hospital_recruiter',
  });

  let currentUser: any = {};
  try {
    currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
  } catch {
    currentUser = {};
  }
  const isAdmin = currentUser.staff_role === 'hospital_admin';

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getHospitalStaff();
      setStaff(data.staff || []);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar equipe',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setSubmitting(true);
    try {
      await api.createHospitalStaff(form);
      toast({ title: 'Colaborador criado' });
      setForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        staff_role: 'hospital_recruiter',
      });
      await load();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Não foi possível criar',
        description: err?.response?.data?.message || 'Tente novamente',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onDeactivate = async (id: number) => {
    try {
      await api.deactivateHospitalStaff(id);
      toast({ title: 'Colaborador desativado' });
      await load();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao desativar',
        description: err?.response?.data?.message || 'Tente novamente',
      });
    }
  };

  return (
    <HospitalShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Equipe do hospital</h1>
          <p className="text-slate-600">
            Gestores e recrutadores com acesso ao portal.
          </p>
        </div>

        {isAdmin && (
          <form onSubmit={onCreate} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2">
            <Input
              placeholder="Nome"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              type="password"
              placeholder="Senha"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
            <Input
              placeholder="Telefone (opcional)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Select
              value={form.staff_role}
              onValueChange={(value: 'hospital_admin' | 'hospital_recruiter') =>
                setForm({ ...form, staff_role: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hospital_recruiter">Recrutador</SelectItem>
                <SelectItem value="hospital_admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Adicionar colaborador'}
            </Button>
          </form>
        )}

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {loading ? (
            <p className="p-4 text-sm text-slate-500">Carregando...</p>
          ) : staff.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">Nenhum colaborador encontrado.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Papel</th>
                  <th className="px-4 py-3">Status</th>
                  {isAdmin && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{member.name}</td>
                    <td className="px-4 py-3">{member.email || '—'}</td>
                    <td className="px-4 py-3">{member.staff_role}</td>
                    <td className="px-4 py-3">
                      {member.is_active === false ? 'Inativo' : 'Ativo'}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        {member.is_active !== false && member.id !== currentUser.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeactivate(member.id)}
                          >
                            Desativar
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </HospitalShell>
  );
};

export default HospitalStaffPage;

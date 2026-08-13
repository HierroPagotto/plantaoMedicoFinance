import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { HospitalShell } from '@/components/layout/HospitalShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { MarketplaceHospital, ShiftOpportunity } from '@/types/marketplace';
import { useToast } from '@/hooks/use-toast';
import { isAxiosError } from 'axios';

type HospitalStaffUser = {
  name?: string;
  staff_role?: string;
  hospital?: MarketplaceHospital;
};

const HospitalDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<ShiftOpportunity[]>([]);
  const [user, setUser] = useState<HospitalStaffUser>({});

  useEffect(() => {
    try {
      setUser(JSON.parse(localStorage.getItem('userData') || '{}') as HospitalStaffUser);
    } catch {
      setUser({});
    }

    const load = async () => {
      setLoading(true);
      try {
        const me = await api.getHospitalMe();
        setUser(me);
        localStorage.setItem('userData', JSON.stringify(me));
        const data = await api.listHospitalOpportunities();
        setOpportunities(data.opportunities || []);
      } catch (err: unknown) {
        const message = isAxiosError(err)
          ? (err.response?.data as { message?: string } | undefined)?.message
          : undefined;
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar painel',
          description: message || 'Tente novamente.',
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const stats = useMemo(() => {
    const open = opportunities.filter((o) => o.status === 'open');
    const pendingApps = opportunities.reduce(
      (acc, o) => acc + (o.pending_applications_count || 0),
      0
    );
    const filled = opportunities.filter((o) => o.status === 'filled').length;
    return {
      openCount: open.length,
      pendingApps,
      filled,
      total: opportunities.length,
    };
  }, [opportunities]);

  return (
    <HospitalShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Olá, {user.name || 'gestor'}</h1>
            <p className="text-slate-600">
              Publique plantões e selecione os médicos interessados.
            </p>
          </div>
          <Button asChild>
            <Link to="/hospital/opportunities/new">Publicar vaga</Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-slate-500">
                Vagas abertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {loading ? '—' : stats.openCount}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-slate-500">
                Candidaturas pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {loading ? '—' : stats.pendingApps}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-slate-500">
                Plantões preenchidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">
                {loading ? '—' : stats.filled}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Hospital</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p>
                <strong>Nome:</strong> {user.hospital?.name || '—'}
              </p>
              <p>
                <strong>Cidade:</strong> {user.hospital?.city || '—'}
              </p>
              <p>
                <strong>Seu papel:</strong> {user.staff_role || '—'}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/hospital/settings">Ver dados</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações rápidas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/hospital/opportunities">Gerenciar vagas</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/hospital/staff">Equipe</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </HospitalShell>
  );
};

export default HospitalDashboard;

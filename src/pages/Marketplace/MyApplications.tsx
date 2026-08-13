import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { api } from '@/lib/api';
import type { OpportunityApplication } from '@/types/marketplace';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatShortDate } from '@/lib/date-utils';
import { ArrowLeft } from 'lucide-react';

const statusLabel: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
  withdrawn: 'Retirada',
};

const statusClass: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-slate-100 text-slate-700',
};

function formatTime(value?: string) {
  if (!value) return '—';
  return value.slice(0, 5);
}

function formatMoney(value?: number) {
  if (value == null) return '—';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const MyApplicationsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<OpportunityApplication[]>([]);
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.listMyMarketplaceApplications();
      setApplications(data.applications || []);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar candidaturas',
        description: err?.response?.data?.message || 'Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onWithdraw = async (applicationId: number) => {
    setWithdrawingId(applicationId);
    try {
      await api.withdrawMarketplaceApplication(applicationId);
      toast({ title: 'Candidatura retirada' });
      await load();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Não foi possível retirar',
        description: err?.response?.data?.message || 'Tente novamente.',
      });
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button variant="ghost" asChild className="mb-2 px-0">
              <Link to="/marketplace">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Marketplace
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Minhas candidaturas</h1>
            <p className="text-muted-foreground">
              Acompanhe o status das vagas em que você demonstrou interesse.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : applications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <p className="font-medium">Você ainda não se candidatou a nenhuma vaga</p>
            <Button asChild className="mt-4">
              <Link to="/marketplace">Ver oportunidades</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const opp = app.opportunity;
              return (
                <div
                  key={app.id}
                  className="rounded-xl border border-border bg-card p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold">
                          {opp?.hospital?.name || `Oportunidade #${app.opportunity_id}`}
                        </h2>
                        <Badge className={statusClass[app.status] || ''}>
                          {statusLabel[app.status] || app.status}
                        </Badge>
                      </div>
                      {opp && (
                        <p className="text-sm text-muted-foreground">
                          {formatShortDate(opp.date)} · {formatTime(opp.start_time)}–
                          {formatTime(opp.end_time)} · {opp.specialty} ·{' '}
                          {formatMoney(Number(opp.value))}
                        </p>
                      )}
                      {app.message && (
                        <p className="text-sm text-muted-foreground">
                          Sua mensagem: {app.message}
                        </p>
                      )}
                      {app.status === 'approved' && (
                        <p className="text-sm text-green-700 dark:text-green-400">
                          Plantão confirmado — confira em Plantões.
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/marketplace/${app.opportunity_id}`}>Ver vaga</Link>
                      </Button>
                      {app.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={withdrawingId === app.id}
                          onClick={() => onWithdraw(app.id)}
                        >
                          {withdrawingId === app.id ? 'Retirando...' : 'Retirar'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default MyApplicationsPage;

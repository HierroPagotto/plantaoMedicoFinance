import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HospitalShell } from '@/components/layout/HospitalShell';
import { api } from '@/lib/api';
import type { OpportunityApplication, ShiftOpportunity } from '@/types/marketplace';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatShortDate } from '@/lib/date-utils';
import { formatOpportunityRequirements } from '@/lib/marketplace-requirements';
import { ArrowLeft } from 'lucide-react';
import { isAxiosError } from 'axios';

const statusLabel: Record<string, string> = {
  open: 'Aberta',
  filled: 'Preenchida',
  cancelled: 'Cancelada',
  pending: 'Pendente',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
  withdrawn: 'Retirada',
};

function formatTime(value?: string) {
  return value ? value.slice(0, 5) : '—';
}

function formatMoney(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function axiosErrorMessage(err: unknown, fallback: string) {
  if (!isAxiosError(err)) return fallback;
  return (err.response?.data as { message?: string } | undefined)?.message || fallback;
}

const HospitalOpportunityDetailPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [opportunity, setOpportunity] = useState<ShiftOpportunity | null>(null);
  const [applications, setApplications] = useState<OpportunityApplication[]>([]);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [opp, appsData] = await Promise.all([
        api.getMarketplaceOpportunity(id),
        api.listOpportunityApplications(id),
      ]);
      setOpportunity(opp);
      setApplications(appsData.applications || []);
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined;
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar vaga',
        description: message || 'Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const onApprove = async (applicationId: number) => {
    setActingId(applicationId);
    try {
      await api.approveMarketplaceApplication(applicationId);
      toast({
        title: 'Candidatura aprovada',
        description: 'Plantão confirmado para o médico.',
      });
      await load();
    } catch (err: unknown) {
      toast({
        variant: 'destructive',
        title: 'Não foi possível aprovar',
        description: axiosErrorMessage(err, 'Tente novamente.'),
      });
    } finally {
      setActingId(null);
    }
  };

  const onReject = async (applicationId: number) => {
    setActingId(applicationId);
    try {
      await api.rejectMarketplaceApplication(applicationId);
      toast({ title: 'Candidatura rejeitada' });
      await load();
    } catch (err: unknown) {
      toast({
        variant: 'destructive',
        title: 'Não foi possível rejeitar',
        description: axiosErrorMessage(err, 'Tente novamente.'),
      });
    } finally {
      setActingId(null);
    }
  };

  const onCancel = async () => {
    if (!id || !opportunity || opportunity.status !== 'open') return;
    setCancelling(true);
    try {
      await api.cancelHospitalOpportunity(id);
      toast({ title: 'Vaga cancelada' });
      await load();
    } catch (err: unknown) {
      toast({
        variant: 'destructive',
        title: 'Erro ao cancelar',
        description: axiosErrorMessage(err, 'Tente novamente.'),
      });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <HospitalShell>
        <p className="text-sm text-slate-500">Carregando...</p>
      </HospitalShell>
    );
  }

  if (!opportunity) {
    return (
      <HospitalShell>
        <p>Vaga não encontrada.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/hospital/opportunities">Voltar</Link>
        </Button>
      </HospitalShell>
    );
  }

  return (
    <HospitalShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Button variant="ghost" asChild className="mb-2 px-0">
              <Link to="/hospital/opportunities">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Vagas
              </Link>
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold">
                {formatShortDate(opportunity.date)} · {opportunity.specialty}
              </h1>
              <Badge variant="secondary">
                {statusLabel[opportunity.status] || opportunity.status}
              </Badge>
            </div>
            <p className="mt-1 text-slate-600">
              {formatTime(opportunity.start_time)}–{formatTime(opportunity.end_time)} ·{' '}
              {formatMoney(Number(opportunity.value))} · pagamento{' '}
              {opportunity.payment_date
                ? formatShortDate(opportunity.payment_date)
                : 'a definir'}{' '}
              · {opportunity.slots_filled}/{opportunity.slots_total} vagas ·{' '}
              {opportunity.city || '—'}
            </p>
            {formatOpportunityRequirements(opportunity) && (
              <p className="mt-1 text-sm text-slate-500">
                Requisitos: {formatOpportunityRequirements(opportunity)}
              </p>
            )}
            {opportunity.notes && (
              <p className="mt-2 text-sm text-slate-500">{opportunity.notes}</p>
            )}
          </div>
          {opportunity.status === 'open' && (
            <Button variant="outline" onClick={onCancel} disabled={cancelling}>
              {cancelling ? 'Cancelando...' : 'Cancelar vaga'}
            </Button>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="font-semibold">Candidaturas ({applications.length})</h2>
          </div>

          {applications.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">
              Ainda não há médicos interessados nesta vaga.
            </p>
          ) : (
            <div className="divide-y">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">
                        {app.doctor?.name || `Médico #${app.doctor_id}`}
                      </p>
                      <Badge variant="outline">
                        {statusLabel[app.status] || app.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      {app.doctor?.main_specialty || '—'}
                      {app.doctor?.crm
                        ? ` · CRM ${app.doctor.crm}${app.doctor.crm_state ? `/${app.doctor.crm_state}` : ''
                        }`
                        : ''}
                      {app.doctor?.city ? ` · ${app.doctor.city}` : ''}
                    </p>
                    {(app.doctor?.acls ||
                      app.doctor?.bls ||
                      app.doctor?.atls ||
                      app.doctor?.pals) && (
                        <p className="text-xs text-slate-500">
                          Certs:{' '}
                          {[
                            app.doctor.acls && 'ACLS',
                            app.doctor.bls && 'BLS',
                            app.doctor.atls && 'ATLS',
                            app.doctor.pals && 'PALS',
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      )}
                    {app.message && (
                      <p className="text-sm text-slate-500">Mensagem: {app.message}</p>
                    )}
                    {app.doctor_id && (
                      <Button variant="link" className="h-auto p-0 text-teal-700" asChild>
                        <Link to={`/doctor-profile/${app.doctor_id}`} target="_blank">
                          Ver perfil público
                        </Link>
                      </Button>
                    )}
                  </div>

                  {app.status === 'pending' && opportunity.status === 'open' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={actingId === app.id}
                        onClick={() => onApprove(app.id)}
                      >
                        {actingId === app.id ? '...' : 'Aprovar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actingId === app.id}
                        onClick={() => onReject(app.id)}
                      >
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </HospitalShell>
  );
};

export default HospitalOpportunityDetailPage;

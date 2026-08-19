import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { api } from '@/lib/api';
import type { OpportunityApplication, ShiftOpportunity } from '@/types/marketplace';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { formatShortDate } from '@/lib/date-utils';
import { formatOpportunityRequirements } from '@/lib/marketplace-requirements';
import { ArrowLeft, Calendar, Clock, MapPin, Stethoscope, Wallet } from 'lucide-react';
import { isAxiosError } from 'axios';

function formatTime(value?: string) {
  if (!value) return '—';
  return value.slice(0, 5);
}

function formatMoney(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function axiosErrorMessage(err: unknown, fallback: string) {
  if (!isAxiosError(err)) return fallback;
  return (err.response?.data as { message?: string } | undefined)?.message || fallback;
}

const MarketplaceDetailPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [opportunity, setOpportunity] = useState<ShiftOpportunity | null>(null);
  const [myApplication, setMyApplication] = useState<OpportunityApplication | null>(null);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [opp, appsData] = await Promise.all([
        api.getMarketplaceOpportunity(id),
        api.listMyMarketplaceApplications(),
      ]);
      setOpportunity(opp);
      const mine = (appsData.applications || []).find(
        (a: OpportunityApplication) =>
          String(a.opportunity_id) === String(id) && a.status !== 'withdrawn'
      );
      setMyApplication(mine || null);
    } catch (err: unknown) {
      toast({
        variant: 'destructive',
        title: 'Não foi possível abrir a vaga',
        description: axiosErrorMessage(err, 'Tente novamente.'),
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const onApply = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      const result = await api.applyToOpportunity(id, message.trim() || undefined);
      setMyApplication(result.application);
      toast({
        title: 'Candidatura enviada',
        description: 'O hospital foi notificado do seu interesse.',
      });
    } catch (err: unknown) {
      toast({
        variant: 'destructive',
        title: 'Não foi possível candidatar-se',
        description: axiosErrorMessage(err, 'Tente novamente.'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </AppShell>
    );
  }

  if (!opportunity) {
    return (
      <AppShell>
        <div className="space-y-4">
          <p>Oportunidade não encontrada.</p>
          <Button asChild variant="outline">
            <Link to="/marketplace">Voltar ao marketplace</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const hospitalName = opportunity.hospital?.name || 'Hospital';
  const city =
    opportunity.city ||
    opportunity.hospital?.city ||
    opportunity.hospital?.address ||
    '—';
  const requirements = formatOpportunityRequirements(opportunity);
  const canApply =
    opportunity.status === 'open' &&
    opportunity.slots_remaining > 0 &&
    !myApplication;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <Button variant="ghost" asChild className="px-0">
          <Link to="/marketplace">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Plantão disponível</p>
              <h1 className="text-2xl font-bold">{hospitalName}</h1>
            </div>
            <Badge variant={opportunity.status === 'open' ? 'default' : 'secondary'}>
              {opportunity.status === 'open' ? 'Aberta' : opportunity.status}
            </Badge>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              {formatShortDate(opportunity.date)}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              {formatTime(opportunity.start_time)} – {formatTime(opportunity.end_time)}
            </div>
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" />
              {opportunity.specialty}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {city}
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              {opportunity.payment_date
                ? `Pagamento previsto: ${formatShortDate(opportunity.payment_date)}`
                : 'Pagamento a definir'}
            </div>
          </div>

          {requirements && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline">Requer {requirements}</Badge>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-end justify-between gap-3 border-t border-border pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Valor</p>
              <p className="text-2xl font-semibold text-primary">
                {formatMoney(Number(opportunity.value))}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {opportunity.slots_remaining} de {opportunity.slots_total} vaga
              {opportunity.slots_total === 1 ? '' : 's'} disponível
              {opportunity.slots_remaining === 1 ? '' : 'is'}
            </p>
          </div>

          {opportunity.notes && (
            <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
              <p className="mb-1 font-medium">Observações</p>
              <p className="text-muted-foreground">{opportunity.notes}</p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          {myApplication ? (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Sua candidatura</h2>
              <p className="text-sm text-muted-foreground">
                Status:{' '}
                <span className="font-medium text-foreground">{myApplication.status}</span>
              </p>
              {myApplication.status === 'approved' && (
                <p className="text-sm text-green-700 dark:text-green-400">
                  Aprovado! O plantão já deve aparecer em Plantões e Financeiro.
                </p>
              )}
              {myApplication.status === 'pending' && (
                <p className="text-sm text-muted-foreground">
                  Aguarde a análise do hospital. Você pode acompanhar em Minhas candidaturas.
                </p>
              )}
              <Button variant="outline" asChild>
                <Link to="/marketplace/minhas-candidaturas">Ver minhas candidaturas</Link>
              </Button>
            </div>
          ) : canApply ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Tenho interesse</h2>
                <p className="text-sm text-muted-foreground">
                  Envie uma mensagem opcional para o hospital junto com sua candidatura.
                </p>
              </div>
              <Textarea
                placeholder="Ex.: Disponibilidade confirmada, experiência em UTI..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
              <Button onClick={onApply} disabled={submitting} className="w-full sm:w-auto">
                {submitting ? 'Enviando...' : 'Candidatar-me a este plantão'}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Esta oportunidade não está disponível para novas candidaturas.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default MarketplaceDetailPage;

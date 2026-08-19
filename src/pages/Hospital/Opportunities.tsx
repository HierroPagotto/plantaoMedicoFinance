import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HospitalShell } from '@/components/layout/HospitalShell';
import { api } from '@/lib/api';
import type { ShiftOpportunity } from '@/types/marketplace';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatShortDate } from '@/lib/date-utils';
import { Plus } from 'lucide-react';
import { isAxiosError } from 'axios';

const statusLabel: Record<string, string> = {
  open: 'Aberta',
  filled: 'Preenchida',
  cancelled: 'Cancelada',
};

function formatTime(value?: string) {
  return value ? value.slice(0, 5) : '—';
}

function formatMoney(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const HospitalOpportunitiesPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [opportunities, setOpportunities] = useState<ShiftOpportunity[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.listHospitalOpportunities(
          status === 'all' ? undefined : status
        );
        setOpportunities(data.opportunities || []);
      } catch (err: unknown) {
        const message = isAxiosError(err)
          ? (err.response?.data as { message?: string } | undefined)?.message
          : undefined;
        toast({
          variant: 'destructive',
          title: 'Erro ao listar vagas',
          description: message || 'Tente novamente.',
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [status, toast]);

  return (
    <HospitalShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Vagas de plantão</h1>
            <p className="text-slate-600">
              Publique oportunidades e acompanhe candidaturas dos médicos.
            </p>
          </div>
          <Button asChild>
            <Link to="/hospital/opportunities/new">
              <Plus className="mr-2 h-4 w-4" />
              Nova vaga
            </Link>
          </Button>
        </div>

        <div className="max-w-xs">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="open">Abertas</SelectItem>
              <SelectItem value="filled">Preenchidas</SelectItem>
              <SelectItem value="cancelled">Canceladas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Carregando...</p>
        ) : opportunities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="font-medium">Nenhuma vaga encontrada</p>
            <p className="mt-1 text-sm text-slate-500">
              Publique a primeira oportunidade para atrair médicos.
            </p>
            <Button asChild className="mt-4">
              <Link to="/hospital/opportunities/new">Publicar vaga</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Horário</th>
                  <th className="px-4 py-3">Especialidade</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Pagamento</th>
                  <th className="px-4 py-3">Vagas</th>
                  <th className="px-4 py-3">Candidaturas</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {opportunities.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{formatShortDate(item.date)}</td>
                    <td className="px-4 py-3">
                      {formatTime(item.start_time)}–{formatTime(item.end_time)}
                    </td>
                    <td className="px-4 py-3">{item.specialty}</td>
                    <td className="px-4 py-3">{formatMoney(Number(item.value))}</td>
                    <td className="px-4 py-3">
                      {item.payment_date ? formatShortDate(item.payment_date) : 'A definir'}
                    </td>
                    <td className="px-4 py-3">
                      {item.slots_filled}/{item.slots_total}
                    </td>
                    <td className="px-4 py-3">
                      {item.pending_applications_count || 0} pend.
                      {(item.applications_count || 0) > 0 && (
                        <span className="text-slate-400">
                          {' '}
                          / {item.applications_count} total
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">
                        {statusLabel[item.status] || item.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/hospital/opportunities/${item.id}`}>Abrir</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </HospitalShell>
  );
};

export default HospitalOpportunitiesPage;

import { useCallback, useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
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
import { isAxiosError } from 'axios';

const statusLabel: Record<string, string> = {
  open: 'Aberta',
  filled: 'Preenchida',
  cancelled: 'Cancelada',
};

function formatTime(value?: string) {
  return value ? value.slice(0, 5) : '—';
}

export default function AdminOpportunities() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<ShiftOpportunity[]>([]);
  const [actingId, setActingId] = useState<number | null>(null);
  const perPage = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listAdminOpportunities({
        status: status === 'all' ? undefined : status,
        page,
        per_page: perPage,
      });
      setItems(data.opportunities || []);
      setTotal(data.total || 0);
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
  }, [status, page, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const onCancel = async (id: number) => {
    if (!window.confirm('Cancelar esta oportunidade?')) return;
    setActingId(id);
    try {
      await api.cancelAdminOpportunity(id);
      toast({ title: 'Oportunidade cancelada' });
      await load();
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined;
      toast({
        variant: 'destructive',
        title: 'Erro ao cancelar',
        description: message || 'Tente novamente.',
      });
    } finally {
      setActingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin: Marketplace</h1>
            <p className="text-muted-foreground">
              Modere oportunidades publicadas pelos hospitais.
            </p>
          </div>
          <Select
            value={status}
            onValueChange={(value) => {
              setPage(1);
              setStatus(value);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="open">Abertas</SelectItem>
              <SelectItem value="filled">Preenchidas</SelectItem>
              <SelectItem value="cancelled">Canceladas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <p className="font-medium">Nenhuma oportunidade encontrada</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Hospital</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Especialidade</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Candidaturas</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{item.hospital?.name || item.hospital_id}</td>
                    <td className="px-4 py-3">
                      {formatShortDate(item.date)} {formatTime(item.start_time)}–
                      {formatTime(item.end_time)}
                    </td>
                    <td className="px-4 py-3">{item.specialty}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">
                        {statusLabel[item.status] || item.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {item.pending_applications_count || 0} pend. /{' '}
                      {item.applications_count || 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.status === 'open' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actingId === item.id}
                          onClick={() => onCancel(item.id)}
                        >
                          Cancelar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Página {page} de {totalPages} ({total} total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

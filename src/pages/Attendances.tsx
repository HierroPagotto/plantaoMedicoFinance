import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { AppShell } from '@/components/layout/AppShell';
import {
  AttendanceFormDialog,
  type AttendanceFormDefaults,
} from '@/components/patients/AttendanceFormDialog';
import { AttendanceListItem } from '@/components/patients/AttendanceListItem';
import { apiErrorMessage, formatBRL } from '@/components/patients/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PageLoading } from '@/components/ui/PageLoading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import api from '@/lib/api';
import type { Attendance, AttendanceKind } from '@/types/patient';

const months = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function monthRange(year: number, month: number | null) {
  if (month == null) {
    return { start_date: `${year}-01-01`, end_date: `${year}-12-31` };
  }
  const mm = String(month).padStart(2, '0');
  const lastDay = new Date(year, month, 0).getDate();
  return { start_date: `${year}-${mm}-01`, end_date: `${year}-${mm}-${lastDay}` };
}

const Attendances = () => {
  const now = new Date();
  const [searchParams, setSearchParams] = useSearchParams();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState<number | null>(now.getMonth() + 1);
  const [kind, setKind] = useState<AttendanceKind | 'all'>('all');
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Attendance | null>(null);
  const [formDefaults, setFormDefaults] = useState<AttendanceFormDefaults | undefined>();

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);
  const shiftFilterId = searchParams.get('shift_id');

  const loadAttendances = async () => {
    try {
      setLoading(true);
      const params = shiftFilterId
        ? { shift_id: Number(shiftFilterId) }
        : {
          ...monthRange(year, month),
          kind: kind === 'all' ? undefined : kind,
        };
      const data = await api.listAttendances(params);
      setAttendances((data.attendances || []) as Attendance[]);
    } catch {
      toast.error('Não foi possível carregar os atendimentos');
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, kind, shiftFilterId]);

  useEffect(() => {
    if (searchParams.get('new') !== '1') return;
    const shiftId = Number(searchParams.get('shift_id')) || undefined;
    const date = searchParams.get('date') || undefined;
    setEditing(null);
    setFormDefaults({ shiftId, kind: shiftId ? 'shift' : undefined, date });
    setFormOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete('new');
    next.delete('date');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const totals = useMemo(() => {
    const shiftCount = attendances.filter((a) => a.kind === 'shift').length;
    const privateList = attendances.filter((a) => a.kind === 'private');
    const privateRevenue = privateList.reduce((sum, a) => sum + Number(a.value || 0), 0);
    const privatePending = privateList
      .filter((a) => a.payment_status !== 'paid')
      .reduce((sum, a) => sum + Number(a.value || 0), 0);
    return {
      total: attendances.length,
      shiftCount,
      privateCount: privateList.length,
      privateRevenue,
      privatePending,
    };
  }, [attendances]);

  const openCreate = () => {
    setEditing(null);
    setFormDefaults(shiftFilterId ? { shiftId: Number(shiftFilterId), kind: 'shift' } : undefined);
    setFormOpen(true);
  };

  const openEdit = (attendance: Attendance) => {
    setEditing(attendance);
    setFormDefaults(undefined);
    setFormOpen(true);
  };

  const handleDelete = async (attendance: Attendance) => {
    if (!window.confirm('Excluir este atendimento?')) return;
    try {
      await api.deleteAttendance(attendance.id);
      toast.success('Atendimento excluído');
      await loadAttendances();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Erro ao excluir atendimento'));
    }
  };

  const clearShiftFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('shift_id');
    setSearchParams(next, { replace: true });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Atendimentos</h1>
            <p className="text-muted-foreground text-sm">
              Atendimentos em plantão (P.A., centro cirúrgico...) e consultas particulares
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo atendimento
          </Button>
        </div>

        {shiftFilterId ? (
          <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm">
            <span>Mostrando os atendimentos de um plantão específico.</span>
            <Button variant="outline" size="sm" onClick={clearShiftFilter}>
              Ver todos
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as AttendanceKind | 'all')}>
                <SelectTrigger className="w-[190px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="shift">Plantão</SelectItem>
                  <SelectItem value="private">Consulta particular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Mês</Label>
              <Select
                value={month == null ? 'all' : String(month)}
                onValueChange={(v) => setMonth(v === 'all' ? null : Number(v))}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Ano inteiro</SelectItem>
                  {months.map((label, idx) => (
                    <SelectItem key={label} value={String(idx + 1)}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Ano</Label>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Atendimentos</p>
              <p className="text-2xl font-bold">{totals.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Em plantão</p>
              <p className="text-2xl font-bold">{totals.shiftCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Consultas particulares</p>
              <p className="text-2xl font-bold">{totals.privateCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Receita particular</p>
              <p className="text-2xl font-bold">{formatBRL(totals.privateRevenue)}</p>
              {totals.privatePending > 0 ? (
                <p className="text-xs text-muted-foreground">
                  {formatBRL(totals.privatePending)} pendente
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Lista de atendimentos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <PageLoading label="Carregando atendimentos..." />
            ) : attendances.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Nenhum atendimento neste período.
              </p>
            ) : (
              <div className="space-y-3">
                {attendances.map((attendance) => (
                  <AttendanceListItem
                    key={attendance.id}
                    attendance={attendance}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AttendanceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        attendance={editing}
        defaults={formDefaults}
        onSaved={() => loadAttendances()}
      />
    </AppShell>
  );
};

export default Attendances;

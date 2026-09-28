import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { AttendanceFormDialog } from '@/components/patients/AttendanceFormDialog';
import { AttendanceListItem } from '@/components/patients/AttendanceListItem';
import { apiErrorMessage } from '@/components/patients/utils';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import type { Attendance } from '@/types/patient';

interface ShiftAttendancesSectionProps {
  shiftId: string | number;
  shiftDate?: Date | string | null;
  onCountChange?: (count: number) => void;
}

function toISODate(value?: Date | string | null) {
  if (!value) return undefined;
  if (typeof value === 'string') return value.slice(0, 10);
  if (Number.isNaN(value.getTime())) return undefined;
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function ShiftAttendancesSection({
  shiftId,
  shiftDate,
  onCountChange,
}: ShiftAttendancesSectionProps) {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Attendance | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.listAttendances({ shift_id: Number(shiftId) });
      const list = (data.attendances || []) as Attendance[];
      setAttendances(list);
      onCountChange?.(list.length);
    } catch {
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shiftId]);

  const handleDelete = async (attendance: Attendance) => {
    if (!window.confirm('Excluir este atendimento?')) return;
    try {
      await api.deleteAttendance(attendance.id);
      toast.success('Atendimento excluído');
      await load();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Erro ao excluir atendimento'));
    }
  };

  return (
    <div className="space-y-3 border-t pt-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold">Atendimentos ({attendances.length})</h4>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/attendances?shift_id=${shiftId}`}>Ver todos</Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : attendances.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum paciente vinculado a este plantão.</p>
      ) : (
        <div className="space-y-3">
          {attendances.map((attendance) => (
            <AttendanceListItem
              key={attendance.id}
              attendance={attendance}
              onEdit={(a) => {
                setEditing(a);
                setFormOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <AttendanceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        attendance={editing}
        defaults={{ shiftId: Number(shiftId), kind: 'shift', date: toISODate(shiftDate) }}
        onSaved={() => load()}
      />
    </div>
  );
}

import { Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Attendance } from '@/types/patient';

import { formatBRL, formatISODate } from './utils';

interface AttendanceListItemProps {
  attendance: Attendance;
  showPatient?: boolean;
  onEdit?: (attendance: Attendance) => void;
  onDelete?: (attendance: Attendance) => void;
}

export function AttendanceListItem({
  attendance,
  showPatient = true,
  onEdit,
  onDelete,
}: AttendanceListItemProps) {
  const isPrivate = attendance.kind === 'private';
  const where = attendance.shift
    ? [attendance.shift.hospital_name, attendance.shift.shift_type_label]
        .filter(Boolean)
        .join(' · ')
    : attendance.location;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3 last:border-0 last:pb-0">
      <div className="space-y-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {showPatient && attendance.patient ? (
            <span className="font-medium">{attendance.patient.name}</span>
          ) : null}
          <Badge variant={isPrivate ? 'secondary' : 'outline'}>
            {isPrivate ? 'Consulta particular' : 'Plantão'}
          </Badge>
          {showPatient && attendance.patient ? (
            <Badge variant="outline">
              {attendance.patient.health_plan || 'Particular'}
            </Badge>
          ) : null}
          {isPrivate && attendance.payment_status_label ? (
            <Badge variant={attendance.payment_status === 'paid' ? 'default' : 'outline'}>
              {attendance.payment_status_label}
            </Badge>
          ) : null}
        </div>
        <div className="text-sm text-muted-foreground">
          {formatISODate(attendance.date)}
          {where ? ` · ${where}` : ''}
          {attendance.attendance_number ? ` · Nº ${attendance.attendance_number}` : ''}
        </div>
        {attendance.notes ? (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
            {attendance.notes}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isPrivate && attendance.value != null ? (
          <span className="font-semibold tabular-nums">{formatBRL(Number(attendance.value))}</span>
        ) : null}
        {onEdit ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(attendance)}
            aria-label="Editar atendimento"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ) : null}
        {onDelete ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(attendance)}
            aria-label="Excluir atendimento"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

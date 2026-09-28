import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Patient } from '@/types/patient';

import { formatISODate } from './utils';

interface PatientLabelCardProps {
  patient: Patient;
  attendanceNumber?: string | null;
  actions?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function PatientLabelCard({
  patient,
  attendanceNumber,
  actions,
  onClick,
  className,
}: PatientLabelCardProps) {
  return (
    <div
      className={cn(
        'rounded-md border-2 border-dashed border-border bg-card p-3 font-mono text-sm',
        onClick && 'cursor-pointer hover:bg-accent/40 transition-colors',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold uppercase tracking-wide truncate">{patient.name}</p>
        {actions ? (
          <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {actions}
          </div>
        ) : null}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <span className="text-muted-foreground">Nasc.:</span>
        <span>{formatISODate(patient.birth_date)}</span>
        <span className="text-muted-foreground">Idade:</span>
        <span>{patient.age != null ? `${patient.age} anos` : '—'}</span>
        <span className="text-muted-foreground">Convênio:</span>
        <span className="truncate">
          {patient.is_private ? (
            <Badge variant="outline" className="font-mono text-[10px] py-0">
              Particular
            </Badge>
          ) : (
            patient.health_plan
          )}
        </span>
        {attendanceNumber ? (
          <>
            <span className="text-muted-foreground">Nº atend.:</span>
            <span>{attendanceNumber}</span>
          </>
        ) : null}
        {patient.attendances_count != null ? (
          <>
            <span className="text-muted-foreground">Atendimentos:</span>
            <span>{patient.attendances_count}</span>
          </>
        ) : null}
      </div>
    </div>
  );
}

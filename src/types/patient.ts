export type AttendanceKind = 'shift' | 'private';

export type AttendancePaymentStatus = 'pending' | 'paid';

export type ShiftType =
  | 'pronto_atendimento'
  | 'centro_cirurgico'
  | 'enfermaria'
  | 'uti'
  | 'outro';

export interface Patient {
  id: number;
  doctor_id: number;
  name: string;
  birth_date: string | null;
  age: number | null;
  health_plan: string | null;
  is_private: boolean;
  active: boolean;
  attendances_count?: number;
  attendances?: Attendance[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AttendanceShiftInfo {
  id: number;
  date: string | null;
  shift_type: ShiftType | null;
  shift_type_label: string | null;
  hospital_name: string | null;
}

export interface Attendance {
  id: number;
  doctor_id: number;
  patient_id: number;
  shift_id: number | null;
  kind: AttendanceKind;
  kind_label: string;
  attendance_number: string | null;
  date: string;
  value: number | null;
  payment_status: AttendancePaymentStatus | null;
  payment_status_label: string | null;
  location: string | null;
  notes: string | null;
  patient?: Patient;
  shift: AttendanceShiftInfo | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AttendancePayload {
  patient_id: number;
  kind: AttendanceKind;
  date: string;
  shift_id?: number | null;
  attendance_number?: string | null;
  value?: number | null;
  payment_status?: AttendancePaymentStatus | null;
  location?: string | null;
  notes?: string | null;
}

export interface PatientPayload {
  name: string;
  birth_date?: string | null;
  health_plan?: string | null;
}

export interface AttendanceSummary {
  year: number;
  monthly: Array<{
    month: number;
    shift_count: number;
    private_count: number;
    private_revenue: number;
  }>;
  by_kind: Array<{ kind: AttendanceKind; label: string; count: number }>;
  total_count: number;
  private_revenue_total: number;
}

export const ATTENDANCE_KIND_OPTIONS: { value: AttendanceKind; label: string }[] = [
  { value: 'shift', label: 'Em plantão' },
  { value: 'private', label: 'Consulta particular' },
];

export const PAYMENT_STATUS_OPTIONS: {
  value: AttendancePaymentStatus;
  label: string;
}[] = [
    { value: 'pending', label: 'Pendente' },
    { value: 'paid', label: 'Pago' },
  ];

export const SHIFT_TYPE_OPTIONS: { value: ShiftType; label: string }[] = [
  { value: 'pronto_atendimento', label: 'Pronto Atendimento' },
  { value: 'centro_cirurgico', label: 'Centro Cirúrgico' },
  { value: 'enfermaria', label: 'Enfermaria' },
  { value: 'uti', label: 'UTI' },
  { value: 'outro', label: 'Outro' },
];

export function monthlyPrivateRevenue(summary: AttendanceSummary | null | undefined): number[] {
  const monthly = Array(12).fill(0) as number[];
  for (const row of summary?.monthly ?? []) {
    if (row.month >= 1 && row.month <= 12) {
      monthly[row.month - 1] = Number(row.private_revenue) || 0;
    }
  }
  return monthly;
}

export function shiftTypeLabel(value?: string | null): string | null {
  if (!value) return null;
  return SHIFT_TYPE_OPTIONS.find((opt) => opt.value === value)?.label ?? value;
}

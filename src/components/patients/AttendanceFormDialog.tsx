import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronsUpDown, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { CurrencyInput } from '@/components/ui/currency-input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { formatNumberToCurrencyInput, parseCurrencyInput } from '@/lib/currency';
import { cn } from '@/lib/utils';
import type { Shift } from '@/types/shift';
import {
  ATTENDANCE_KIND_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  shiftTypeLabel,
  type Attendance,
  type AttendanceKind,
  type AttendancePaymentStatus,
  type Patient,
} from '@/types/patient';

import { PatientFormDialog } from './PatientFormDialog';
import { apiErrorMessage, formatISODate, todayISO } from './utils';

export interface AttendanceFormDefaults {
  patientId?: number;
  shiftId?: number;
  kind?: AttendanceKind;
  date?: string;
}

interface AttendanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendance?: Attendance | null;
  defaults?: AttendanceFormDefaults;
  onSaved: (attendance: Attendance) => void;
}

const NO_SHIFT = 'none';

function shiftOptionLabel(shift: Shift) {
  const parts = [formatISODate(shift.date)];
  if (shift.hospital?.name) parts.push(shift.hospital.name);
  const typeLabel = shift.shift_type_label || shiftTypeLabel(shift.shift_type);
  if (typeLabel) parts.push(typeLabel);
  if (shift.start_time) parts.push(shift.start_time.slice(0, 5));
  return parts.join(' · ');
}

export function AttendanceFormDialog({
  open,
  onOpenChange,
  attendance,
  defaults,
  onSaved,
}: AttendanceFormDialogProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [patientPickerOpen, setPatientPickerOpen] = useState(false);
  const [newPatientOpen, setNewPatientOpen] = useState(false);

  const [patientId, setPatientId] = useState<number | null>(null);
  const [kind, setKind] = useState<AttendanceKind>('shift');
  const [shiftId, setShiftId] = useState<string>(NO_SHIFT);
  const [date, setDate] = useState(todayISO());
  const [attendanceNumber, setAttendanceNumber] = useState('');
  const [value, setValue] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<AttendancePaymentStatus>('pending');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    api
      .listPatients()
      .then((data) => setPatients((data.patients || []) as Patient[]))
      .catch(() => setPatients([]));
    api
      .getShifts()
      .then((data) => {
        const list = (Array.isArray(data) ? data : []) as Shift[];
        list.sort((a, b) => (a.date < b.date ? 1 : -1));
        setShifts(list);
      })
      .catch(() => setShifts([]));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (attendance) {
      setPatientId(attendance.patient_id);
      setKind(attendance.kind);
      setShiftId(attendance.shift_id ? String(attendance.shift_id) : NO_SHIFT);
      setDate(attendance.date?.slice(0, 10) || todayISO());
      setAttendanceNumber(attendance.attendance_number || '');
      setValue(attendance.value != null ? formatNumberToCurrencyInput(Number(attendance.value)) : '');
      setPaymentStatus(attendance.payment_status || 'pending');
      setLocation(attendance.location || '');
      setNotes(attendance.notes || '');
    } else {
      setPatientId(defaults?.patientId ?? null);
      setKind(defaults?.kind ?? 'shift');
      setShiftId(defaults?.shiftId ? String(defaults.shiftId) : NO_SHIFT);
      setDate(defaults?.date || todayISO());
      setAttendanceNumber('');
      setValue('');
      setPaymentStatus('pending');
      setLocation('');
      setNotes('');
    }
    // Reset only when the dialog opens; parents may pass inline `defaults` objects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === patientId) ?? attendance?.patient ?? null,
    [patients, patientId, attendance]
  );

  const shiftOptions = useMemo(() => {
    const byDate = date ? shifts.filter((s) => s.date?.slice(0, 10) === date) : [];
    const base = byDate.length ? byDate : shifts;
    const selected = shifts.find((s) => String(s.id) === shiftId);
    if (selected && !base.some((s) => s.id === selected.id)) {
      return [selected, ...base];
    }
    return base;
  }, [shifts, date, shiftId]);

  const hasShiftsOnDate = useMemo(
    () => shifts.some((s) => s.date?.slice(0, 10) === date),
    [shifts, date]
  );

  const handleSave = async () => {
    if (!patientId) {
      toast.error('Selecione o paciente');
      return;
    }
    if (!date) {
      toast.error('Informe a data do atendimento');
      return;
    }
    let parsedValue: number | null = null;
    if (kind === 'private') {
      parsedValue = parseCurrencyInput(value);
      if (parsedValue == null) {
        toast.error('Informe o valor da consulta');
        return;
      }
    }

    const payload = {
      patient_id: patientId,
      kind,
      date,
      shift_id: kind === 'shift' && shiftId !== NO_SHIFT ? Number(shiftId) : null,
      attendance_number: attendanceNumber.trim() || null,
      value: kind === 'private' ? parsedValue : null,
      payment_status: kind === 'private' ? paymentStatus : null,
      location: kind === 'private' || shiftId === NO_SHIFT ? location.trim() || null : null,
      notes: notes.trim() || null,
    };

    try {
      setSaving(true);
      const data = attendance
        ? await api.updateAttendance(attendance.id, payload)
        : await api.createAttendance(payload);
      toast.success(attendance ? 'Atendimento atualizado' : 'Atendimento registrado');
      onSaved(data.attendance as Attendance);
      onOpenChange(false);
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Erro ao salvar atendimento'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{attendance ? 'Editar atendimento' : 'Novo atendimento'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Paciente</Label>
              <div className="flex gap-2">
                <Popover open={patientPickerOpen} onOpenChange={setPatientPickerOpen} modal>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className="flex-1 justify-between font-normal"
                    >
                      <span className="truncate">
                        {selectedPatient ? selectedPatient.name : 'Selecione o paciente'}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar por nome ou convênio..." />
                      <CommandList>
                        <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
                        <CommandGroup>
                          {patients.map((p) => (
                            <CommandItem
                              key={p.id}
                              value={`${p.name} ${p.health_plan ?? ''} ${p.id}`}
                              onSelect={() => {
                                setPatientId(p.id);
                                setPatientPickerOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  patientId === p.id ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              <span className="truncate">{p.name}</span>
                              <span className="ml-auto pl-2 text-xs text-muted-foreground">
                                {p.health_plan || 'Particular'}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setNewPatientOpen(true)}
                  aria-label="Cadastrar novo paciente"
                  title="Cadastrar novo paciente"
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={kind} onValueChange={(v) => setKind(v as AttendanceKind)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ATTENDANCE_KIND_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            {kind === 'shift' ? (
              <div className="space-y-2">
                <Label>Plantão (opcional)</Label>
                <Select value={shiftId} onValueChange={setShiftId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o plantão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_SHIFT}>Sem plantão vinculado</SelectItem>
                    {shiftOptions.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {shiftOptionLabel(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {shifts.length > 0 && !hasShiftsOnDate ? (
                  <p className="text-xs text-muted-foreground">
                    Nenhum plantão nesta data; mostrando todos.
                  </p>
                ) : null}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Valor da consulta</Label>
                  <CurrencyInput value={value} onValueChange={setValue} />
                </div>
                <div className="space-y-2">
                  <Label>Status do pagamento</Label>
                  <Select
                    value={paymentStatus}
                    onValueChange={(v) => setPaymentStatus(v as AttendancePaymentStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {kind === 'private' || shiftId === NO_SHIFT ? (
              <div className="space-y-2">
                <Label>Local (opcional)</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={
                    kind === 'private'
                      ? 'Ex.: Consultório Centro, Clínica X'
                      : 'Ex.: Hospital X - P.A.'
                  }
                  maxLength={150}
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>Nº de atendimento (opcional)</Label>
              <Input
                value={attendanceNumber}
                onChange={(e) => setAttendanceNumber(e.target.value)}
                placeholder="Número da etiqueta / ficha"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label>Observação (opcional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anotação livre. Evite registrar diagnóstico identificável."
                maxLength={2000}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PatientFormDialog
        open={newPatientOpen}
        onOpenChange={setNewPatientOpen}
        onSaved={(patient) => {
          setPatients((prev) =>
            [...prev.filter((p) => p.id !== patient.id), patient].sort((a, b) =>
              a.name.localeCompare(b.name)
            )
          );
          setPatientId(patient.id);
        }}
      />
    </>
  );
}

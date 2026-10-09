import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { formatCpfInput, formatPhoneInput } from '@/lib/patient-contact';
import type { Patient } from '@/types/patient';

import { apiErrorMessage, todayISO } from './utils';

interface PatientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient | null;
  onSaved: (patient: Patient) => void;
}

export function PatientFormDialog({
  open,
  onOpenChange,
  patient,
  onSaved,
}: PatientFormDialogProps) {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [healthPlan, setHealthPlan] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(patient?.name ?? '');
    setBirthDate(patient?.birth_date?.slice(0, 10) ?? '');
    setHealthPlan(patient?.health_plan ?? '');
    setPhone(formatPhoneInput(patient?.phone ?? ''));
    setCpf(formatCpfInput(patient?.cpf ?? ''));
  }, [open, patient]);

  const handleSave = async () => {
    if (name.trim().length < 2) {
      toast.error('Informe o nome do paciente');
      return;
    }
    const payload = {
      name: name.trim(),
      birth_date: birthDate || null,
      health_plan: healthPlan.trim() || null,
      phone: phone.trim() || null,
      cpf: cpf.trim() || null,
    };
    try {
      setSaving(true);
      const data = patient
        ? await api.updatePatient(patient.id, payload)
        : await api.createPatient(payload);
      toast.success(patient ? 'Paciente atualizado' : 'Paciente cadastrado');
      onSaved(data.patient as Patient);
      onOpenChange(false);
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Erro ao salvar paciente'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{patient ? 'Editar paciente' : 'Novo paciente'}</DialogTitle>
          <DialogDescription>
            Telefone e CPF servem para contato e para localizar o paciente. Ficam visíveis só para você.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do paciente"
              maxLength={150}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Data de nascimento</Label>
            <Input
              type="date"
              value={birthDate}
              max={todayISO()}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Convênio</Label>
            <Input
              value={healthPlan}
              onChange={(e) => setHealthPlan(e.target.value)}
              placeholder="Ex.: Unimed, SUS... (vazio = particular)"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label>Telefone (opcional)</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
              placeholder="(11) 98888-7777"
              inputMode="numeric"
            />
          </div>
          <div className="space-y-2">
            <Label>CPF (opcional)</Label>
            <Input
              value={cpf}
              onChange={(e) => setCpf(formatCpfInput(e.target.value))}
              placeholder="000.000.000-00"
              inputMode="numeric"
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
  );
}

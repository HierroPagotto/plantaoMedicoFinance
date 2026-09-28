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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(patient?.name ?? '');
    setBirthDate(patient?.birth_date?.slice(0, 10) ?? '');
    setHealthPlan(patient?.health_plan ?? '');
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
            Apenas os dados da etiqueta. Evite registrar CPF, contato ou diagnóstico.
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

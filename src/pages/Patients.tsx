import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Archive, ArchiveRestore, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { AppShell } from '@/components/layout/AppShell';
import { AttendanceFormDialog } from '@/components/patients/AttendanceFormDialog';
import { AttendanceListItem } from '@/components/patients/AttendanceListItem';
import { PatientFormDialog } from '@/components/patients/PatientFormDialog';
import { PatientLabelCard } from '@/components/patients/PatientLabelCard';
import { apiErrorMessage } from '@/components/patients/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageLoading } from '@/components/ui/PageLoading';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import api from '@/lib/api';
import type { Attendance, Patient } from '@/types/patient';

const Patients = () => {
  const { id: routePatientId } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [detail, setDetail] = useState<Patient | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(handle);
  }, [search]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await api.listPatients({
        search: debouncedSearch || undefined,
        include_inactive: showArchived,
      });
      setPatients((data.patients || []) as Patient[]);
    } catch {
      toast.error('Não foi possível carregar os pacientes');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (patientId: number | string) => {
    try {
      setDetailLoading(true);
      const data = await api.getPatient(patientId);
      setDetail(data.patient as Patient);
    } catch {
      toast.error('Paciente não encontrado');
      setDetail(null);
      navigate('/patients', { replace: true });
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, showArchived]);

  useEffect(() => {
    if (routePatientId) {
      loadDetail(routePatientId);
    } else {
      setDetail(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routePatientId]);

  const openPatient = (patient: Patient) => navigate(`/patients/${patient.id}`);
  const closeDetail = () => navigate('/patients');

  const openCreatePatient = () => {
    setEditingPatient(null);
    setFormOpen(true);
  };

  const openEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setFormOpen(true);
  };

  const handlePatientSaved = async (patient: Patient) => {
    await loadPatients();
    if (detail && detail.id === patient.id) {
      await loadDetail(patient.id);
    }
  };

  const toggleArchive = async (patient: Patient) => {
    try {
      await api.updatePatient(patient.id, { active: !patient.active });
      toast.success(patient.active ? 'Paciente arquivado' : 'Paciente reativado');
      await loadPatients();
      if (detail?.id === patient.id) await loadDetail(patient.id);
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Erro ao atualizar paciente'));
    }
  };

  const handleDeletePatient = async (patient: Patient) => {
    if (
      !window.confirm(
        `Excluir ${patient.name}? Todos os atendimentos deste paciente também serão excluídos.`
      )
    ) {
      return;
    }
    try {
      await api.deletePatient(patient.id);
      toast.success('Paciente excluído');
      if (detail?.id === patient.id) closeDetail();
      await loadPatients();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Erro ao excluir paciente'));
    }
  };

  const openNewAttendance = () => {
    setEditingAttendance(null);
    setAttendanceOpen(true);
  };

  const openEditAttendance = (attendance: Attendance) => {
    setEditingAttendance(attendance);
    setAttendanceOpen(true);
  };

  const handleDeleteAttendance = async (attendance: Attendance) => {
    if (!window.confirm('Excluir este atendimento?')) return;
    try {
      await api.deleteAttendance(attendance.id);
      toast.success('Atendimento excluído');
      if (detail) await loadDetail(detail.id);
      await loadPatients();
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Erro ao excluir atendimento'));
    }
  };

  const handleAttendanceSaved = async () => {
    if (detail) await loadDetail(detail.id);
    await loadPatients();
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
            <p className="text-muted-foreground text-sm">
              Cadastro com os dados da etiqueta e histórico de atendimentos
            </p>
          </div>
          <Button onClick={openCreatePatient}>
            <Plus className="h-4 w-4 mr-2" />
            Novo paciente
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou convênio"
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="show-archived" checked={showArchived} onCheckedChange={setShowArchived} />
            <Label htmlFor="show-archived">Mostrar arquivados</Label>
          </div>
        </div>

        {loading ? (
          <PageLoading label="Carregando pacientes..." />
        ) : patients.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              {debouncedSearch
                ? 'Nenhum paciente encontrado para essa busca.'
                : 'Nenhum paciente cadastrado ainda.'}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {patients.map((patient) => (
              <PatientLabelCard
                key={patient.id}
                patient={patient}
                onClick={() => openPatient(patient)}
                className={patient.active ? undefined : 'opacity-60'}
                actions={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => openEditPatient(patient)}
                    aria-label="Editar paciente"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                }
              />
            ))}
          </div>
        )}
      </div>

      <Sheet open={Boolean(routePatientId)} onOpenChange={(open) => !open && closeDetail()}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{detail?.name ?? 'Paciente'}</SheetTitle>
            <SheetDescription>Etiqueta e histórico de atendimentos</SheetDescription>
          </SheetHeader>
          {detailLoading && !detail ? (
            <PageLoading label="Carregando paciente..." />
          ) : detail ? (
            <div className="mt-4 space-y-5">
              <PatientLabelCard patient={detail} />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={openNewAttendance}>
                  <Plus className="h-4 w-4 mr-1" />
                  Novo atendimento
                </Button>
                <Button size="sm" variant="outline" onClick={() => openEditPatient(detail)}>
                  <Pencil className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button size="sm" variant="outline" onClick={() => toggleArchive(detail)}>
                  {detail.active ? (
                    <Archive className="h-4 w-4 mr-1" />
                  ) : (
                    <ArchiveRestore className="h-4 w-4 mr-1" />
                  )}
                  {detail.active ? 'Arquivar' : 'Reativar'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDeletePatient(detail)}>
                  <Trash2 className="h-4 w-4 mr-1 text-destructive" />
                  Excluir
                </Button>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold">
                  Atendimentos ({detail.attendances_count ?? 0})
                </h3>
                {(detail.attendances ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum atendimento registrado para este paciente.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {(detail.attendances ?? []).map((attendance) => (
                      <AttendanceListItem
                        key={attendance.id}
                        attendance={attendance}
                        showPatient={false}
                        onEdit={openEditAttendance}
                        onDelete={handleDeleteAttendance}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <PatientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        patient={editingPatient}
        onSaved={handlePatientSaved}
      />

      <AttendanceFormDialog
        open={attendanceOpen}
        onOpenChange={setAttendanceOpen}
        attendance={editingAttendance}
        defaults={detail ? { patientId: detail.id } : undefined}
        onSaved={handleAttendanceSaved}
      />
    </AppShell>
  );
};

export default Patients;

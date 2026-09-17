import { AppShell } from '@/components/layout/AppShell';
import { ShiftCard, type ShiftProps, type ShiftStatus } from '@/components/shifts/ShiftCard';
import { isMarketplaceShift } from '@/components/shifts/shift-utils';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Filter, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { addDays, addMonths, subDays, subMonths } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { DateRange } from 'react-day-picker';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ShiftForm } from '@/components/shifts/ShiftForm';
import { ShiftExpensesSection } from '@/components/shifts/ShiftExpensesSection';
import { Badge } from '@/components/ui/badge';
import { Info, CheckCircle } from 'lucide-react';
import type { Shift } from '@/types/shift';
import { formatShortDate } from '@/lib/date-utils';
import { PageLoading } from '@/components/ui/PageLoading';
import { Checkbox } from '@/components/ui/checkbox';

type FilterOptions = {
  status: string;
  specialty: string;
  dateRange: DateRange | undefined;
  search: string;
};

type ApiShift = {
  id: number;
  date: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  hospital: {
    name: string;
    address: string;
    id: number;
    latitude: number;
    longitude: number;
    created_at: string;
  };
  hospital_id: number;
  doctor_id: number;
  specialty: string;
  status: string;
  value: number;
  payment_date: string | null;
  source?: string;
  opportunity_id?: number | null;
  expenses_total?: number;
  net_value?: number;
  created_at: string;
  updated_at: string;
};

const statusConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: 'Agendado', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Realizado', color: 'bg-green-100 text-green-800' },
  paid: { label: 'Pago', color: 'bg-purple-100 text-purple-800' },
  canceled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

const Shifts = () => {
  const [shifts, setShifts] = useState<ShiftProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    specialty: 'all',
    dateRange: undefined,
    search: '',
  });
  const [selectedShift, setSelectedShift] = useState<ShiftProps | null>(null);
  const [editShift, setEditShift] = useState<ShiftProps | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  const specialties = [
    'Cardiologia',
    'Clínica Médica',
    'Dermatologia',
    'Endocrinologia',
    'Gastroenterologia',
    'Geriatria',
    'Ginecologia',
    'Neurologia',
    'Oftalmologia',
    'Ortopedia',
    'Pediatria',
    'Psiquiatria',
    'Radiologia',
    'Urologia'
  ];

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        setLoading(true);
        const response = await api.getShifts();
        const formattedShifts = response.map((shift: ApiShift) => ({
          id: shift.id.toString(),
          date: new Date(shift.date),
          endDate: shift.end_date ? new Date(shift.end_date) : undefined,
          startTime: shift.start_time.substring(0, 5),
          endTime: shift.end_time.substring(0, 5),
          hospital: {
            name: shift.hospital.name,
            address: shift.hospital.address,
          },
          value: shift.value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2
          }),
          valueNumber: Number(shift.value),
          expensesTotal: Number(shift.expenses_total || 0),
          netValue:
            shift.net_value != null
              ? Number(shift.net_value)
              : Number(shift.value) - Number(shift.expenses_total || 0),
          specialty: shift.specialty,
          paymentDate: shift.payment_date ? new Date(shift.payment_date) : null,
          status: shift.status,
          source: shift.source || 'manual',
          opportunityId: shift.opportunity_id ?? null,
        }));
        setShifts(formattedShifts);
      } catch (err) {
        setError('Erro ao carregar os plantões');
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();
  }, []);

  const handleStatusChange = (id: string, newStatus: ShiftStatus | 'deleted') => {
    if (newStatus === 'deleted') {
      setShifts(prevShifts => prevShifts.filter(shift => shift.id !== id));
      return;
    }
    
    setShifts(prevShifts => 
      prevShifts.map(shift => 
        shift.id === id ? { ...shift, status: newStatus as ShiftStatus } : shift
      )
    );
  };

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(i => i !== id));
  };
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(
        filteredShifts.filter((s) => !isMarketplaceShift(s)).map((s) => s.id)
      );
    } else {
      setSelectedIds([]);
    }
  };
  const handleBulkDelete = async () => {
    if (!window.confirm('Tem certeza que deseja deletar os plantões selecionados?')) return;
    setDeleting(true);
    try {
      const idsNum = selectedIds.map(id => Number(id));
      await api.bulkDeleteShifts(idsNum);
      setShifts(prev => prev.filter(s => !selectedIds.includes(s.id)));
      setSelectedIds([]);
      toast.success('Plantões deletados com sucesso');
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined;
      toast.error(message || 'Erro ao deletar plantões.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredShifts = shifts.filter(shift => {
    if (filters.status !== 'all' && shift.status !== filters.status) return false;

    if (filters.specialty !== 'all' && shift.specialty !== filters.specialty) return false;

    if (filters.dateRange && filters.dateRange.from && filters.dateRange.to) {
      const shiftDate = new Date(shift.date);
      const { from, to } = filters.dateRange;
      if (shiftDate < from || shiftDate > to) return false;
    }

    if (filters.search && !shift.hospital.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <AppShell>
        <PageLoading label="Carregando plantões..." />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Plantões</h1>
        <div className="flex items-center space-x-2">
          {selectedIds.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete} disabled={deleting}>
              {deleting ? 'Deletando...' : `Deletar selecionados (${selectedIds.length})`}
            </Button>
          )}
          <Button asChild>
            <Link to="/shifts/new">
              <Plus className="mr-2 h-4 w-4" /> Novo plantão
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4 mb-6">
        <div className="flex items-center mb-4">
          <Filter className="mr-2 h-5 w-5 text-muted-foreground" />
          <h2 className="font-medium">Filtros</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/*<div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="scheduled">Agendados</SelectItem>
                <SelectItem value="completed">Realizados</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="canceled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>*/}

          <div className="space-y-2">
            <label className="text-sm font-medium">Especialidade</label>
            <Select
              value={filters.specialty}
              onValueChange={(value) => setFilters({ ...filters, specialty: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por especialidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {specialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Período</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange?.from && filters.dateRange?.to
                    ? `${filters.dateRange.from.toLocaleDateString()} - ${filters.dateRange.to.toLocaleDateString()}`
                    : "Selecionar período"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={filters.dateRange}
                  onSelect={(range: DateRange | undefined) => setFilters({ ...filters, dateRange: range })}
                  numberOfMonths={2}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Buscar hospital</label>
            <Input
              placeholder="Nome do hospital"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredShifts.length > 0 ? (
          <>
            <div className="col-span-full flex items-center gap-2 mb-2">
              <Checkbox
                checked={(() => {
                  const selectableCount = filteredShifts.filter(
                    (s) => !isMarketplaceShift(s)
                  ).length;
                  if (selectableCount > 0 && selectedIds.length === selectableCount) {
                    return true;
                  }
                  if (selectedIds.length > 0 && selectedIds.length < selectableCount) {
                    return 'indeterminate';
                  }
                  return false;
                })()}
                onCheckedChange={checked => handleSelectAll(!!checked)}
                id="select-all-shifts"
              />
              <label htmlFor="select-all-shifts" className="text-sm">Selecionar todos</label>
            </div>
            {filteredShifts.map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                onStatusChange={handleStatusChange}
                onShowDetails={() => setSelectedShift(shift)}
                onEdit={
                  isMarketplaceShift(shift) ? undefined : () => setEditShift(shift)
                }
                checkbox={
                  isMarketplaceShift(shift) ? undefined : (
                    <Checkbox
                      checked={selectedIds.includes(shift.id)}
                      onCheckedChange={checked => handleSelect(shift.id, !!checked)}
                      className="mr-2"
                    />
                  )
                }
              />
            ))}
          </>
        ) : (
          <div className="col-span-full flex items-center justify-center h-40 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">Nenhum plantão encontrado com os filtros aplicados.</p>
          </div>
        )}
      </div>
      {/* Dialog de Detalhes */}
      <Dialog open={!!selectedShift} onOpenChange={() => setSelectedShift(null)}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do plantão</DialogTitle>
            <DialogDescription>
              Informações completas sobre o plantão
            </DialogDescription>
          </DialogHeader>
          {selectedShift && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Data</h4>
                  <p>
                    {formatShortDate(selectedShift.date)}
                    {selectedShift.endDate && (
                      <span className="text-muted-foreground"> até {formatShortDate(selectedShift.endDate)}</span>
                    )}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Horário</h4>
                  <p>{selectedShift.startTime} - {selectedShift.endTime}</p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Hospital</h4>
                  <p>{selectedShift.hospital.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedShift.hospital.address}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Especialidade</h4>
                  <p>{selectedShift.specialty}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Valor</h4>
                  <p className="font-medium">{selectedShift.value}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Data para pagamento</h4>
                  <p>
                    {selectedShift.paymentDate &&
                    !Number.isNaN(selectedShift.paymentDate.getTime())
                      ? formatShortDate(selectedShift.paymentDate)
                      : 'A definir'}
                  </p>
                </div>
                {isMarketplaceShift(selectedShift) && (
                  <div className="col-span-2">
                    <Badge variant="secondary">Marketplace — plantão travado; gastos liberados</Badge>
                  </div>
                )}
              </div>
              <ShiftExpensesSection
                shiftId={selectedShift.id}
                shiftValue={selectedShift.valueNumber}
                onChanged={({ expensesTotal, netValue }) => {
                  setSelectedShift((prev) =>
                    prev ? { ...prev, expensesTotal, netValue } : prev
                  );
                  setShifts((prev) =>
                    prev.map((s) =>
                      s.id === selectedShift.id
                        ? { ...s, expensesTotal, netValue }
                        : s
                    )
                  );
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Dialog de Edição */}
      <Dialog open={!!editShift} onOpenChange={() => setEditShift(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar plantão</DialogTitle>
            <DialogDescription>Altere os campos desejados e gerencie os gastos do plantão.</DialogDescription>
          </DialogHeader>
          {editShift && (
            <ShiftForm
              mode="edit"
              initialData={editShift}
              onSuccess={() => {
                setEditShift(null);
              }}
              onCancel={() => setEditShift(null)}
              onExpensesChanged={({ expensesTotal, netValue }) => {
                setEditShift((prev) =>
                  prev ? { ...prev, expensesTotal, netValue } : prev
                );
                setShifts((prev) =>
                  prev.map((s) =>
                    s.id === editShift.id ? { ...s, expensesTotal, netValue } : s
                  )
                );
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default Shifts;
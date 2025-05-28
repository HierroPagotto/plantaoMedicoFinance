import { AppShell } from '@/components/layout/AppShell';
import { ShiftCard, type ShiftProps, type ShiftStatus } from '@/components/shifts/ShiftCard';
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
  payment_date: string;
  created_at: string;
  updated_at: string;
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
          specialty: shift.specialty,
          paymentDate: new Date(shift.payment_date),
          status: shift.status,
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
        <div className="flex items-center justify-center h-64">
          <p>Carregando plantões...</p>
        </div>
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
          <div className="space-y-2">
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
          </div>

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
          filteredShifts.map((shift) => (
            <ShiftCard 
              key={shift.id} 
              shift={shift} 
              onStatusChange={handleStatusChange}
            />
          ))
        ) : (
          <div className="col-span-full flex items-center justify-center h-40 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">Nenhum plantão encontrado com os filtros aplicados.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Shifts;
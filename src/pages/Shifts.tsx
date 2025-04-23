
import { AppShell } from '@/components/layout/AppShell';
import { ShiftCard, type ShiftProps } from '@/components/shifts/ShiftCard';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, Plus } from 'lucide-react';
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

type FilterOptions = {
  status: string;
  specialty: string;
  dateRange: Date[] | undefined;
  search: string;
};

const Shifts = () => {
  const [shifts, setShifts] = useState<ShiftProps[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    specialty: 'all',
    dateRange: undefined,
    search: '',
  });
  
  const specialties = [
    'Clínica Médica',
    'Cardiologia',
    'Pediatria',
  ];

  useEffect(() => {
    // Mock data for demonstration
    const mockShifts: ShiftProps[] = [
      {
        id: '1',
        date: addDays(new Date(), 2),
        startTime: '08:00',
        endTime: '20:00',
        hospital: {
          name: 'Hospital São Lucas',
          address: 'Av. Brasília, 2084 - Centro, Araraquara - SP',
        },
        value: '1.250,00',
        specialty: 'Clínica Médica',
        paymentDate: addMonths(new Date(), 1),
        status: 'scheduled',
      },
      {
        id: '2',
        date: subDays(new Date(), 3),
        startTime: '19:00',
        endTime: '07:00',
        hospital: {
          name: 'Hospital Santa Casa',
          address: 'R. Padre Duarte, 700 - Jardim Nova América, Araraquara - SP',
        },
        value: '1.500,00',
        specialty: 'Cardiologia',
        paymentDate: addDays(new Date(), 5),
        status: 'completed',
      },
      {
        id: '3',
        date: subDays(new Date(), 10),
        startTime: '08:00',
        endTime: '20:00',
        hospital: {
          name: 'Hospital Unimed',
          address: 'Av. José Bonifácio, 794 - Jardim Botafogo, Araraquara - SP',
        },
        value: '1.300,00',
        specialty: 'Clínica Médica',
        paymentDate: subDays(new Date(), 2),
        status: 'paid',
      },
      {
        id: '4',
        date: new Date(),
        startTime: '08:00',
        endTime: '20:00',
        hospital: {
          name: 'Hospital São Paulo',
          address: 'R. Voluntários de São Paulo, 2150 - Centro, Araraquara - SP',
        },
        value: '1.200,00',
        specialty: 'Pediatria',
        paymentDate: addDays(new Date(), 15),
        status: 'scheduled',
      },
      {
        id: '5',
        date: subMonths(new Date(), 1),
        startTime: '08:00',
        endTime: '20:00',
        hospital: {
          name: 'Hospital São Lucas',
          address: 'Av. Brasília, 2084 - Centro, Araraquara - SP',
        },
        value: '1.250,00',
        specialty: 'Clínica Médica',
        paymentDate: subDays(new Date(), 5),
        status: 'canceled',
      },
      {
        id: '6',
        date: addDays(new Date(), 5),
        startTime: '19:00',
        endTime: '07:00',
        hospital: {
          name: 'Hospital Santa Casa',
          address: 'R. Padre Duarte, 700 - Jardim Nova América, Araraquara - SP',
        },
        value: '1.400,00',
        specialty: 'Cardiologia',
        paymentDate: addDays(new Date(), 20),
        status: 'scheduled',
      },
      {
        id: '7',
        date: addDays(new Date(), 10),
        startTime: '08:00',
        endTime: '20:00',
        hospital: {
          name: 'Hospital Unimed',
          address: 'Av. José Bonifácio, 794 - Jardim Botafogo, Araraquara - SP',
        },
        value: '1.350,00',
        specialty: 'Clínica Médica',
        paymentDate: addDays(new Date(), 25),
        status: 'scheduled',
      },
      {
        id: '8',
        date: subDays(new Date(), 5),
        startTime: '08:00',
        endTime: '20:00',
        hospital: {
          name: 'Hospital São Paulo',
          address: 'R. Voluntários de São Paulo, 2150 - Centro, Araraquara - SP',
        },
        value: '1.250,00',
        specialty: 'Pediatria',
        paymentDate: addDays(new Date(), 10),
        status: 'completed',
      },
    ];

    setShifts(mockShifts);
  }, []);

  const filteredShifts = shifts.filter(shift => {
    // Filter by status
    if (filters.status !== 'all' && shift.status !== filters.status) return false;
    
    // Filter by specialty
    if (filters.specialty !== 'all' && shift.specialty !== filters.specialty) return false;
    
    // Filter by date range
    if (filters.dateRange && filters.dateRange.length === 2) {
      const shiftDate = new Date(shift.date);
      const [start, end] = filters.dateRange;
      if (shiftDate < start || shiftDate > end) return false;
    }
    
    // Filter by search text (hospital name or address)
    if (filters.search && !shift.hospital.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

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
      
      {/* Filters */}
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
                  <Calendar className="mr-2 h-4 w-4" />
                  {filters.dateRange?.length === 2
                    ? `${filters.dateRange[0].toLocaleDateString()} - ${filters.dateRange[1].toLocaleDateString()}`
                    : "Selecionar período"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="range"
                  selected={filters.dateRange}
                  onSelect={(dates) => setFilters({ ...filters, dateRange: dates })}
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
      
      {/* Shifts list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredShifts.length > 0 ? (
          filteredShifts.map((shift) => (
            <ShiftCard key={shift.id} shift={shift} />
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

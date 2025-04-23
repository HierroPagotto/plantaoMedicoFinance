
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronDown, Download, Filter, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { type ShiftProps, type ShiftStatus } from '@/components/shifts/ShiftCard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { addDays, addMonths, subDays, subMonths } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const statusConfig = {
  scheduled: { label: 'Agendado', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Realizado', color: 'bg-green-100 text-green-800' },
  paid: { label: 'Pago', color: 'bg-purple-100 text-purple-800' },
  canceled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

const History = () => {
  const [shifts, setShifts] = useState<ShiftProps[]>([]);
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ShiftProps | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

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
        date: subMonths(new Date(), 2),
        startTime: '19:00',
        endTime: '07:00',
        hospital: {
          name: 'Hospital Santa Casa',
          address: 'R. Padre Duarte, 700 - Jardim Nova América, Araraquara - SP',
        },
        value: '1.500,00',
        specialty: 'Cardiologia',
        paymentDate: subMonths(new Date(), 1),
        status: 'paid',
      },
      {
        id: '7',
        date: subMonths(new Date(), 2),
        startTime: '08:00',
        endTime: '20:00',
        hospital: {
          name: 'Hospital Unimed',
          address: 'Av. José Bonifácio, 794 - Jardim Botafogo, Araraquara - SP',
        },
        value: '1.300,00',
        specialty: 'Clínica Médica',
        paymentDate: subMonths(new Date(), 1),
        status: 'paid',
      },
      {
        id: '8',
        date: subMonths(new Date(), 3),
        startTime: '08:00',
        endTime: '20:00',
        hospital: {
          name: 'Hospital São Paulo',
          address: 'R. Voluntários de São Paulo, 2150 - Centro, Araraquara - SP',
        },
        value: '1.200,00',
        specialty: 'Pediatria',
        paymentDate: subMonths(new Date(), 2),
        status: 'paid',
      },
    ];

    setShifts(mockShifts);
  }, []);

  const filteredShifts = shifts.filter(shift => {
    // Filter by status
    if (filterStatus !== 'all' && shift.status !== filterStatus) return false;
    
    // Filter by search text
    if (search && !shift.hospital.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const updateShiftStatus = (id: string, newStatus: ShiftStatus) => {
    setShifts(prevShifts => 
      prevShifts.map(shift => 
        shift.id === id ? { ...shift, status: newStatus } : shift
      )
    );
    setSelectedShift(null);
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Histórico de plantões</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
        </div>
      </div>

      <div className="bg-card border rounded-lg mb-6">
        <div className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por hospital..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => setIsFilterOpen(!isFilterOpen)}>
            <Filter className="mr-2 h-4 w-4" /> Filtros
          </Button>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="scheduled">Agendados</SelectItem>
              <SelectItem value="completed">Realizados</SelectItem>
              <SelectItem value="paid">Pagos</SelectItem>
              <SelectItem value="canceled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Data</TableHead>
              <TableHead>Hospital</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShifts.length > 0 ? (
              filteredShifts.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(shift.date, "dd/MM/yy", { locale: ptBR })}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {shift.startTime} - {shift.endTime}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{shift.hospital.name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {shift.hospital.address}
                    </div>
                  </TableCell>
                  <TableCell>{shift.specialty}</TableCell>
                  <TableCell>R$ {shift.value}</TableCell>
                  <TableCell>
                    <Badge className={statusConfig[shift.status].color}>
                      {statusConfig[shift.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(shift.paymentDate, "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Ações <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedShift(shift)}>
                          Detalhes
                        </DropdownMenuItem>
                        {shift.status === 'scheduled' && (
                          <DropdownMenuItem onClick={() => updateShiftStatus(shift.id, 'completed')}>
                            Marcar como realizado
                          </DropdownMenuItem>
                        )}
                        {(shift.status === 'scheduled' || shift.status === 'completed') && (
                          <DropdownMenuItem onClick={() => updateShiftStatus(shift.id, 'paid')}>
                            Marcar como pago
                          </DropdownMenuItem>
                        )}
                        {shift.status === 'scheduled' && (
                          <DropdownMenuItem onClick={() => updateShiftStatus(shift.id, 'canceled')}>
                            Cancelar plantão
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhum plantão encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Shift details dialog */}
      <Dialog open={!!selectedShift} onOpenChange={() => setSelectedShift(null)}>
        <DialogContent className="sm:max-w-md">
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
                  <p>{format(selectedShift.date, "dd/MM/yyyy", { locale: ptBR })}</p>
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
                  <p className="font-medium">R$ {selectedShift.value}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <Badge className={statusConfig[selectedShift.status].color}>
                    {statusConfig[selectedShift.status].label}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Data para pagamento</h4>
                  <p>{format(selectedShift.paymentDate, "dd/MM/yyyy", { locale: ptBR })}</p>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                {selectedShift.status === 'scheduled' && (
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => updateShiftStatus(selectedShift.id, 'completed')}
                  >
                    Marcar como realizado
                  </Button>
                )}
                {(selectedShift.status === 'scheduled' || selectedShift.status === 'completed') && (
                  <Button 
                    className="w-full sm:w-auto"
                    onClick={() => updateShiftStatus(selectedShift.id, 'paid')}
                  >
                    Marcar como pago
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default History;

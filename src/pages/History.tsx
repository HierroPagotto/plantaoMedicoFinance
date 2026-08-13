import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
import { Calendar, ChevronDown, Download, Filter, Search, Trash2, Info, CheckCircle, DollarSign, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatShortDate, formatMediumDate, formatISODate } from '@/lib/date-utils';
import { ptBR } from 'date-fns/locale';
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
import api from '@/lib/api';
import { ShiftForm } from '@/components/shifts/ShiftForm';
import { isMarketplaceShift } from '@/components/shifts/ShiftCard';

interface Hospital {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

interface Shift {
  id: number;
  doctor_id: number;
  hospital_id: number;
  date: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  value: number;
  status: 'scheduled' | 'completed' | 'paid' | 'canceled';
  payment_date: string | null;
  specialty: string;
  hospital: Hospital;
  source?: string;
  opportunity_id?: number | null;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: 'Agendado', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Realizado', color: 'bg-green-100 text-green-800' },
  paid: { label: 'Pago', color: 'bg-purple-100 text-purple-800' },
  canceled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

const History = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [shiftToDelete, setShiftToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editShift, setEditShift] = useState<Shift | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        setLoading(true);
        const response = await api.getShifts();
        setShifts(response);
      } catch (error) {
        console.error('Erro ao buscar plantões:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();
  }, []);

  const filteredShifts = shifts.filter(shift => {
    if (filterStatus !== 'all' && shift.status !== filterStatus) return false;

    if (search && !shift.hospital.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    return true;
  });

  const updateShiftStatus = async (id: number, newStatus: Shift['status']) => {
    try {
      await api.updateShiftStatus(id, newStatus);

      setShifts(prevShifts =>
        prevShifts.map(shift =>
          shift.id === id ? { ...shift, status: newStatus } : shift
        )
      );
      setSelectedShift(null);
      toast({
        title: 'Status atualizado',
        description: `O plantão foi marcado como ${statusConfig[newStatus].label.toLowerCase()}.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do plantão.',
        variant: 'destructive',
      });
    }
  };

  const deleteShift = async () => {
    if (!shiftToDelete) return;
    
    try {
      setIsDeleting(true);
      
      await api.deleteShift(shiftToDelete);
      
      setShifts(prevShifts => prevShifts.filter(shift => shift.id !== shiftToDelete));
      toast({
        title: 'Plantão excluído',
        description: 'O plantão foi excluído com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao excluir plantão:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o plantão. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShiftToDelete(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const exportToCSV = () => {
    if (shifts.length === 0) return;

    const headers = [
      'ID',
      'Data',
      'Horário',
      'Hospital',
      //'Endereço',
      'Especialidade',
      'Valor (R$)',
      'Status',
      'Data Pagamento',
      'Data Criação'
    ];

    const rows = shifts.map((shift) => [
      shift.id,
      formatShortDate(shift.date),
      `${shift.start_time} - ${shift.end_time}`,
      shift.hospital.name,
      //shift.hospital.address,
      shift.specialty,
      shift.value.toFixed(2),
      statusConfig[shift.status].label,
      shift.payment_date ? formatShortDate(shift.payment_date) : 'N/A',
      formatShortDate(shift.created_at)
    ]);

    let csvContent = headers.join(';') + '\n';
    rows.forEach(row => {
      csvContent += row.join(';') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `historico_plantoes_${formatISODate(new Date()).replace(/-/g, '')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditChange = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleEditSave = async () => {
    if (!editShift) return;
    setSavingEdit(true);
    try {
      await api.updateShift(editShift.id, editData);
      setShifts((prev) => prev.map((s) => s.id === editShift.id ? { ...s, ...editData } : s));
      setEditShift(null);
      setEditData({});
      toast({ title: 'Plantão atualizado com sucesso!' });
    } catch {
      toast({ title: 'Erro ao atualizar plantão', variant: 'destructive' });
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <p>Carregando plantões...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Histórico de plantões</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV} disabled={shifts.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
        </div>
      </div>

      {/*<div className="bg-card border rounded-lg mb-6">
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
      </div>*/}

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Data</TableHead>
              <TableHead className="w-[100px]">Horário</TableHead>
              <TableHead>Hospital</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Valor</TableHead>
              {/*<TableHead>Status</TableHead>*/}
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
                      <span>
                        {formatShortDate(shift.date).substring(0, 8)}
                        {shift.end_date && (
                          <span className="text-muted-foreground"> até {formatShortDate(shift.end_date).substring(0, 8)}</span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs mt-1">
                      {shift.start_time} - {shift.end_time}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{shift.hospital.name}</div>
                    {/*<div className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {shift.hospital.address}
                    </div>*/}
                  </TableCell>
                  <TableCell>{shift.specialty}</TableCell>
                  <TableCell>{formatCurrency(shift.value)}</TableCell>
                  {/*<TableCell>
                    <Badge className={statusConfig[shift.status].color}>
                      {statusConfig[shift.status].label}
                    </Badge>
                  </TableCell>*/}
                  <TableCell>
                    {shift.payment_date ? formatShortDate(shift.payment_date) : 'A definir'}
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
                          <Info className="mr-2 h-4 w-4 text-blue-500" />
                          Detalhes
                        </DropdownMenuItem>
                        {!isMarketplaceShift(shift) && (
                          <DropdownMenuItem onClick={() => { setEditShift(shift); setEditData(shift); }}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            Editar
                          </DropdownMenuItem>
                        )}
                        {isMarketplaceShift(shift) && (
                          <DropdownMenuItem disabled className="text-muted-foreground text-xs">
                            Origem: marketplace (somente leitura)
                          </DropdownMenuItem>
                        )}
                        {!isMarketplaceShift(shift) && (
                          <DropdownMenuItem 
                            onClick={() => setShiftToDelete(shift.id)}
                            className="text-red-500"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir plantão
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
                  {shifts.length === 0 ? 'Nenhum plantão cadastrado.' : 'Nenhum plantão encontrado com os filtros aplicados.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
                  <p>
                    {formatShortDate(selectedShift.date)}
                    {selectedShift.end_date && (
                      <span className="text-muted-foreground"> até {formatShortDate(selectedShift.end_date)}</span>
                    )}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Horário</h4>
                  <p>{selectedShift.start_time} - {selectedShift.end_time}</p>
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
                  <p className="font-medium">{formatCurrency(selectedShift.value)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <Badge className={statusConfig[selectedShift.status].color}>
                    {statusConfig[selectedShift.status].label}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Data para pagamento</h4>
                  <p>
                    {selectedShift.payment_date
                      ? formatShortDate(selectedShift.payment_date)
                      : 'A definir'}
                  </p>
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

      <Dialog open={!!editShift} onOpenChange={() => setEditShift(null)}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar plantão</DialogTitle>
            <DialogDescription>Altere os campos desejados e salve.</DialogDescription>
          </DialogHeader>
          {editShift && (
            <ShiftForm
              mode="edit"
              initialData={editShift}
              onSuccess={() => {
                setEditShift(null);
                // Atualizar lista após edição
                const fetchShifts = async () => {
                  try {
                    setLoading(true);
                    const response = await api.getShifts();
                    setShifts(response);
                  } catch (error) {
                    console.error('Erro ao buscar plantões:', error);
                  } finally {
                    setLoading(false);
                  }
                };
                fetchShifts();
              }}
              onCancel={() => setEditShift(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!shiftToDelete} onOpenChange={(open) => !open && setShiftToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir plantão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este plantão? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteShift}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
};

export default History;
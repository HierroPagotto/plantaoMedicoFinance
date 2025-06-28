import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Trash2 } from 'lucide-react';
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
import { formatMediumDate, formatShortDate } from '@/lib/date-utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  payment_date: string;
  specialty: string;
  hospital: Hospital;
  created_at: string;
  updated_at: string;
}

interface ShiftTableProps {
  shifts: Shift[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: 'Agendado', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Realizado', color: 'bg-green-100 text-green-800' },
  paid: { label: 'Pago', color: 'bg-purple-100 text-purple-800' },
  canceled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

export function ShiftTable({ shifts }: ShiftTableProps) {
  const [filter, setFilter] = useState<Shift['status'] | 'all'>('all');
  const [localShifts, setLocalShifts] = useState<Shift[]>(shifts);
  const [shiftToDelete, setShiftToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setLocalShifts(shifts);
  }, [shifts]);

  const filteredShifts = filter === 'all'
    ? localShifts
    : localShifts.filter(shift => shift.status === filter);
    
  const handleDeleteShift = async () => {
    if (!shiftToDelete) return;
    
    try {
      setIsDeleting(true);
      
      await api.deleteShift(shiftToDelete);
      
      setLocalShifts(prevShifts => prevShifts.filter(shift => shift.id !== shiftToDelete));
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

  return (
    <Card className="col-span-1 md:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Últimos plantões</CardTitle>
        {/*<Select
          defaultValue="all"
          onValueChange={(value: Shift['status'] | 'all') => setFilter(value)}
        >
          <SelectTrigger className="h-8 w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="scheduled">Agendados</SelectItem>
            <SelectItem value="completed">Realizados</SelectItem>
            <SelectItem value="paid">Pagos</SelectItem>
            <SelectItem value="canceled">Cancelados</SelectItem>
          </SelectContent>
        </Select>*/}
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Hospital</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Especialidade</TableHead>
                <TableHead className="hidden md:table-cell">Pagamento</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShifts.length > 0 ? (
                filteredShifts.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell>
                      <div className="font-medium">
                        {formatMediumDate(shift.date)}
                        {shift.end_date && (
                          <span className="text-muted-foreground"> até {formatMediumDate(shift.end_date)}</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground md:hidden">
                        {shift.start_time} - {shift.end_time}
                      </div>
                    </TableCell>
                    <TableCell>{shift.hospital.name}</TableCell>
                    <TableCell className="font-medium">R$ {shift.value}</TableCell>
                    <TableCell>
                      <Badge className={statusConfig[shift.status].color}>
                        {statusConfig[shift.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{shift.specialty}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatShortDate(shift.payment_date)}
                    </TableCell>
                    <TableCell>
                      {shift.status !== 'paid' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => setShiftToDelete(shift.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
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
                                onClick={handleDeleteShift}
                                disabled={isDeleting}
                              >
                                {isDeleting ? 'Excluindo...' : 'Excluir'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    Nenhum plantão encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
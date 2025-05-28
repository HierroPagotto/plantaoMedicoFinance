
import { Calendar, Clock, MapPin, DollarSign, ChevronDown, CheckCircle, XCircle, Info, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMediumDate, formatShortDate } from '@/lib/date-utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import api from '@/lib/api';

export type ShiftStatus = 'scheduled' | 'completed' | 'paid' | 'canceled';

export interface ShiftProps {
  id: string;
  date: Date;
  endDate?: Date;
  startTime: string;
  endTime: string;
  hospital: {
    name: string;
    address: string;
  };
  value: string;
  specialty: string;
  paymentDate: Date;
  status: ShiftStatus;
}

interface ShiftCardProps {
  shift: ShiftProps;
  compact?: boolean;
  onStatusChange?: (id: string, newStatus: ShiftStatus) => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: 'Agendado', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Realizado', color: 'bg-green-100 text-green-800' },
  paid: { label: 'Pago', color: 'bg-purple-100 text-purple-800' },
  canceled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

export function ShiftCard({ shift, compact = false, onStatusChange }: ShiftCardProps) {
  const status = statusConfig[shift.status] || statusConfig.scheduled;
  const [isUpdating, setIsUpdating] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const updateShiftStatus = async (id: string, newStatus: ShiftStatus) => {
    try {
      setIsUpdating(true);
      await api.updateShiftStatus(id, newStatus);
      
      toast({
        title: "Status atualizado",
        description: `O plantão foi marcado como ${statusConfig[newStatus].label.toLowerCase()}.`,
      });
      
      if (onStatusChange) {
        onStatusChange(id, newStatus);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do plantão.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const deleteShift = async () => {
    if (!shiftToDelete) return;
    
    try {
      setIsDeleting(true);
      
      await api.deleteShift(shiftToDelete);
      
      toast({
        title: 'Plantão excluído',
        description: 'O plantão foi excluído com sucesso.',
      });
      
      if (onStatusChange) {
        onStatusChange(shiftToDelete, 'deleted' as ShiftStatus);
      }
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
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-md",
      compact ? "h-full" : ""
    )}>
      <CardContent className={cn("p-4", compact ? "space-y-2" : "space-y-4")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className={cn("text-medical-blue", compact ? "h-4 w-4" : "h-5 w-5")} />
            <span className={cn("font-medium", compact ? "text-sm" : "text-base")}>
              {formatMediumDate(shift.date)}
              {shift.endDate && (
                <> até {formatMediumDate(shift.endDate)}</>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn("font-normal", status.color)}>
              {status.label}
            </Badge>
            
            {shift.status !== 'paid' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {shift.status === 'scheduled' && (
                    <DropdownMenuItem onClick={() => updateShiftStatus(shift.id, 'completed')}>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Marcar como realizado
                    </DropdownMenuItem>
                  )}
                  {(shift.status === 'scheduled' || shift.status === 'completed') && (
                    <DropdownMenuItem onClick={() => updateShiftStatus(shift.id, 'paid')}>
                      <DollarSign className="mr-2 h-4 w-4 text-purple-500" />
                      Marcar como pago
                    </DropdownMenuItem>
                  )}
                  {shift.status === 'scheduled' && (
                    <DropdownMenuItem onClick={() => updateShiftStatus(shift.id, 'canceled')}>
                      <XCircle className="mr-2 h-4 w-4 text-red-500" />
                      Cancelar plantão
                    </DropdownMenuItem>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir plantão
                      </DropdownMenuItem>
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
                          onClick={() => {
                            setShiftToDelete(shift.id);
                            deleteShift();
                          }}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Excluindo..." : "Excluir"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {!compact && (
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-500" />
            <span>
              {shift.startTime} - {shift.endTime}
            </span>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <MapPin className={cn("text-medical-orange", compact ? "h-4 w-4" : "h-5 w-5")} />
          <div className={compact ? "text-sm truncate" : ""}>
            <span className="font-medium">{shift.hospital.name}</span>
            {!compact && <p className="text-sm text-muted-foreground">{shift.hospital.address}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className={cn("text-medical-green", compact ? "h-4 w-4" : "h-5 w-5")} />
            <span className={compact ? "text-sm font-medium" : "text-base font-medium"}>{shift.value}</span>
          </div>
          {!compact && (
            <Badge variant="outline" className="text-xs font-normal">
              {shift.specialty}
            </Badge>
          )}
        </div>

        {!compact && (
          <div className="text-xs text-muted-foreground flex items-center justify-between pt-2 border-t">
            <span>Pagamento previsto:</span>
            <span className="font-medium">
              {formatShortDate(shift.paymentDate)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

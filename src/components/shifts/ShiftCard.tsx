
import { Calendar, Clock, MapPin, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export type ShiftStatus = 'scheduled' | 'completed' | 'paid' | 'canceled';

export interface ShiftProps {
  id: string;
  date: Date;
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
}

const statusConfig = {
  scheduled: { label: 'Agendado', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Realizado', color: 'bg-green-100 text-green-800' },
  paid: { label: 'Pago', color: 'bg-purple-100 text-purple-800' },
  canceled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

export function ShiftCard({ shift, compact = false }: ShiftCardProps) {
  const status = statusConfig[shift.status];

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
              {format(shift.date, "dd MMM yyyy", { locale: ptBR })}
            </span>
          </div>
          <Badge className={cn("font-normal", status.color)}>
            {status.label}
          </Badge>
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
            <span className={compact ? "text-sm font-medium" : "text-base font-medium"}>R$ {shift.value}</span>
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
              {format(shift.paymentDate, "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

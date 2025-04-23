
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
import { type ShiftProps, type ShiftStatus } from '@/components/shifts/ShiftCard';

interface ShiftTableProps {
  shifts: ShiftProps[];
}

const statusConfig = {
  scheduled: { label: 'Agendado', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Realizado', color: 'bg-green-100 text-green-800' },
  paid: { label: 'Pago', color: 'bg-purple-100 text-purple-800' },
  canceled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

export function ShiftTable({ shifts }: ShiftTableProps) {
  const [filter, setFilter] = useState<ShiftStatus | 'all'>('all');
  
  const filteredShifts = filter === 'all' 
    ? shifts 
    : shifts.filter(shift => shift.status === filter);

  return (
    <Card className="col-span-1 md:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Últimos plantões</CardTitle>
        <Select
          defaultValue="all"
          onValueChange={(value: ShiftStatus | 'all') => setFilter(value)}
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
        </Select>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShifts.length > 0 ? (
                filteredShifts.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell>
                      <div className="font-medium">
                        {format(shift.date, "dd MMM yyyy", { locale: ptBR })}
                      </div>
                      <div className="text-xs text-muted-foreground md:hidden">
                        {shift.startTime} - {shift.endTime}
                      </div>
                    </TableCell>
                    <TableCell>
                      {shift.hospital.name}
                    </TableCell>
                    <TableCell className="font-medium">
                      R$ {shift.value}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[shift.status].color}>
                        {statusConfig[shift.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {shift.specialty}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {format(shift.paymentDate, "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
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

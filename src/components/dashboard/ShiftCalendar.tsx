
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ShiftProps, ShiftCard } from '@/components/shifts/ShiftCard';

interface ShiftCalendarProps {
  shifts: ShiftProps[];
}

export function ShiftCalendar({ shifts }: ShiftCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Create a map of dates with shifts for highlighting in the calendar
  const shiftDates = shifts.reduce<Record<string, boolean>>((acc, shift) => {
    const dateStr = format(shift.date, 'yyyy-MM-dd');
    acc[dateStr] = true;
    return acc;
  }, {});

  // Get shifts for the selected date
  const shiftsForSelectedDate = selectedDate
    ? shifts.filter(shift => 
        format(shift.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
      )
    : [];

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Calendário de plantões</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className={cn("p-3 rounded-md border pointer-events-auto")}
            locale={ptBR}
            modifiers={{
              highlighted: (date) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                return shiftDates[dateStr] || false;
              }
            }}
            modifiersStyles={{
              highlighted: {
                fontWeight: 'bold',
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                color: '#0EA5E9',
                borderRadius: '4px',
              }
            }}
          />

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              {selectedDate
                ? `Plantões em ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}`
                : 'Nenhuma data selecionada'}
            </h3>
            
            {shiftsForSelectedDate.length > 0 ? (
              <div className="space-y-2">
                {shiftsForSelectedDate.map((shift) => (
                  <ShiftCard key={shift.id} shift={shift} compact />
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm p-4 border rounded-md text-center">
                Nenhum plantão agendado para esta data
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

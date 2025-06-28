import { Calendar, ChevronRight, Hospital, BadgeCheck } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isFuture, parseISO } from 'date-fns';
import { formatMonthDate } from '@/lib/date-utils';
import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function NextPaymentCard({ shifts }: any) {
  const [upcomingPayments, setUpcomingPayments] = useState<any[]>([]);
  const MAX_PAYMENTS_TO_SHOW = 5;

  useEffect(() => {
    const filteredPayments = shifts
      .filter(shift => {
        const paymentDate = parseISO(shift.payment_date);
        return (
          (shift.status === 'completed' || shift.status === 'scheduled') &&
          isFuture(paymentDate)
        );
      })
      .sort((a, b) => parseISO(a.payment_date).getTime() - parseISO(b.payment_date).getTime())
      .slice(0, MAX_PAYMENTS_TO_SHOW)
      .map(payment => ({
        ...payment,
        paymentDate: parseISO(payment.payment_date),
      }));

    setUpcomingPayments(filteredPayments);
  }, [shifts]);

  if (upcomingPayments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Próximos pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Nenhum pagamento previsto
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Próximos pagamentos</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[220px] px-4">
          {upcomingPayments.map((payment, index) => (
            <div 
              key={payment.id} 
              className={`py-3 ${index !== upcomingPayments.length - 1 ? 'border-b' : ''} flex flex-col gap-1`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center rounded-full bg-blue-50 text-medical-blue p-2">
                    <BadgeCheck className="h-4 w-4" />
                  </span>
                  <span className="text-lg font-bold text-medical-blue">R$ {payment.value}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 text-medical-blue" />
                  <span>{formatMonthDate(payment.paymentDate)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm mt-1">
                <Hospital className="h-4 w-4 text-medical-blue" />
                <span className="font-medium">{payment.hospital.name}</span>
                {/*<span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${payment.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{payment.status === 'scheduled' ? 'Agendado' : 'Realizado'}</span>*/}
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
      <CardFooter className="px-4 py-3">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <a href="/finance">
            Ver todos os pagamentos
            <ChevronRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

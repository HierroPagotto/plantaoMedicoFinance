
import { Calendar, ChevronRight } from 'lucide-react';
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
              className={`py-3 ${index !== upcomingPayments.length - 1 ? 'border-b' : ''}`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-lg font-bold">R$ {payment.value}</div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-medical-blue" />
                    <span>
                      {formatMonthDate(payment.paymentDate)}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">{payment.hospital.name}</div>
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

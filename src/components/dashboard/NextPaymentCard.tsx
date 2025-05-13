
import { Calendar, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useEffect } from 'react';

export function NextPaymentCard({ shifts }: any) {
  const [nextPayment, setNextPayment] = useState<any | null>(null);

  useEffect(() => {
    const upcomingPayments = shifts
      .filter(shift => {
        const paymentDate = new Date(shift.payment_date);
        return (
          (shift.status === 'completed' || shift.status === 'scheduled') &&
          isFuture(paymentDate)
        );
      })
      .sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime());

    if (upcomingPayments.length > 0) {
      const next = upcomingPayments[0];
      setNextPayment({
        ...next,
        paymentDate: new Date(next.payment_date),
      });
    }
  }, [shifts]);


  if (!nextPayment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Próximo pagamento</CardTitle>
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Próximo pagamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-2xl font-bold">R$ {nextPayment.value}</div>
          <div className="text-muted-foreground">{nextPayment.hospital.name}</div>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="h-4 w-4 text-medical-blue" />
          <span>
            {format(nextPayment.paymentDate, "dd 'de' MMMM", { locale: ptBR })}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <a href="/finance">
            Ver detalhes
            <ChevronRight className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

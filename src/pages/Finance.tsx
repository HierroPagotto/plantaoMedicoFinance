import { AppShell } from '@/components/layout/AppShell';
import { FinancialChart } from '@/components/dashboard/FinancialChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Shift } from '@/types/shift';

const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

interface MonthlyData {
  month: number;
  received: number;
  expected: number;
  expenses_total: number;
  net: number;
  shifts: number;
  avg_per_shift: number;
}

interface FinancialData {
  monthly_data: MonthlyData[];
  annual_totals: {
    total_received: number;
    total_expected: number;
    total_expenses: number;
    total_net: number;
    total_shifts: number;
    avg_per_shift: number;
  };
  year: number;
}

type ChartShift = {
  paymentDate: Date;
  date: Date;
  value: number;
  status: string;
  expensesTotal: number;
};

const Finance = () => {
  const [shifts, setShifts] = useState<ChartShift[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const response = (await api.getShifts()) as Shift[];
        const formattedShifts: ChartShift[] = response.map((shift) => ({
          paymentDate: new Date(shift.payment_date || ''),
          date: new Date(shift.date),
          value: Number(shift.value) || 0,
          status: shift.status,
          expensesTotal: Number(shift.expenses_total || 0),
        }));
        setShifts(formattedShifts);
      } catch {
        // ignore
      }
    };
    fetchShifts();
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.getFinancialFull(year);
        setFinancialData(response.data);
      } catch (error) {
        console.error('Erro ao buscar dados financeiros:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading || !financialData) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <p>Carregando dados financeiros...</p>
        </div>
      </AppShell>
    );
  }

  const {
    total_expected,
    total_expenses = 0,
    total_net = total_expected - total_expenses,
    total_shifts,
  } = financialData.annual_totals;

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de ganhos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(total_expected)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ano de {financialData.year}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(total_expenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Por data do plantão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(total_net)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ganhos − gastos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de plantões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total_shifts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ano de {financialData.year}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <FinancialChart shifts={shifts} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tabela mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Mês
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Plantões
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Ganhos
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Gastos
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Líquido
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Média por plantão
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {financialData.monthly_data.map((monthData) => {
                  const expenses = Number(monthData.expenses_total || 0);
                  const expected = Number(monthData.expected || 0);
                  const net = monthData.net != null ? Number(monthData.net) : expected - expenses;
                  return (
                    <tr key={monthData.month}>
                      <td className="px-4 py-3 text-sm">{months[monthData.month - 1]}</td>
                      <td className="px-4 py-3 text-sm">{monthData.shifts}</td>
                      <td className="px-4 py-3 text-sm font-medium">{formatCurrency(expected)}</td>
                      <td className="px-4 py-3 text-sm">{formatCurrency(expenses)}</td>
                      <td className="px-4 py-3 text-sm font-medium">{formatCurrency(net)}</td>
                      <td className="px-4 py-3 text-sm">
                        {monthData.shifts > 0
                          ? formatCurrency(expected / monthData.shifts)
                          : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50 font-medium">
                  <td className="px-4 py-3 text-sm">Total</td>
                  <td className="px-4 py-3 text-sm">{total_shifts}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatCurrency(total_expected)}</td>
                  <td className="px-4 py-3 text-sm">{formatCurrency(total_expenses)}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatCurrency(total_net)}</td>
                  <td className="px-4 py-3 text-sm">
                    {total_shifts > 0
                      ? formatCurrency(total_expected / total_shifts)
                      : '-'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
};

export default Finance;

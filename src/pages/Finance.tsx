import { AppShell } from '@/components/layout/AppShell';
import { FinancialChart } from '@/components/dashboard/FinancialChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

interface MonthlyData {
  month: number;
  received: number;
  expected: number;
  shifts: number;
  avg_per_shift: number;
}

interface FinancialData {
  monthly_data: MonthlyData[];
  annual_totals: {
    total_received: number;
    total_expected: number;
    total_shifts: number;
    avg_per_shift: number;
  };
  year: number;
}

const Finance = () => {
  const [shifts, setShifts] = useState<any[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [chartType, setChartType] = useState('revenue');
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const response = await api.getShifts();
        const formattedShifts = response.map((shift: any) => ({
          paymentDate: new Date(shift.payment_date || shift.paymentDate),
          date: new Date(shift.date),
          value: shift.value || shift.ganhos || 0,
          status: shift.status,
        }));
        setShifts(formattedShifts);
      } catch (err) {
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

  const exportToCSV = () => {
    if (!financialData) return;

    const headers = ['Mês', 'Plantões', 'Recebido', 'Previsto', 'Média por plantão'];


    const rows = financialData.monthly_data.map((monthData) => [
      months[monthData.month - 1],
      monthData.shifts,
      monthData.received.toFixed(2),
      monthData.expected.toFixed(2),
      monthData.avg_per_shift.toFixed(2)
    ]);

    rows.push([
      'TOTAL',
      financialData.annual_totals.total_shifts,
      financialData.annual_totals.total_received.toFixed(2),
      financialData.annual_totals.total_expected.toFixed(2),
      financialData.annual_totals.avg_per_shift.toFixed(2)
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `financeiro_${financialData.year}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const chartData = financialData.monthly_data.map(item => ({
    month: months[item.month - 1],
    recebido: item.received,
    previsto: item.expected,
    plantoes: item.shifts
  }));

  const {
    total_received,
    total_expected,
    total_shifts,
    avg_per_shift
  } = financialData.annual_totals;

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Financeiro</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
            <CardTitle className="text-sm font-medium">Total de plantões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total_shifts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ano de {financialData.year}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Média por plantão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {financialData.annual_totals.total_shifts > 0
                ? formatCurrency(financialData.annual_totals.total_expected / financialData.annual_totals.total_shifts)
                : '-'}
            </div>
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
          <CardTitle>Tabela de pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Mês de pagamento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Plantões realizados
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Pagamento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Média por plantão
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {Array.from({ length: 12 }).map((_, monthIdx) => {
                  // Calcular ganhos por mês usando shifts (igual ao FinancialChart)
                  const ganhos = shifts
                    .filter(shift => shift.paymentDate.getMonth() === monthIdx && shift.paymentDate.getFullYear() === year)
                    .reduce((sum, shift) => sum + (typeof shift.value === 'string' ? Number(shift.value.replace(/[^\d,.-]/g, '').replace(',', '.')) : Number(shift.value)), 0);
                  const plantoes = shifts.filter(shift => shift.paymentDate.getMonth() === monthIdx && shift.paymentDate.getFullYear() === year).length;
                  return (
                    <tr key={monthIdx}>
                      <td className="px-4 py-3 text-sm">{months[monthIdx]}</td>
                      <td className="px-4 py-3 text-sm">{plantoes}</td>
                      <td className="px-4 py-3 text-sm font-medium">{formatCurrency(ganhos)}</td>
                      <td className="px-4 py-3 text-sm">{plantoes > 0 ? formatCurrency(ganhos / plantoes) : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50 font-medium">
                  <td className="px-4 py-3 text-sm">Total</td>
                  <td className="px-4 py-3 text-sm">{(() => {
                    const totalPlantoes = shifts.filter(shift => shift.paymentDate.getFullYear() === year).length;
                    return totalPlantoes;
                  })()}</td>
                  <td className="px-4 py-3 text-sm font-medium">{(() => {
                    const totalGanhos = shifts.filter(shift => shift.paymentDate.getFullYear() === year).reduce((sum, shift) => sum + (typeof shift.value === 'string' ? Number(shift.value.replace(/[^\d,.-]/g, '').replace(',', '.')) : Number(shift.value)), 0);
                    return formatCurrency(totalGanhos);
                  })()}</td>
                  <td className="px-4 py-3 text-sm">{(() => {
                    const totalPlantoes = shifts.filter(shift => shift.paymentDate.getFullYear() === year).length;
                    const totalGanhos = shifts.filter(shift => shift.paymentDate.getFullYear() === year).reduce((sum, shift) => sum + (typeof shift.value === 'string' ? Number(shift.value.replace(/[^\d,.-]/g, '').replace(',', '.')) : Number(shift.value)), 0);
                    return totalPlantoes > 0 ? formatCurrency(totalGanhos / totalPlantoes) : '-';
                  })()}</td>
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
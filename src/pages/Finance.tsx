import { AppShell } from '@/components/layout/AppShell';
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
  const [year, setYear] = useState(new Date().getFullYear());
  const [chartType, setChartType] = useState('revenue');
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    // Cabeçalhos do CSV
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <FileText className="mr-2 h-4 w-4" /> Exportar relatório
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total recebido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(total_received)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ano de {financialData.year}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total previsto</CardTitle>
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
              {formatCurrency(avg_per_shift)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ano de {financialData.year}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Análise financeira anual</CardTitle>
          <div className="flex items-center space-x-2">
            <Select
              value={year.toString()}
              onValueChange={(value) => setYear(parseInt(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={`${year - 1}`}>{year - 1}</SelectItem>
                <SelectItem value={`${year}`}>{year}</SelectItem>
                <SelectItem value={`${year + 1}`}>{year + 1}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Tipo de gráfico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Receita</SelectItem>
                <SelectItem value="shifts">Plantões</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {chartType === 'revenue' ? (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), ""]}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="recebido"
                  name="Recebido"
                  stroke="#0EA5E9"
                  fill="#0ea5e920"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
                <Area
                  type="monotone"
                  dataKey="previsto"
                  name="Previsto"
                  stroke="#6EE7B7"
                  fill="#6ee7b720"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  activeDot={{ r: 8 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`${value} plantões`, "Quantidade"]}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Legend />
                <Bar
                  dataKey="plantoes"
                  name="Quantidade de plantões"
                  fill="#8B5CF6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
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
                    Recebido
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Previsto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Média por plantão
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {financialData.monthly_data.map((monthData) => (
                  <tr key={monthData.month}>
                    <td className="px-4 py-3 text-sm">{months[monthData.month - 1]}</td>
                    <td className="px-4 py-3 text-sm">{monthData.shifts}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {formatCurrency(monthData.received)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatCurrency(monthData.expected)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatCurrency(monthData.avg_per_shift)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50 font-medium">
                  <td className="px-4 py-3 text-sm">Total</td>
                  <td className="px-4 py-3 text-sm">{total_shifts}</td>
                  <td className="px-4 py-3 text-sm">{formatCurrency(total_received)}</td>
                  <td className="px-4 py-3 text-sm">{formatCurrency(total_expected)}</td>
                  <td className="px-4 py-3 text-sm">{formatCurrency(avg_per_shift)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" /> Exportar como Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
};

export default Finance;

import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, DollarSign, Calendar } from 'lucide-react';
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
import { useState } from 'react';

const yearData = [
  { month: 'Jan', recebido: 5200, previsto: 6000, plantoes: 5 },
  { month: 'Fev', recebido: 6500, previsto: 6500, plantoes: 6 },
  { month: 'Mar', recebido: 5800, previsto: 6200, plantoes: 6 },
  { month: 'Abr', recebido: 8500, previsto: 8500, plantoes: 8 },
  { month: 'Mai', recebido: 9200, previsto: 9500, plantoes: 9 },
  { month: 'Jun', recebido: 8700, previsto: 9000, plantoes: 8 },
  { month: 'Jul', recebido: 7500, previsto: 7500, plantoes: 7 },
  { month: 'Ago', recebido: 10300, previsto: 10300, plantoes: 10 },
  { month: 'Set', recebido: 9800, previsto: 11200, plantoes: 11 },
  { month: 'Out', recebido: 0, previsto: 12500, plantoes: 12 },
  { month: 'Nov', recebido: 0, previsto: 10800, plantoes: 10 },
  { month: 'Dez', recebido: 0, previsto: 9500, plantoes: 9 },
];

const Finance = () => {
  const [year, setYear] = useState('2023');
  const [chartType, setChartType] = useState('revenue');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Calculate summary data
  const totalReceived = yearData.reduce((sum, item) => sum + item.recebido, 0);
  const totalExpected = yearData.reduce((sum, item) => sum + item.previsto, 0);
  const totalShifts = yearData.reduce((sum, item) => sum + item.plantoes, 0);
  const averagePerShift = totalReceived / totalShifts;

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <div className="flex gap-2">
          <Button variant="outline">
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
            <div className="text-2xl font-bold">{formatCurrency(totalReceived)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ano de {year}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total previsto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpected)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ano de {year}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de plantões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShifts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ano de {year}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Média por plantão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averagePerShift)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ano de {year}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Análise financeira anual</CardTitle>
          <div className="flex items-center space-x-2">
            <Select defaultValue="2023" onValueChange={setYear}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
              </SelectContent>
            </Select>
            
            <Select defaultValue="revenue" onValueChange={setChartType}>
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
                data={yearData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), ""]} />
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
                data={yearData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
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

      {/* Monthly breakdown */}
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
                {yearData.map((month) => (
                  <tr key={month.month}>
                    <td className="px-4 py-3 text-sm">{month.month}</td>
                    <td className="px-4 py-3 text-sm">{month.plantoes}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {formatCurrency(month.recebido)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatCurrency(month.previsto)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatCurrency(month.plantoes > 0 ? month.recebido / month.plantoes : 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/50 font-medium">
                  <td className="px-4 py-3 text-sm">Total</td>
                  <td className="px-4 py-3 text-sm">{totalShifts}</td>
                  <td className="px-4 py-3 text-sm">{formatCurrency(totalReceived)}</td>
                  <td className="px-4 py-3 text-sm">{formatCurrency(totalExpected)}</td>
                  <td className="px-4 py-3 text-sm">{formatCurrency(averagePerShift)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Exportar como Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
};

export default Finance;

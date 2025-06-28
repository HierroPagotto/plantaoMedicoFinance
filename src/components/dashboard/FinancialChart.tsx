import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

export function FinancialChart() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [chartType, setChartType] = useState('revenue');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getFinancialFull(new Date().getFullYear());
        const apiData = response.data.monthly_data;
        
        const formattedData = apiData.map(item => ({
          month: months[item.month - 1],
          recebido: item.received,
          previsto: item.expected,
          plantoes: item.shifts
        }));
        
        setData(formattedData);
      } catch (error) {
        console.error('Erro ao buscar dados financeiros:', error);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Visão financeira</CardTitle>
        <div className="flex items-center space-x-2">
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
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={data}
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
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
  );
}
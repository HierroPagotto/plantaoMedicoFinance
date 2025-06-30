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
  expected: number;
  shifts: number;
  avg_per_shift: number;
}

interface FinancialChartProps {
  shifts?: Array<{
    paymentDate: Date;
    value: string | number;
    status: string;
  }>;
}

export function FinancialChart({ shifts }: FinancialChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [chartType, setChartType] = useState('revenue');

  useEffect(() => {
    if (!shifts) return;
    const monthlyMap: Record<string, { ganhos: number; plantoes: number }> = {};
    let minYear = new Date().getFullYear();
    let maxYear = new Date().getFullYear();

    shifts.forEach(shift => {
      let paymentDate = shift.paymentDate && !isNaN(new Date(shift.paymentDate).getTime()) ? new Date(shift.paymentDate) : null;
      let shiftDate = shift.date && !isNaN(new Date(shift.date).getTime()) ? new Date(shift.date) : null;
      if (paymentDate) {
        const month = paymentDate.getMonth();
        const year = paymentDate.getFullYear();
        const key = `${year}-${month}`;
        let valor = typeof shift.value === 'string' ? Number(shift.value.replace(/[^\d,.-]/g, '').replace(',', '.')) : shift.value;
        if (isNaN(valor)) valor = 0;
        if (!monthlyMap[key]) {
          monthlyMap[key] = { ganhos: 0, plantoes: 0 };
        }
        monthlyMap[key].ganhos += valor;
      }
      if (shiftDate) {
        const month = shiftDate.getMonth();
        const year = shiftDate.getFullYear();
        const key = `${year}-${month}`;
        if (!monthlyMap[key]) {
          monthlyMap[key] = { ganhos: 0, plantoes: 0 };
        }
        monthlyMap[key].plantoes += 1;
      }
    });

    const currentYear = new Date().getFullYear();
    const fullData: Array<{ month: string; ganhos: number; plantoes: number }> = [];
    for (let month = 0; month < 12; month++) {
      const key = `${currentYear}-${month}`;
      fullData.push({
        month: months[month],
        ganhos: monthlyMap[key]?.ganhos || 0,
        plantoes: monthlyMap[key]?.plantoes || 0,
      });
    }
    setData(fullData);
  }, [shifts]);

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
              margin={{ top: 10, right: 30, left: 24, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} width={80} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), ""]}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="ganhos"
                name="Ganhos"
                stroke="#6EE7B7"
                fill="#6ee7b720"
                strokeWidth={2}
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

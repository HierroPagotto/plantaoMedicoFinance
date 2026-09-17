import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

type ChartType = 'compare' | 'revenue' | 'expenses' | 'shifts';

interface FinancialChartProps {
  shifts?: Array<{
    paymentDate: Date;
    date?: Date;
    value: string | number;
    status: string;
    expensesTotal?: number;
  }>;
  extraMonthlyExpenses?: number[];
}

function parseValue(value: string | number): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const parsed = Number(value.replace(/[^\d,.-]/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function FinancialChart({ shifts, extraMonthlyExpenses }: FinancialChartProps) {
  const [data, setData] = useState<
    Array<{ month: string; ganhos: number; gastos: number; plantoes: number }>
  >([]);
  const [chartType, setChartType] = useState<ChartType>('compare');

  useEffect(() => {
    if (!shifts) return;
    const monthlyMap: Record<
      string,
      { ganhos: number; gastos: number; plantoes: number }
    > = {};

    shifts.forEach((shift) => {
      const paymentDate =
        shift.paymentDate && !isNaN(new Date(shift.paymentDate).getTime())
          ? new Date(shift.paymentDate)
          : null;
      const shiftDate =
        shift.date && !isNaN(new Date(shift.date).getTime())
          ? new Date(shift.date)
          : null;

      if (paymentDate) {
        const key = `${paymentDate.getFullYear()}-${paymentDate.getMonth()}`;
        if (!monthlyMap[key]) {
          monthlyMap[key] = { ganhos: 0, gastos: 0, plantoes: 0 };
        }
        monthlyMap[key].ganhos += parseValue(shift.value);
      }

      if (shiftDate) {
        const key = `${shiftDate.getFullYear()}-${shiftDate.getMonth()}`;
        if (!monthlyMap[key]) {
          monthlyMap[key] = { ganhos: 0, gastos: 0, plantoes: 0 };
        }
        monthlyMap[key].plantoes += 1;
        monthlyMap[key].gastos += Number(shift.expensesTotal || 0);
      }
    });

    const currentYear = new Date().getFullYear();
    const fullData = [];
    for (let month = 0; month < 12; month++) {
      const key = `${currentYear}-${month}`;
      const personal = extraMonthlyExpenses?.[month] ?? 0;
      fullData.push({
        month: months[month],
        ganhos: monthlyMap[key]?.ganhos || 0,
        gastos: (monthlyMap[key]?.gastos || 0) + personal,
        plantoes: monthlyMap[key]?.plantoes || 0,
      });
    }
    setData(fullData);
  }, [shifts, extraMonthlyExpenses]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const tabClass = (active: boolean) =>
    `px-3 py-1 rounded-md text-sm font-medium focus:outline-none transition-colors ${active
      ? 'bg-white shadow text-black'
      : 'text-muted-foreground hover:text-black'
    }`;

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2 flex-wrap">
        <CardTitle>Visão financeira</CardTitle>
        <div className="flex bg-muted rounded-md p-1 flex-wrap">
          <button
            className={tabClass(chartType === 'compare')}
            onClick={() => setChartType('compare')}
            type="button"
          >
            Comparativo
          </button>
          <button
            className={tabClass(chartType === 'revenue')}
            onClick={() => setChartType('revenue')}
            type="button"
          >
            Ganhos
          </button>
          <button
            className={tabClass(chartType === 'expenses')}
            onClick={() => setChartType('expenses')}
            type="button"
          >
            Gastos
          </button>
          <button
            className={tabClass(chartType === 'shifts')}
            onClick={() => setChartType('shifts')}
            type="button"
          >
            Plantões
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {(chartType === 'compare' || chartType === 'revenue' || chartType === 'expenses') && (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 24, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} width={80} />
              <Tooltip
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Legend />
              {(chartType === 'compare' || chartType === 'revenue') && (
                <Area
                  type="monotone"
                  dataKey="ganhos"
                  name="Ganhos"
                  stroke="#6EE7B7"
                  fill="#6ee7b720"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              )}
              {(chartType === 'compare' || chartType === 'expenses') && (
                <Area
                  type="monotone"
                  dataKey="gastos"
                  name="Gastos"
                  stroke="#F59E0B"
                  fill="#f59e0b20"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}

        {chartType === 'shifts' && (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`${value} plantões`, 'Quantidade']}
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

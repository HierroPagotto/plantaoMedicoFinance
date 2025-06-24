
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from 'recharts';
import { api } from '@/lib/api';

const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

interface FinancialChartData {
  month: number;
  earnings: number;
  shifts_count: number;
}

export function FinancialChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getFinancial();
        const apiData: FinancialChartData[] = response;
        
        const formattedData = apiData.map(item => ({
          month: months[item.month - 1],
          ganhos: item.earnings,
          plantoes: item.shifts_count
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
      {/*<CardHeader className="pb-2">
        <CardTitle>Visão financeira</CardTitle>
      </CardHeader>*/}
      <CardContent className="pt-0">
        <Tabs defaultValue="ganhos">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="ganhos">Fluxo de Pagamentos</TabsTrigger>
              <TabsTrigger value="plantoes">Plantões Mês a Mês</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="ganhos">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={data}
                margin={{
                  top: 10,
                  right: 0,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis
                  tickFormatter={formatCurrency}
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Fluxo de Pagamentos"]}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="ganhos"
                  stroke="#0EA5E9"
                  fill="#0ea5e920"
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="plantoes">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data}
                margin={{
                  top: 10,
                  right: 0,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <Tooltip
                  formatter={(value: number) => [`${value} plantões`, "Quantidade"]}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Bar
                  dataKey="plantoes"
                  fill="#6EE7B7"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
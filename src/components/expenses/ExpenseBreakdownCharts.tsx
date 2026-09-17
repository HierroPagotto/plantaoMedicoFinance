import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ExpenseSummaryBreakdown } from '@/types/expense';

const COLORS = [
  '#0D9488',
  '#F59E0B',
  '#6366F1',
  '#EF4444',
  '#10B981',
  '#8B5CF6',
  '#EC4899',
  '#64748B',
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(value);
}

interface ExpenseBreakdownChartsProps {
  summary: ExpenseSummaryBreakdown | null;
  loading?: boolean;
  titlePrefix?: string;
}

export function ExpenseBreakdownCharts({
  summary,
  loading,
  titlePrefix = 'Gastos pessoais',
}: ExpenseBreakdownChartsProps) {
  const categoryData = (summary?.by_category || []).map((item) => ({
    name: item.label,
    value: item.total,
  }));
  const paymentData = (summary?.by_payment_method || []).map((item) => ({
    name: item.name,
    value: item.total,
  }));

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Carregando gráficos...
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Carregando gráficos...
          </CardContent>
        </Card>
      </div>
    );
  }

  const empty = !summary || summary.total <= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{titlePrefix} por categoria</CardTitle>
        </CardHeader>
        <CardContent>
          {empty || categoryData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Sem gastos pessoais neste período.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{titlePrefix} por cobrança</CardTitle>
        </CardHeader>
        <CardContent>
          {empty || paymentData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Sem formas de cobrança neste período.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={paymentData}
                margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis tickFormatter={formatCurrency} width={72} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="value" name="Total" fill="#0D9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

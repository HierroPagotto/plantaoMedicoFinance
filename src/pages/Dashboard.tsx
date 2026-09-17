import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/dashboard/StatCard';
import { FinancialChart } from '@/components/dashboard/FinancialChart';
import { NextPaymentCard } from '@/components/dashboard/NextPaymentCard';
import { ShiftCalendar } from '@/components/dashboard/ShiftCalendar';
import { Calendar, Clock, DollarSign, User, Settings as SettingsIcon, Wallet } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import type { Shift } from '@/types/shift';
import type { ShiftProps } from '@/components/shifts/ShiftCard';
import { isMarketplaceShift } from '@/components/shifts/shift-utils';
import { ShiftExpensesSection } from '@/components/shifts/ShiftExpensesSection';
import { ShiftForm } from '@/components/shifts/ShiftForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatShortDate } from '@/lib/date-utils';

function mapApiShiftToProps(shift: Shift): ShiftProps {
  return {
    id: String(shift.id),
    date: new Date(shift.date),
    startTime: shift.start_time.substring(0, 5),
    endTime: shift.end_time.substring(0, 5),
    hospital: {
      name: shift.hospital?.name || '',
      address: shift.hospital?.address || '',
    },
    value: Number(shift.value).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }),
    valueNumber: Number(shift.value),
    expensesTotal: Number(shift.expenses_total || 0),
    netValue:
      shift.net_value != null
        ? Number(shift.net_value)
        : Number(shift.value) - Number(shift.expenses_total || 0),
    specialty: shift.specialty,
    paymentDate: shift.payment_date ? new Date(shift.payment_date) : null,
    status: shift.status,
    source: shift.source,
    opportunityId: shift.opportunity_id ?? null,
  };
}

const Dashboard = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [stats, setStats] = useState({
    monthly_earnings: 0,
    previous_month_earnings: 0,
    expenses_total: 0,
    previous_expenses_total: 0,
    net: 0,
    previous_net: 0,
    scheduled_shifts: 0,
    previous_scheduled_shifts: 0,
    hours_worked: 0,
    previous_hours_worked: 0,
    avg_hourly_rate: 0,
    previous_avg_hourly_rate: 0,
  });
  const [goal, setGoal] = useState<{ value: number; custom: boolean } | null>(null);
  const [selectedShift, setSelectedShift] = useState<ShiftProps | null>(null);
  const [editShift, setEditShift] = useState<ShiftProps | null>(null);
  const [personalMonthlyExpenses, setPersonalMonthlyExpenses] = useState<number[]>(
    () => Array(12).fill(0)
  );
  const navigate = useNavigate();

  const calendarShifts = useMemo(
    () => shifts.map(mapApiShiftToProps),
    [shifts]
  );

  const refreshShifts = async () => {
    try {
      const data = await api.getShifts();
      setShifts(data);
    } catch (error) {
      console.error('Erro ao buscar plantões:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para calcular variação percentual
  const getTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: current === 0 ? 0 : 100, positive: current > 0 };
    const percent = Math.round(((current - previous) / Math.abs(previous)) * 100);
    return { value: percent, positive: percent > 0 };
  };

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const data = await api.getShifts();
        setShifts(data);
      } catch (error) {
        console.error('Erro ao buscar plantões:', error);
      }
    };

    fetchShifts();
  }, []);

  useEffect(() => {
    const fetchPersonalExpenses = async () => {
      const chartYear = new Date().getFullYear();
      try {
        const data = await api.listExpenses({ year: chartYear, source: 'personal' });
        const monthly = Array(12).fill(0) as number[];
        for (const expense of data.expenses || []) {
          const d = new Date(`${expense.expense_date}T12:00:00`);
          if (!Number.isNaN(d.getTime()) && d.getFullYear() === chartYear) {
            monthly[d.getMonth()] += Number(expense.amount) || 0;
          }
        }
        setPersonalMonthlyExpenses(monthly);
      } catch {
        setPersonalMonthlyExpenses(Array(12).fill(0));
      }
    };
    fetchPersonalExpenses();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboard();
        setStats(data);
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchGoal = async () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      try {
        const data = await api.getGoal(year, month);
        setGoal({ value: data.value, custom: data.custom });
      } catch (e) {
        setGoal(null);
      }
    };
    fetchGoal();
  }, []);


  const nextShift = shifts
    .filter(shift => shift.status === 'scheduled' && new Date(shift.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] || null;

  const progress = goal && goal.value > 0 ? Math.min(100, Math.round((stats.monthly_earnings / goal.value) * 100)) : 0;
  const missing = goal && goal.value > 0 ? Math.max(0, goal.value - stats.monthly_earnings) : 0;
  const monthName = new Date().toLocaleString('default', { month: 'long' });

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/doctor-profile" className="flex items-center gap-2">
              <User size={16} />
              Ver Perfil
            </Link>
          </Button>
          <Button asChild>
            <Link to="/shifts/new">Novo plantão</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard
          title="Ganhos mensais"
          value={formatCurrency(stats.monthly_earnings)}
          description="Valor previsto neste mês"
          icon={<DollarSign />}
          trend={getTrend(stats.monthly_earnings, stats.previous_month_earnings)}
        />
        <StatCard
          title="Gastos do mês"
          value={formatCurrency(stats.expenses_total || 0)}
          description="Na data dos plantões"
          icon={<Wallet />}
          trend={getTrend(stats.expenses_total || 0, stats.previous_expenses_total || 0)}
        />
        <StatCard
          title="Líquido"
          value={formatCurrency(
            stats.net != null
              ? stats.net
              : (stats.monthly_earnings || 0) - (stats.expenses_total || 0)
          )}
          description="Ganhos − gastos"
          icon={<DollarSign />}
          trend={getTrend(
            stats.net != null
              ? stats.net
              : (stats.monthly_earnings || 0) - (stats.expenses_total || 0),
            stats.previous_net != null
              ? stats.previous_net
              : (stats.previous_month_earnings || 0) - (stats.previous_expenses_total || 0)
          )}
        />
        <StatCard
          title="Plantões"
          value={stats.scheduled_shifts.toString()}
          description="No mês Atual"
          icon={<Calendar />}
          trend={getTrend(stats.scheduled_shifts, stats.previous_scheduled_shifts)}
        />
        <StatCard
          title="Horas trabalhadas"
          value={`${stats.hours_worked}h`}
          description="Neste mês"
          icon={<Clock />}
          trend={getTrend(stats.hours_worked, stats.previous_hours_worked)}
        />
        <StatCard
          title="Valor/hora médio"
          value={(() => {
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const doneShifts = shifts.filter(shift => {
              const status = (shift.status || '').toLowerCase();
              const dateObj = new Date(shift.date);
              return (status === 'completed' || status === 'paid') &&
                dateObj.getMonth() === currentMonth &&
                dateObj.getFullYear() === currentYear;
            });
            let totalValue = 0;
            let totalHours = 0;
            for (const shift of doneShifts) {
              const valor = Number(shift.value);
              if (!isNaN(valor)) totalValue += valor;
              let hours = 0;
              if (typeof shift.start_time === 'string' && typeof shift.end_time === 'string') {
                const [sh, sm] = shift.start_time.split(':').map(Number);
                const [eh, em] = shift.end_time.split(':').map(Number);
                if (!isNaN(sh) && !isNaN(sm) && !isNaN(eh) && !isNaN(em)) {
                  let diff = (eh + em / 60) - (sh + sm / 60);
                  if (diff < 0) diff += 24;
                  hours = diff;
                }
              }
              if (hours > 0) totalHours += hours;
            }
            if (totalValue > 0 && totalHours > 0) return formatCurrency(totalValue / totalHours);
            if (stats.hours_worked && stats.monthly_earnings) {
              const h = Number(stats.hours_worked);
              const v = Number(stats.monthly_earnings);
              if (h > 0 && v > 0) return formatCurrency(v / h);
            }
            if (stats.avg_hourly_rate) return formatCurrency(stats.avg_hourly_rate);
            return '-';
          })()}
          description="Neste mês"
          icon={<DollarSign />}
          trend={getTrend(stats.avg_hourly_rate, stats.previous_avg_hourly_rate)}
        />
      </div>

      {/* Barra de Meta */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Meta do Mês</h2>
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} title="Configurar metas">
            <SettingsIcon className="h-5 w-5" />
          </Button>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-medical-teal/80 to-medical-blue/80 p-6 shadow-lg text-white relative">
          {(!goal || goal.value <= 0) ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight">Defina uma meta</h3>
              <span className="text-white/80 text-sm">Configure sua meta financeira para acompanhar seu progresso!</span>
              <Button onClick={() => navigate('/settings')} className="bg-white text-medical-teal hover:bg-medical-teal hover:text-white font-semibold mt-2">Configurar meta</Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-base font-medium flex items-center gap-1">
                    <span className="inline-block align-middle">🎯</span> Meta de {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                    {goal?.custom && <span className="ml-2 px-2 py-0.5 rounded bg-white/20 text-xs font-semibold">Personalizada</span>}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight">VAMOS COMEÇAR!</h3>
                <span className="text-white/80 text-sm">Força total este mês!</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>R$ {stats.monthly_earnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span>R$ {goal?.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}</span>
              </div>
              <Progress value={progress} />
              <div className="flex flex-col items-center mt-2">
                <span className="text-lg font-bold">{progress.toFixed(1)}%</span>
                <span className="text-white/80 text-sm mt-1">
                  {missing > 0
                    ? <>Faltam apenas <span className="text-yellow-200 font-semibold">R$ {missing.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> para conquistar sua meta! 💪</>
                    : <>Meta atingida ou não definida!</>}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3">
          <FinancialChart
            shifts={shifts
            .map((shift) => ({
              paymentDate: new Date(shift.payment_date || ''),
              date: new Date(shift.date),
              value: shift.value,
              status: shift.status,
              expensesTotal: Number(shift.expenses_total || 0),
            }))
            .filter((shift) =>
              shift.date && !isNaN(shift.date.getTime()) &&
              shift.date.getFullYear() === new Date().getFullYear()
            )}
            extraMonthlyExpenses={personalMonthlyExpenses}
          />
        </div>
        <div className="md:col-span-2">
          <NextPaymentCard shifts={shifts} />
        </div>
      </div>

      <div className="w-full mt-6">
        <ShiftCalendar
          shifts={calendarShifts}
          onShowDetails={setSelectedShift}
          onEdit={setEditShift}
        />
      </div>

      <Dialog open={!!selectedShift} onOpenChange={() => setSelectedShift(null)}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do plantão</DialogTitle>
            <DialogDescription>
              Informações completas sobre o plantão
            </DialogDescription>
          </DialogHeader>
          {selectedShift && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Data</h4>
                  <p>{formatShortDate(selectedShift.date)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Horário</h4>
                  <p>
                    {selectedShift.startTime} - {selectedShift.endTime}
                  </p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Hospital</h4>
                  <p>{selectedShift.hospital.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedShift.hospital.address}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Especialidade</h4>
                  <p>{selectedShift.specialty}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Valor</h4>
                  <p className="font-medium">{selectedShift.value}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Data para pagamento
                  </h4>
                  <p>
                    {selectedShift.paymentDate &&
                    !Number.isNaN(selectedShift.paymentDate.getTime())
                      ? formatShortDate(selectedShift.paymentDate)
                      : 'A definir'}
                  </p>
                </div>
                {isMarketplaceShift(selectedShift) && (
                  <div className="col-span-2">
                    <Badge variant="secondary">
                      Marketplace — plantão travado; gastos liberados
                    </Badge>
                  </div>
                )}
              </div>
              <ShiftExpensesSection
                shiftId={selectedShift.id}
                shiftValue={selectedShift.valueNumber}
                onChanged={({ expensesTotal, netValue }) => {
                  setSelectedShift((prev) =>
                    prev ? { ...prev, expensesTotal, netValue } : prev
                  );
                  setShifts((prev) =>
                    prev.map((s) =>
                      String(s.id) === selectedShift.id
                        ? {
                            ...s,
                            expenses_total: expensesTotal,
                            net_value: netValue,
                          }
                        : s
                    )
                  );
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editShift} onOpenChange={() => setEditShift(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar plantão</DialogTitle>
            <DialogDescription>
              Altere os campos desejados e gerencie os gastos do plantão.
            </DialogDescription>
          </DialogHeader>
          {editShift && (
            <ShiftForm
              mode="edit"
              initialData={editShift}
              onSuccess={() => {
                setEditShift(null);
                refreshShifts();
              }}
              onCancel={() => setEditShift(null)}
              onExpensesChanged={({ expensesTotal, netValue }) => {
                setEditShift((prev) =>
                  prev ? { ...prev, expensesTotal, netValue } : prev
                );
                setShifts((prev) =>
                  prev.map((s) =>
                    String(s.id) === editShift.id
                      ? {
                          ...s,
                          expenses_total: expensesTotal,
                          net_value: netValue,
                        }
                      : s
                  )
                );
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default Dashboard;

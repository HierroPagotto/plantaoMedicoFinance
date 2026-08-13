import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/dashboard/StatCard';
import { FinancialChart } from '@/components/dashboard/FinancialChart';
import { NextPaymentCard } from '@/components/dashboard/NextPaymentCard';
import { MapPreview } from '@/components/dashboard/MapPreview';
import { ShiftCalendar } from '@/components/dashboard/ShiftCalendar';
import { ShiftTable } from '@/components/dashboard/ShiftTable';
import { Calendar, Clock, DollarSign, MapPin, User, Settings as SettingsIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const Dashboard = () => {
  const [shifts, setShifts] = useState<any[]>([]);
  const [hasProfile, setHasProfile] = useState(false);
  const [stats, setStats] = useState({
    monthly_earnings: 0,
    scheduled_shifts: 0,
    hours_worked: 0,
    avg_hourly_rate: 0
  });
  const [goal, setGoal] = useState<{ value: number; custom: boolean } | null>(null);
  const navigate = useNavigate();

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
    const doctorProfile = localStorage.getItem('userData');
    setHasProfile(!!doctorProfile);

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
          {hasProfile ? (
            <Button asChild variant="outline">
              <Link to="/doctor-profile" className="flex items-center gap-2">
                <User size={16} />
                Ver Perfil
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link to="/doctor-registration" className="flex items-center gap-2">
                <User size={16} />
                Cadastrar Perfil
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link to="/shifts/new">Novo plantão</Link>
          </Button>
        </div>
      </div>

      {!hasProfile && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-amber-800">Perfil médico incompleto</h3>
          <p className="text-amber-700 mt-1">
            Complete seu perfil médico para aumentar suas chances de encontrar plantões compatíveis.
          </p>
          <Button asChild variant="outline" className="mt-2 bg-amber-100 border-amber-300 hover:bg-amber-200">
            <Link to="/doctor-registration">Completar Perfil</Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Ganhos mensais"
          value={formatCurrency(stats.monthly_earnings)}
          description="Valor recebido neste mês"
          icon={<DollarSign />}
          trend={getTrend(stats.monthly_earnings, stats.previous_month_earnings)}
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
              const dateObj = shift.date instanceof Date ? shift.date : new Date(shift.date);
              return (status === 'completed' || status === 'paid') &&
                dateObj.getMonth() === currentMonth &&
                dateObj.getFullYear() === currentYear;
            });
            let totalValue = 0;
            let totalHours = 0;
            for (const shift of doneShifts) {
              let valor = typeof shift.value === 'string' ? Number(shift.value.replace(/[^\d,.-]/g, '').replace(',', '.')) : Number(shift.value);
              if (!isNaN(valor)) totalValue += valor;
              let hours = 0;
              if (typeof shift.start_time === 'string' && typeof shift.end_time === 'string') {
                const [sh, sm] = shift.start_time.split(':').map(Number);
                const [eh, em] = shift.end_time.split(':').map(Number);
                if (!isNaN(sh) && !isNaN(sm) && !isNaN(eh) && !isNaN(em)) {
                  let diff = (eh + em/60) - (sh + sm/60);
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
          <FinancialChart shifts={shifts
            .map((shift) => ({
              paymentDate: new Date(shift.payment_date || shift.paymentDate),
              date: new Date(shift.date),
              value: shift.value || shift.ganhos || 0,
              status: shift.status,
            }))
            .filter((shift) =>
              shift.date && !isNaN(shift.date.getTime()) &&
              shift.date.getFullYear() === new Date().getFullYear()
            )
          } />
        </div>
        <div className="md:col-span-2">
          <NextPaymentCard shifts={shifts} />
        </div>
      </div>

      <div className="w-full mt-6">
        <ShiftCalendar shifts={shifts} />
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <ShiftTable shifts={shifts} />
      </div> */}

    </AppShell>
  );
};

export default Dashboard;

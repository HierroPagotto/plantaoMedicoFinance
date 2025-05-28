import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/dashboard/StatCard';
import { FinancialChart } from '@/components/dashboard/FinancialChart';
import { NextPaymentCard } from '@/components/dashboard/NextPaymentCard';
import { MapPreview } from '@/components/dashboard/MapPreview';
import { ShiftCalendar } from '@/components/dashboard/ShiftCalendar';
import { ShiftTable } from '@/components/dashboard/ShiftTable';
import { Calendar, Clock, DollarSign, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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


  const nextShift = shifts
    .filter(shift => shift.status === 'scheduled' && new Date(shift.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] || null;

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
        />
        <StatCard
          title="Plantões agendados"
          value={stats.scheduled_shifts.toString()}
          description="Próximos 30 dias"
          icon={<Calendar />}
        />
        <StatCard
          title="Horas trabalhadas"
          value={`${stats.hours_worked}h`}
          description="Neste mês"
          icon={<Clock />}
        />
        <StatCard
          title="Valor/hora médio"
          value={formatCurrency(stats.avg_hourly_rate)}
          description="Últimos 3 meses"
          icon={<DollarSign />}
          trend={{ value: 5, positive: true }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinancialChart />
        <NextPaymentCard shifts={shifts} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <ShiftTable shifts={shifts} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <ShiftCalendar shifts={shifts} />
        {/* NÃO TEM ESSA API AINDA! */}
        {/*<MapPreview nextShift={nextShift} />*/}
      </div>
    </AppShell>
  );
};

export default Dashboard;

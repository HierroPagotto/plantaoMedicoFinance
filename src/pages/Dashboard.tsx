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
import { type ShiftProps } from '@/components/shifts/ShiftCard';
import { addDays, addMonths, subDays, subMonths } from 'date-fns';

const Dashboard = () => {
  const [shifts, setShifts] = useState<ShiftProps[]>([]);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    // Verifica se o perfil médico existe no localStorage
    const doctorProfile = localStorage.getItem('doctorProfile');
    setHasProfile(!!doctorProfile);

    // Mock data for demonstration
    const mockShifts: ShiftProps[] = [
      {
        id: '1',
        date: addDays(new Date(), 2),
        startTime: '08:00',
        endTime: '20:00',
        hospital: {
          name: 'Hospital São Lucas',
          address: 'Av. Brasília, 2084 - Centro, Araraquara - SP',
        },
        value: '1.250,00',
        specialty: 'Clínica Médica',
        paymentDate: addMonths(new Date(), 1),
        status: 'scheduled',
      },
      {
        id: '2',
        date: subDays(new Date(), 3),
        startTime: '19:00',
        endTime: '07:00',
        hospital: {
          name: 'Hospital Santa Casa',
          address: 'R. Padre Duarte, 700 - Jardim Nova América, Araraquara - SP',
        },
        value: '1.500,00',
        specialty: 'Cardiologia',
        paymentDate: addDays(new Date(), 5),
        status: 'completed',
      },
      {
        id: '3',
        date: subDays(new Date(), 10),
        startTime: '08:00',
        endTime: '20:00',
        hospital: {
          name: 'Hospital Unimed',
          address: 'Av. José Bonifácio, 794 - Jardim Botafogo, Araraquara - SP',
        },
        value: '1.300,00',
        specialty: 'Clínica Médica',
        paymentDate: subDays(new Date(), 2),
        status: 'paid',
      },
      {
        id: '4',
        date: new Date(),
        startTime: '08:00',
        endTime: '20:00',
        hospital: {
          name: 'Hospital São Paulo',
          address: 'R. Voluntários de São Paulo, 2150 - Centro, Araraquara - SP',
        },
        value: '1.200,00',
        specialty: 'Pediatria',
        paymentDate: addDays(new Date(), 15),
        status: 'scheduled',
      },
      {
        id: '5',
        date: subMonths(new Date(), 1),
        startTime: '08:00',
        endTime: '20:00',
        hospital: {
          name: 'Hospital São Lucas',
          address: 'Av. Brasília, 2084 - Centro, Araraquara - SP',
        },
        value: '1.250,00',
        specialty: 'Clínica Médica',
        paymentDate: subDays(new Date(), 5),
        status: 'canceled',
      },
    ];

    setShifts(mockShifts);
  }, []);

  // Get the next shift (closest scheduled shift in the future)
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

      {/* Alerta de perfil incompleto */}
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
          value="R$ 5.250,00"
          description="Valor recebido neste mês"
          icon={<DollarSign />}
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          title="Plantões agendados"
          value="8"
          description="Próximos 30 dias"
          icon={<Calendar />}
        />
        <StatCard
          title="Horas trabalhadas"
          value="72h"
          description="Neste mês"
          icon={<Clock />}
        />
        <StatCard
          title="Valor/hora médio"
          value="R$ 120,00"
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
        <MapPreview nextShift={nextShift} />
      </div>
    </AppShell>
  );
};

export default Dashboard;

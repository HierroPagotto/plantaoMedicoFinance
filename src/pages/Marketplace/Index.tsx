import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { OpportunityCard } from '@/components/marketplace/OpportunityCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import type { ShiftOpportunity } from '@/types/marketplace';
import { useToast } from '@/hooks/use-toast';
import { ClipboardList, Search } from 'lucide-react';

const specialties = [
  'Cardiologia',
  'Clínica Médica',
  'Dermatologia',
  'Endocrinologia',
  'Gastroenterologia',
  'Geriatria',
  'Ginecologia',
  'Neurologia',
  'Oftalmologia',
  'Ortopedia',
  'Pediatria',
  'Psiquiatria',
  'Radiologia',
  'UTI',
];

const MarketplacePage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<ShiftOpportunity[]>([]);
  const [city, setCity] = useState('');
  const [specialty, setSpecialty] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.listMarketplaceOpportunities({
        city: city.trim() || undefined,
        specialty: specialty === 'all' ? undefined : specialty,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      setOpportunities(data.opportunities || []);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar vagas',
        description: err?.response?.data?.message || 'Tente novamente em instantes.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
            <p className="text-muted-foreground">
              Plantões disponíveis publicados por hospitais. Candidate-se aos que combinam com você.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/marketplace/minhas-candidaturas">
              <ClipboardList className="mr-2 h-4 w-4" />
              Minhas candidaturas
            </Link>
          </Button>
        </div>

        <div className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-4">
          <Input
            placeholder="Cidade"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger>
              <SelectValue placeholder="Especialidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas especialidades</SelectItem>
              {specialties.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label="Data inicial"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label="Data final"
          />
          <Button className="md:col-span-4" onClick={load}>
            <Search className="mr-2 h-4 w-4" />
            Filtrar vagas
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando oportunidades...</p>
        ) : opportunities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <p className="font-medium">Nenhuma vaga aberta no momento</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ajuste os filtros ou volte mais tarde. Hospitais publicam novas oportunidades aqui.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {opportunities.map((item) => (
              <OpportunityCard key={item.id} opportunity={item} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default MarketplacePage;

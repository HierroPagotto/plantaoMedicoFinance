import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Stethoscope, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ShiftOpportunity } from '@/types/marketplace';
import { formatShortDate } from '@/lib/date-utils';

function formatTime(value?: string) {
  if (!value) return '—';
  return value.slice(0, 5);
}

function formatMoney(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

type OpportunityCardProps = {
  opportunity: ShiftOpportunity;
};

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const hospitalName = opportunity.hospital?.name || 'Hospital';
  const city =
    opportunity.city ||
    opportunity.hospital?.city ||
    opportunity.hospital?.address ||
    '—';

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{hospitalName}</h3>
          <p className="text-sm text-muted-foreground">{opportunity.specialty}</p>
        </div>
        <Badge variant="secondary">
          {opportunity.slots_remaining} vaga
          {opportunity.slots_remaining === 1 ? '' : 's'}
        </Badge>
      </div>

      <div className="mb-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          {formatShortDate(opportunity.date)}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          {formatTime(opportunity.start_time)} – {formatTime(opportunity.end_time)}
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          {city}
        </div>
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-primary" />
          {opportunity.specialty}
        </div>
        <div className="flex items-center gap-2 font-medium text-foreground sm:col-span-2">
          <Users className="h-4 w-4 text-primary" />
          {formatMoney(Number(opportunity.value))}
        </div>
      </div>

      <Button asChild className="w-full">
        <Link to={`/marketplace/${opportunity.id}`}>Ver detalhes</Link>
      </Button>
    </div>
  );
}

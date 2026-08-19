import type { ShiftOpportunity } from '@/types/marketplace';

const REQUIREMENT_LABELS: { key: keyof ShiftOpportunity; label: string }[] = [
  { key: 'requires_acls', label: 'ACLS' },
  { key: 'requires_bls', label: 'BLS' },
  { key: 'requires_atls', label: 'ATLS' },
  { key: 'requires_pals', label: 'PALS' },
];

export function getOpportunityRequirements(opportunity: ShiftOpportunity): string[] {
  return REQUIREMENT_LABELS.filter(({ key }) => Boolean(opportunity[key])).map(
    ({ label }) => label
  );
}

export function formatOpportunityRequirements(opportunity: ShiftOpportunity): string | null {
  const reqs = getOpportunityRequirements(opportunity);
  if (reqs.length === 0) return null;
  return reqs.join(', ');
}

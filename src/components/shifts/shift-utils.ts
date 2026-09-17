export function isMarketplaceShift(shift: {
  source?: string | null;
  opportunityId?: number | null;
  opportunity_id?: number | null;
}): boolean {
  return (
    shift.source === 'marketplace' ||
    Boolean(shift.opportunityId) ||
    Boolean(shift.opportunity_id)
  );
}

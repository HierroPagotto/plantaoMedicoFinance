export const MAX_SHIFT_RULE_DATES = 120;

export const SHIFT_WEEKDAY_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
];

export const SHIFT_MONTH_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Fev' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Abr' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Ago' },
  { value: 9, label: 'Set' },
  { value: 10, label: 'Out' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dez' },
];

export const SHIFT_OCCURRENCE_OPTIONS = [1, 2, 3, 4, 5] as const;

export type ShiftRuleInput = {
  year: number;
  months: number[];
  weekdays: number[];
  occurrences: number[];
};

export type ShiftRuleResult =
  | { ok: true; dates: Date[] }
  | { ok: false; reason: 'empty-input' | 'none' | 'too-many'; count?: number };

function weekdayOccurrences(year: number, month: number, weekday: number): Date[] {
  const lastDay = new Date(year, month, 0).getDate();
  const dates: Date[] = [];
  for (let day = 1; day <= lastDay; day += 1) {
    const date = new Date(year, month - 1, day);
    if (date.getDay() === weekday) dates.push(date);
  }
  return dates;
}

function dateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function expandShiftRule(input: ShiftRuleInput): ShiftRuleResult {
  const months = [...new Set(input.months.filter((month) => month >= 1 && month <= 12))];
  const weekdays = [...new Set(input.weekdays.filter((day) => day >= 0 && day <= 6))];
  if (!Number.isInteger(input.year) || months.length === 0 || weekdays.length === 0) {
    return { ok: false, reason: 'empty-input' };
  }

  const ordinals = [...new Set(input.occurrences.filter((n) => n >= 1 && n <= 5))];
  const useAll = ordinals.length === 0;
  const seen = new Set<string>();
  const dates: Date[] = [];

  for (const month of months.sort((a, b) => a - b)) {
    for (const weekday of weekdays) {
      const matches = weekdayOccurrences(input.year, month, weekday);
      const picked = useAll ? matches : ordinals.map((ordinal) => matches[ordinal - 1]).filter(Boolean);
      for (const date of picked) {
        const key = dateKey(date);
        if (seen.has(key)) continue;
        seen.add(key);
        dates.push(date);
      }
    }
  }

  dates.sort((a, b) => a.getTime() - b.getTime());
  if (dates.length === 0) return { ok: false, reason: 'none' };
  if (dates.length > MAX_SHIFT_RULE_DATES) {
    return { ok: false, reason: 'too-many', count: dates.length };
  }
  return { ok: true, dates };
}

export function shiftRuleErrorMessage(result: Extract<ShiftRuleResult, { ok: false }>) {
  if (result.reason === 'empty-input') {
    return 'Escolha ao menos um mês e um dia da semana.';
  }
  if (result.reason === 'too-many') {
    return `A regra geraria ${result.count} datas. O limite é ${MAX_SHIFT_RULE_DATES}. Reduza os meses ou os dias.`;
  }
  return 'Nenhuma data encontrada para essa regra.';
}

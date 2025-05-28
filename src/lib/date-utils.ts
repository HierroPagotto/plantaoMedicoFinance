import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function toAdjustedDate(date: string | Date): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return new Date(dateObj.getTime() + (dateObj.getTimezoneOffset() * 60000));
}

export function formatDate(date: string | Date, formatStr: string): string {
  return format(toAdjustedDate(date), formatStr, { locale: ptBR });
}

export function formatShortDate(date: string | Date): string {
  return formatDate(date, 'dd/MM/yyyy');
}

export function formatMediumDate(date: string | Date): string {
  return formatDate(date, 'dd MMM yyyy');
}

export function formatMonthDate(date: string | Date): string {
  return formatDate(date, "dd 'de' MMMM");
}

export function formatISODate(date: string | Date): string {
  return formatDate(date, 'yyyy-MM-dd');
}

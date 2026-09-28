import { isAxiosError } from 'axios';

export function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatISODate(value?: string | null) {
  if (!value) return '—';
  const d = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('pt-BR');
}

export function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function apiErrorMessage(error: unknown, fallback: string) {
  const message = isAxiosError(error)
    ? (error.response?.data as { message?: string })?.message
    : undefined;
  return message || fallback;
}

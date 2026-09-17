export interface Hospital {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export type ExpenseCategory =
  | 'fuel'
  | 'food'
  | 'toll'
  | 'parking'
  | 'transport'
  | 'other';

export interface ShiftExpense {
  id: number;
  shift_id: number;
  doctor_id: number;
  category: ExpenseCategory | string;
  category_label?: string;
  amount: number;
  description?: string | null;
  expense_date: string;
  created_at?: string;
  updated_at?: string | null;
}

export const EXPENSE_CATEGORY_OPTIONS: { value: ExpenseCategory; label: string }[] = [
  { value: 'fuel', label: 'Combustível' },
  { value: 'food', label: 'Alimentação' },
  { value: 'toll', label: 'Pedágio' },
  { value: 'parking', label: 'Estacionamento' },
  { value: 'transport', label: 'Transporte' },
  { value: 'other', label: 'Outro' },
];

export interface Shift {
  id: number;
  doctor_id: number;
  hospital_id: number;
  date: string;
  start_time: string;
  end_time: string;
  value: number;
  status: 'scheduled' | 'completed' | 'paid' | 'canceled';
  payment_date: string | null;
  specialty: string;
  hospital: Hospital;
  source?: string;
  opportunity_id?: number | null;
  expenses?: ShiftExpense[];
  expenses_total?: number;
  net_value?: number;
  created_at: string;
  updated_at: string;
}
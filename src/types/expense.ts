export type PersonalExpenseCategory =
  | 'streaming'
  | 'food'
  | 'housing'
  | 'utilities'
  | 'transport'
  | 'health'
  | 'education'
  | 'leisure'
  | 'shopping'
  | 'other';

export type ExpenseSource = 'personal' | 'shift';

export type ExpenseRecurrence =
  | 'none'
  | 'monthly'
  | 'bimonthly'
  | 'quarterly'
  | 'semiannual'
  | 'annual';

export interface ExpensePaymentMethod {
  id: number;
  doctor_id: number | null;
  name: string;
  slug: string;
  is_active: boolean;
  is_system?: boolean;
}

export interface UnifiedExpense {
  id: number;
  doctor_id: number;
  category: string;
  category_label?: string;
  amount: number;
  description?: string | null;
  expense_date: string;
  source: ExpenseSource;
  shift_id?: number | null;
  recurrence?: ExpenseRecurrence | string;
  recurrence_label?: string;
  payment_method_id?: number | null;
  payment_method_name?: string | null;
  recurrence_group_id?: string | null;
  is_recurrence_origin?: boolean;
  recurrence_active?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ExpenseSummaryBreakdown {
  year: number;
  month: number | null;
  total: number;
  by_category: Array<{ key: string; label: string; total: number }>;
  by_payment_method: Array<{ id: number | null; name: string; total: number }>;
}

export const PERSONAL_EXPENSE_CATEGORY_OPTIONS: {
  value: PersonalExpenseCategory;
  label: string;
}[] = [
  { value: 'streaming', label: 'Streaming' },
  { value: 'food', label: 'Alimentação' },
  { value: 'housing', label: 'Moradia' },
  { value: 'utilities', label: 'Contas' },
  { value: 'transport', label: 'Transporte' },
  { value: 'health', label: 'Saúde' },
  { value: 'education', label: 'Educação' },
  { value: 'leisure', label: 'Lazer' },
  { value: 'shopping', label: 'Compras' },
  { value: 'other', label: 'Outro' },
];

export const RECURRENCE_OPTIONS: { value: ExpenseRecurrence; label: string }[] = [
  { value: 'none', label: 'Nenhuma' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'bimonthly', label: 'Bimestral' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'semiannual', label: 'Semestral' },
  { value: 'annual', label: 'Anual' },
];

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
  created_at?: string | null;
  updated_at?: string | null;
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

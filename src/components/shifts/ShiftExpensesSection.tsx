import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

import api from '@/lib/api';
import {
  EXPENSE_CATEGORY_OPTIONS,
  type ExpenseCategory,
  type ShiftExpense,
} from '@/types/shift';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function parseAmountInput(raw: string): number | null {
  const normalized = raw.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100) / 100;
}

interface ShiftExpensesSectionProps {
  shiftId: string | number;
  shiftValue?: number;
  onChanged?: (summary: { expensesTotal: number; netValue: number }) => void;
}

export function ShiftExpensesSection({
  shiftId,
  shiftValue,
  onChanged,
}: ShiftExpensesSectionProps) {
  const [expenses, setExpenses] = useState<ShiftExpense[]>([]);
  const [expensesTotal, setExpensesTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ShiftExpense | null>(null);
  const [category, setCategory] = useState<ExpenseCategory>('fuel');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await api.listShiftExpenses(shiftId);
      const list: ShiftExpense[] = data.expenses || [];
      setExpenses(list);
      const total = Number(data.expenses_total ?? 0);
      setExpensesTotal(total);
      const net =
        data.net_value != null
          ? Number(data.net_value)
          : shiftValue != null
            ? shiftValue - total
            : undefined;
      if (onChanged && net != null) {
        onChanged({ expensesTotal: total, netValue: net });
      }
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.message || 'Erro ao carregar gastos'
        : 'Erro ao carregar gastos';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shiftId]);

  const openCreate = () => {
    setEditing(null);
    setCategory('fuel');
    setAmount('');
    setDescription('');
    setFormOpen(true);
  };

  const openEdit = (expense: ShiftExpense) => {
    setEditing(expense);
    setCategory((expense.category as ExpenseCategory) || 'other');
    setAmount(String(expense.amount).replace('.', ','));
    setDescription(expense.description || '');
    setFormOpen(true);
  };

  const handleSave = async () => {
    const parsed = parseAmountInput(amount);
    if (!parsed) {
      toast.error('Informe um valor válido maior que zero');
      return;
    }
    try {
      setSaving(true);
      if (editing) {
        await api.updateShiftExpense(shiftId, editing.id, {
          category,
          amount: parsed,
          description: description.trim() || null,
        });
        toast.success('Gasto atualizado');
      } else {
        await api.createShiftExpense(shiftId, {
          category,
          amount: parsed,
          description: description.trim() || undefined,
        });
        toast.success('Gasto adicionado');
      }
      setFormOpen(false);
      await loadExpenses();
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.message || 'Erro ao salvar gasto'
        : 'Erro ao salvar gasto';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (expense: ShiftExpense) => {
    try {
      await api.deleteShiftExpense(shiftId, expense.id);
      toast.success('Gasto removido');
      await loadExpenses();
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.message || 'Erro ao remover gasto'
        : 'Erro ao remover gasto';
      toast.error(message);
    }
  };

  const netValue =
    shiftValue != null ? shiftValue - expensesTotal : undefined;

  return (
    <div className="space-y-3 border-t pt-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-medium">Gastos</h4>
          <p className="text-xs text-muted-foreground">
            Lançados na data do plantão
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={openCreate}>
          <Plus className="mr-1 h-4 w-4" />
          Adicionar
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando gastos...</p>
      ) : expenses.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum gasto neste plantão.</p>
      ) : (
        <ul className="space-y-2">
          {expenses.map((expense) => (
            <li
              key={expense.id}
              className="flex items-start justify-between gap-2 rounded-md border p-2 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {expense.category_label ||
                    EXPENSE_CATEGORY_OPTIONS.find((c) => c.value === expense.category)
                      ?.label ||
                    expense.category}
                </p>
                {expense.description && (
                  <p className="truncate text-xs text-muted-foreground">
                    {expense.description}
                  </p>
                )}
                <p className="mt-0.5 font-medium">{formatCurrency(expense.amount)}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => openEdit(expense)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-red-600"
                  onClick={() => handleDelete(expense)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Total de gastos</span>
        <span className="font-medium">{formatCurrency(expensesTotal)}</span>
      </div>
      {netValue != null && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Líquido</span>
          <span className="font-semibold">{formatCurrency(netValue)}</span>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar gasto' : 'Novo gasto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as ExpenseCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex.: ida e volta"
                maxLength={255}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

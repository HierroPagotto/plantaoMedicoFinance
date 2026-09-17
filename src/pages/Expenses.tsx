import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

import { AppShell } from '@/components/layout/AppShell';
import { PageLoading } from '@/components/ui/PageLoading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import api from '@/lib/api';
import {
  PERSONAL_EXPENSE_CATEGORY_OPTIONS,
  type PersonalExpenseCategory,
  type UnifiedExpense,
} from '@/types/expense';

const months = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(value: string) {
  const d = new Date(`${value}T12:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('pt-BR');
}

function parseAmountInput(raw: string): number | null {
  const normalized = raw.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  const value = Number(normalized);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100) / 100;
}

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const Expenses = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [expenses, setExpenses] = useState<UnifiedExpense[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UnifiedExpense | null>(null);
  const [category, setCategory] = useState<PersonalExpenseCategory>('streaming');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(todayISO());
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await api.listExpenses({ year, month });
      setExpenses((data.expenses || []) as UnifiedExpense[]);
      setTotal(Number(data.expenses_total || 0));
    } catch {
      toast.error('Não foi possível carregar os gastos');
      setExpenses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const openCreate = () => {
    setEditing(null);
    setCategory('streaming');
    setAmount('');
    setExpenseDate(todayISO());
    setDescription('');
    setFormOpen(true);
  };

  const openEdit = (expense: UnifiedExpense) => {
    if (expense.source !== 'personal') return;
    setEditing(expense);
    setCategory((expense.category as PersonalExpenseCategory) || 'other');
    setAmount(String(expense.amount).replace('.', ','));
    setExpenseDate(expense.expense_date?.slice(0, 10) || todayISO());
    setDescription(expense.description || '');
    setFormOpen(true);
  };

  const handleSave = async () => {
    const parsedAmount = parseAmountInput(amount);
    if (parsedAmount == null) {
      toast.error('Informe um valor válido maior que zero');
      return;
    }
    if (!expenseDate) {
      toast.error('Informe a data do gasto');
      return;
    }

    try {
      setSaving(true);
      if (editing) {
        await api.updateExpense(editing.id, {
          category,
          amount: parsedAmount,
          expense_date: expenseDate,
          description: description.trim() || null,
        });
        toast.success('Gasto atualizado');
      } else {
        await api.createExpense({
          category,
          amount: parsedAmount,
          expense_date: expenseDate,
          description: description.trim() || undefined,
        });
        toast.success('Gasto adicionado');
      }
      setFormOpen(false);
      await loadExpenses();
    } catch (error) {
      const message = isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message
        : undefined;
      toast.error(message || 'Erro ao salvar gasto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (expense: UnifiedExpense) => {
    if (expense.source !== 'personal') return;
    if (!window.confirm('Excluir este gasto?')) return;
    try {
      await api.deleteExpense(expense.id);
      toast.success('Gasto excluído');
      await loadExpenses();
    } catch (error) {
      const message = isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message
        : undefined;
      toast.error(message || 'Erro ao excluir gasto');
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gastos</h1>
            <p className="text-muted-foreground text-sm">
              Despesas pessoais e gastos de plantão no mesmo lugar
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo gasto
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <Label>Mês</Label>
            <Select
              value={String(month)}
              onValueChange={(v) => setMonth(Number(v))}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((label, idx) => (
                  <SelectItem key={label} value={String(idx + 1)}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Ano</Label>
            <Select
              value={String(year)}
              onValueChange={(v) => setYear(Number(v))}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto text-sm font-medium">
            Total do período: {formatCurrency(total)}
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Lista de gastos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <PageLoading label="Carregando gastos..." />
            ) : expenses.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Nenhum gasto neste período.
              </p>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => {
                  const isPersonal = expense.source === 'personal';
                  return (
                    <div
                      key={`${expense.source}-${expense.id}`}
                      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">
                            {expense.category_label || expense.category}
                          </span>
                          <Badge variant={isPersonal ? 'secondary' : 'outline'}>
                            {isPersonal ? 'Pessoal' : 'Plantão'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(expense.expense_date)}
                          {expense.description ? ` · ${expense.description}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-semibold tabular-nums">
                          {formatCurrency(Number(expense.amount))}
                        </span>
                        {isPersonal ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(expense)}
                              aria-label="Editar gasto"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(expense)}
                              aria-label="Excluir gasto"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        ) : expense.shift_id ? (
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/shifts">Ver plantão</Link>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar gasto pessoal' : 'Novo gasto pessoal'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as PersonalExpenseCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERSONAL_EXPENSE_CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                inputMode="decimal"
              />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex.: Netflix, luz, internet..."
                maxLength={255}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default Expenses;

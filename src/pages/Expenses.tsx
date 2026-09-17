import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

import { AppShell } from '@/components/layout/AppShell';
import { PageLoading } from '@/components/ui/PageLoading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import {
  formatNumberToCurrencyInput,
  parseCurrencyInput,
} from '@/lib/currency';
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
import { ExpenseBreakdownCharts } from '@/components/expenses/ExpenseBreakdownCharts';
import api from '@/lib/api';
import {
  PERSONAL_EXPENSE_CATEGORY_OPTIONS,
  RECURRENCE_OPTIONS,
  type ExpensePaymentMethod,
  type ExpenseRecurrence,
  type ExpenseSummaryBreakdown,
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
  const [summary, setSummary] = useState<ExpenseSummaryBreakdown | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<ExpensePaymentMethod[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UnifiedExpense | null>(null);
  const [category, setCategory] = useState<PersonalExpenseCategory>('streaming');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(todayISO());
  const [description, setDescription] = useState('');
  const [recurrence, setRecurrence] = useState<ExpenseRecurrence>('none');
  const [paymentMethodId, setPaymentMethodId] = useState<string>('none');
  const [saving, setSaving] = useState(false);

  const [customMethodOpen, setCustomMethodOpen] = useState(false);
  const [customMethodName, setCustomMethodName] = useState('');
  const [savingMethod, setSavingMethod] = useState(false);

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  const loadPaymentMethods = async () => {
    try {
      const data = await api.listPaymentMethods();
      setPaymentMethods((data.payment_methods || []) as ExpensePaymentMethod[]);
    } catch {
      setPaymentMethods([]);
    }
  };

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

  const loadSummary = async () => {
    try {
      setSummaryLoading(true);
      const data = await api.getExpenseSummary({ year, month });
      setSummary(data as ExpenseSummaryBreakdown);
    } catch {
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  useEffect(() => {
    loadExpenses();
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const openCreate = () => {
    setEditing(null);
    setCategory('streaming');
    setAmount('');
    setExpenseDate(todayISO());
    setDescription('');
    setRecurrence('none');
    setPaymentMethodId('none');
    setFormOpen(true);
  };

  const openEdit = (expense: UnifiedExpense) => {
    if (expense.source !== 'personal') return;
    setEditing(expense);
    setCategory((expense.category as PersonalExpenseCategory) || 'other');
    setAmount(formatNumberToCurrencyInput(Number(expense.amount)));
    setExpenseDate(expense.expense_date?.slice(0, 10) || todayISO());
    setDescription(expense.description || '');
    setRecurrence((expense.recurrence as ExpenseRecurrence) || 'none');
    setPaymentMethodId(
      expense.payment_method_id != null ? String(expense.payment_method_id) : 'none'
    );
    setFormOpen(true);
  };

  const handleSave = async () => {
    const parsedAmount = parseCurrencyInput(amount);
    if (parsedAmount == null) {
      toast.error('Informe um valor válido maior que zero');
      return;
    }
    if (!expenseDate) {
      toast.error('Informe a data do gasto');
      return;
    }

    const payload = {
      category,
      amount: parsedAmount,
      expense_date: expenseDate,
      description: description.trim() || null,
      recurrence,
      payment_method_id:
        paymentMethodId === 'none' ? null : Number(paymentMethodId),
    };

    try {
      setSaving(true);
      if (editing) {
        await api.updateExpense(editing.id, payload);
        toast.success('Gasto atualizado');
      } else {
        await api.createExpense({
          ...payload,
          description: description.trim() || undefined,
        });
        toast.success(
          recurrence !== 'none'
            ? 'Gasto adicionado e recorrências geradas'
            : 'Gasto adicionado'
        );
      }
      setFormOpen(false);
      await Promise.all([loadExpenses(), loadSummary()]);
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
    const msg = expense.is_recurrence_origin
      ? 'Excluir este gasto? Se for a origem da série, lançamentos futuros da recorrência também serão removidos.'
      : 'Excluir este gasto?';
    if (!window.confirm(msg)) return;
    try {
      await api.deleteExpense(expense.id);
      toast.success('Gasto excluído');
      await Promise.all([loadExpenses(), loadSummary()]);
    } catch (error) {
      const message = isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message
        : undefined;
      toast.error(message || 'Erro ao excluir gasto');
    }
  };

  const handleCreatePaymentMethod = async () => {
    const name = customMethodName.trim();
    if (name.length < 2) {
      toast.error('Informe um nome com pelo menos 2 caracteres');
      return;
    }
    try {
      setSavingMethod(true);
      const data = await api.createPaymentMethod(name);
      const method = data.payment_method as ExpensePaymentMethod;
      await loadPaymentMethods();
      setPaymentMethodId(String(method.id));
      setCustomMethodOpen(false);
      setCustomMethodName('');
      toast.success('Forma de cobrança adicionada');
    } catch (error) {
      const message = isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message
        : undefined;
      toast.error(message || 'Erro ao criar forma de cobrança');
    } finally {
      setSavingMethod(false);
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

        <ExpenseBreakdownCharts summary={summary} loading={summaryLoading} />

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
                          {isPersonal &&
                            expense.recurrence &&
                            expense.recurrence !== 'none' && (
                              <Badge variant="outline">
                                {expense.recurrence_label || expense.recurrence}
                              </Badge>
                            )}
                          {isPersonal && expense.payment_method_name && (
                            <Badge variant="outline">
                              {expense.payment_method_name}
                            </Badge>
                          )}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
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
              <CurrencyInput
                value={amount}
                onValueChange={setAmount}
                placeholder="0,00"
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
              <Label>Recorrência de cobrança</Label>
              <Select
                value={recurrence}
                onValueChange={(v) => setRecurrence(v as ExpenseRecurrence)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECURRENCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Onde é cobrado</Label>
              <div className="flex gap-2">
                <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Não informado</SelectItem>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={String(method.id)}>
                        {method.name}
                        {method.is_system ? '' : ' (meu)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCustomMethodOpen(true)}
                >
                  Adicionar
                </Button>
              </div>
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

      <Dialog open={customMethodOpen} onOpenChange={setCustomMethodOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova forma de cobrança</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Nome</Label>
            <Input
              value={customMethodName}
              onChange={(e) => setCustomMethodName(e.target.value)}
              placeholder="Ex.: Cartão Santander"
              maxLength={80}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCustomMethodOpen(false)}
              disabled={savingMethod}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreatePaymentMethod} disabled={savingMethod}>
              {savingMethod ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default Expenses;

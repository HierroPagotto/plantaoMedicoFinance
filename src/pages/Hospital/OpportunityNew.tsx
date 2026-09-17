import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { HospitalShell } from '@/components/layout/HospitalShell';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { isAxiosError } from 'axios';
import { Checkbox } from '@/components/ui/checkbox';
import {
  PROFESSIONS,
  specialtiesFor,
  type Profession,
} from '@/lib/professions';

const schema = z
  .object({
    date: z.string().min(1, 'Informe a data'),
    start_time: z.string().min(1, 'Informe o horário de início'),
    end_time: z.string().min(1, 'Informe o horário de término'),
    required_profession: z.enum([
      'doctor',
      'nurse',
      'technician',
    ]),
    specialty: z.string().min(1, 'Informe a especialidade'),
    value: z.coerce.number().positive('Valor deve ser maior que zero'),
    payment_date: z.string().min(1, 'Informe a data prevista de pagamento'),
    city: z.string().optional(),
    slots_total: z.coerce.number().int().min(1, 'Pelo menos 1 vaga'),
    notes: z.string().optional(),
    requires_acls: z.boolean().default(false),
    requires_bls: z.boolean().default(false),
    requires_atls: z.boolean().default(false),
    requires_pals: z.boolean().default(false),
  })
  .refine((data) => !data.payment_date || !data.date || data.payment_date >= data.date, {
    message: 'O pagamento não pode ser anterior à data do plantão',
    path: ['payment_date'],
  });

type FormData = z.infer<typeof schema>;

function readHospitalCity() {
  try {
    const user = JSON.parse(localStorage.getItem('userData') || '{}');
    return user.hospital?.city || '';
  } catch {
    return '';
  }
}

const HospitalNewOpportunityPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: '',
      start_time: '19:00',
      end_time: '07:00',
      required_profession: 'doctor',
      specialty: 'Clínica médica',
      value: 1400,
      payment_date: '',
      city: readHospitalCity(),
      slots_total: 1,
      notes: '',
      requires_acls: false,
      requires_bls: false,
      requires_atls: false,
      requires_pals: false,
    },
  });

  const requiredProfession = form.watch('required_profession') as Profession;
  const specialtyOptions = specialtiesFor(requiredProfession).filter((s) => s !== 'Outra');

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const result = await api.createHospitalOpportunity({
        date: data.date,
        start_time: data.start_time.length === 5 ? `${data.start_time}:00` : data.start_time,
        end_time: data.end_time.length === 5 ? `${data.end_time}:00` : data.end_time,
        required_profession: data.required_profession,
        specialty: data.specialty,
        value: data.value,
        payment_date: data.payment_date,
        city: data.city || undefined,
        slots_total: data.slots_total,
        notes: data.notes || undefined,
        requires_acls: data.requires_acls,
        requires_bls: data.requires_bls,
        requires_atls: data.requires_atls,
        requires_pals: data.requires_pals,
      });
      toast({
        title: 'Vaga publicada',
        description: 'Profissionais elegíveis já podem visualizar no marketplace.',
      });
      navigate(`/hospital/opportunities/${result.opportunity.id}`);
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined;
      toast({
        variant: 'destructive',
        title: 'Erro ao publicar',
        description: message || 'Verifique os dados e tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <HospitalShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <Button variant="ghost" asChild className="mb-2 px-0">
            <Link to="/hospital/opportunities">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Publicar plantão</h1>
          <p className="text-slate-600">
            Ex.: 25/08/2026 · 19:00–07:00 · Clínica Médica · R$ 1.400 · pagamento em 30 dias
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
          >
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Início</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Término</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="required_profession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profissão da vaga</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      const next = specialtiesFor(value as Profession).filter(
                        (s) => s !== 'Outra'
                      );
                      form.setValue('specialty', next[0] || '');
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Profissão" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROFESSIONS.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidade</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Especialidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {specialtyOptions.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slots_total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vagas</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="São Paulo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="payment_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data prevista de pagamento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <p className="text-xs text-slate-500">
                    Quando o profissional deve receber (ex.: 30 ou 45 dias após o plantão).
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-3 rounded-lg border border-slate-200 p-4">
              <div>
                <FormLabel>Requisitos (opcional)</FormLabel>
                <p className="text-xs text-slate-500">
                  Se marcados, só profissionais com essas certificações no perfil verão a vaga.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ['requires_acls', 'ACLS'],
                    ['requires_bls', 'BLS'],
                    ['requires_atls', 'ATLS'],
                    ['requires_pals', 'PALS'],
                  ] as const
                ).map(([name, label]) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => field.onChange(checked === true)}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Requisitos, local de apresentação, etc."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Publicando...' : 'Publicar oportunidade'}
            </Button>
          </form>
        </Form>
      </div>
    </HospitalShell>
  );
};

export default HospitalNewOpportunityPage;

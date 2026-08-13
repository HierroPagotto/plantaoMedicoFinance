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

const specialties = [
  'Cardiologia',
  'Clínica Médica',
  'Dermatologia',
  'Endocrinologia',
  'Gastroenterologia',
  'Geriatria',
  'Ginecologia',
  'Neurologia',
  'Oftalmologia',
  'Ortopedia',
  'Pediatria',
  'Psiquiatria',
  'Radiologia',
  'UTI',
];

const schema = z.object({
  date: z.string().min(1, 'Informe a data'),
  start_time: z.string().min(1, 'Informe o horário de início'),
  end_time: z.string().min(1, 'Informe o horário de término'),
  specialty: z.string().min(1, 'Informe a especialidade'),
  value: z.coerce.number().positive('Valor deve ser maior que zero'),
  city: z.string().optional(),
  slots_total: z.coerce.number().int().min(1, 'Pelo menos 1 vaga'),
  notes: z.string().optional(),
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
      specialty: 'Clínica Médica',
      value: 1400,
      city: readHospitalCity(),
      slots_total: 1,
      notes: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const result = await api.createHospitalOpportunity({
        date: data.date,
        start_time: data.start_time.length === 5 ? `${data.start_time}:00` : data.start_time,
        end_time: data.end_time.length === 5 ? `${data.end_time}:00` : data.end_time,
        specialty: data.specialty,
        value: data.value,
        city: data.city || undefined,
        slots_total: data.slots_total,
        notes: data.notes || undefined,
      });
      toast({
        title: 'Vaga publicada',
        description: 'Médicos já podem visualizar no marketplace.',
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
            Ex.: 25/08/2026 · 19:00–07:00 · Clínica Médica · R$ 1.400 · 1 vaga
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
                      {specialties.map((item) => (
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

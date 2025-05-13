import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HospitalSearch, type Hospital } from './HospitalSearch';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

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
  'Urologia'
];

const formSchema = z.object({
  shiftDate: z.date({
    required_error: "A data do plantão é obrigatória",
  }),
  startTime: z.string().min(1, { message: "O horário de início é obrigatório" }),
  endTime: z.string().min(1, { message: "O horário de término é obrigatório" }),
  value: z.string().min(1, { message: "O valor do plantão é obrigatório" }),
  specialty: z.string().min(1, { message: "A especialidade é obrigatória" }),
  hospital_id: z.string().min(1, { message: "O hospital ou clínica é obrigatório" }),
  paymentDate: z.date({
    required_error: "A data prevista para pagamento é obrigatória",
  }),
});

type FormData = z.infer<typeof formSchema>;

export function ShiftForm() {
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startTime: '',
      endTime: '',
      value: '',
      specialty: '',
      hospital_id: '',
    }
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const shiftData = {
        date: format(data.shiftDate, 'yyyy-MM-dd'),
        start_time: data.startTime,
        end_time: data.endTime,
        hospital_id: data.hospital_id,
        value: parseFloat(data.value.replace('.', '').replace(',', '.')),
        specialty: data.specialty,
        payment_date: format(data.paymentDate, 'yyyy-MM-dd'),
      };

      await api.createShift(shiftData);

      toast({
        title: "Plantão registrado com sucesso!",
        description: "O plantão foi adicionado ao seu calendário.",
      });

      navigate('/shifts');

      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao registrar plantão",
        description: "Tente novamente mais tarde.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="shiftDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data do plantão</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      locale={ptBR}
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora de início</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type="time"
                        placeholder="Hora de início"
                        {...field}
                      />
                    </FormControl>
                    <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora de término</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type="time"
                        placeholder="Hora de término"
                        {...field}
                      />
                    </FormControl>
                    <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="hospital_id"
            render={({ field }) => {
              const selectedHospital = hospitals.find(h => h.id.toString() === field.value);

              return (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel>Hospital / Clínica</FormLabel>
                  <FormControl>
                    <HospitalSearch
                      value={selectedHospital || null}
                      onChange={(hospital: Hospital) => {
                        if (!hospitals.some(h => h.id === hospital.id)) {
                          setHospitals([...hospitals, hospital]);
                        }
                        field.onChange(hospital.id.toString());
                      }}
                      onSearchResults={(results) => {
                        setHospitals(results);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor do plantão (R$)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="0,00"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, '')
                        .replace(/(\d)(\d{2})$/, '$1,$2')
                        .replace(/(?=(\d{3})+(\D))\B/g, '.');
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Especialidade do plantão</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a especialidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
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
            name="paymentDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data prevista para pagamento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      locale={ptBR}
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full md:w-auto" disabled={loading}>
          {loading ? "Registrando..." : "Registrar plantão"}
        </Button>
      </form>
    </Form>
  );
}
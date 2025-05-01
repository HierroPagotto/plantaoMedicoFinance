import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
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
  hospital: z.object({
    name: z.string().min(1, { message: "O nome do hospital é obrigatório" }),
    address: z.string().min(1, { message: "O endereço do hospital é obrigatório" }),
    location: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
  value: z.string().min(1, { message: "O valor do plantão é obrigatório" }),
  specialty: z.string().min(1, { message: "A especialidade é obrigatória" }),
  paymentDate: z.date({
    required_error: "A data prevista para pagamento é obrigatória",
  }),
});

type FormData = z.infer<typeof formSchema>;

export function ShiftForm() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startTime: '',
      endTime: '',
      value: '',
      specialty: '',
    }
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      console.log('Shift data:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Plantão registrado com sucesso!",
        description: "O plantão foi adicionado ao seu calendário.",
      });
      
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
                      className={cn("p-3 pointer-events-auto")}
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
            name="hospital"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Hospital / Clínica</FormLabel>
                <FormControl>
                  <HospitalSearch
                    value={field.value as Hospital}
                    onChange={(hospital: Hospital) => {
                      field.onChange(hospital);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Busque pelo nome ou endereço do hospital ou clínica
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
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
                      className={cn("p-3 pointer-events-auto")}
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

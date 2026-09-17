import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Clock, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
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
import { ShiftExpensesSection } from './ShiftExpensesSection';
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
  startTime: z.string().min(1, { message: "O horário de início é obrigatório" }),
  endTime: z.string().min(1, { message: "O horário de término é obrigatório" }),
  value: z.string().min(1, { message: "O valor do plantão é obrigatório" }),
  specialty: z.string().min(1, { message: "A especialidade é obrigatória" }),
  hospital_id: z.string().min(1, { message: "O hospital ou clínica é obrigatório" }),
  paymentDate: z.date({
    required_error: "A data prevista para pagamento é obrigatória",
  }),

  multipleDates: z.boolean().default(false),
  shiftDate: z.date().optional(),
  endDate: z.date().optional(),
  selectedDates: z.array(z.date()).optional(),
}).refine((data) => {
  if (data.multipleDates) {
    return data.selectedDates && data.selectedDates.length > 0;
  }
  else {
    return !!data.shiftDate;
  }
}, {
  message: "Selecione pelo menos uma data para o plantão",
  path: ["shiftDate"],
});

type FormData = z.infer<typeof formSchema>;

interface ShiftFormProps {
  initialData?: {
    id?: string | number;
    date?: string | Date;
    end_date?: string | Date;
    endDate?: string | Date;
    start_time?: string;
    startTime?: string;
    end_time?: string;
    endTime?: string;
    value?: string | number;
    valueNumber?: number;
    specialty?: string;
    hospital_id?: string | number;
    payment_date?: string | Date | null;
    paymentDate?: string | Date | null;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
  onExpensesChanged?: (summary: { expensesTotal: number; netValue: number }) => void;
  mode?: 'edit' | 'create';
}

function resolveShiftValue(data?: ShiftFormProps['initialData']): number | undefined {
  if (!data) return undefined;
  if (typeof data.valueNumber === 'number' && !Number.isNaN(data.valueNumber)) {
    return data.valueNumber;
  }
  if (typeof data.value === 'number' && !Number.isNaN(data.value)) {
    return data.value;
  }
  if (typeof data.value === 'string') {
    const parsed = Number(
      data.value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
    );
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export function ShiftForm({
  initialData,
  onSuccess,
  onCancel,
  onExpensesChanged,
  mode = 'create',
}: ShiftFormProps) {
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const shiftId = initialData?.id;
  const shiftValue = resolveShiftValue(initialData);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          shiftDate: initialData.date ? new Date(initialData.date) : undefined,
          endDate: initialData.end_date
            ? new Date(initialData.end_date)
            : initialData.endDate
              ? new Date(initialData.endDate)
              : undefined,
          startTime: initialData.start_time || initialData.startTime || '',
          endTime: initialData.end_time || initialData.endTime || '',
          value:
            typeof initialData.value === 'number'
              ? initialData.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
              : typeof initialData.value === 'string'
                ? initialData.value.replace(/^R\$\s?/, '')
                : '',
          specialty: initialData.specialty || '',
          hospital_id: initialData.hospital_id ? String(initialData.hospital_id) : '',
          multipleDates: false,
          selectedDates: undefined,
          paymentDate: initialData.payment_date
            ? new Date(initialData.payment_date)
            : initialData.paymentDate
              ? new Date(initialData.paymentDate)
              : undefined,
        }
      : {
          shiftDate: undefined,
          startTime: '',
          endTime: '',
          value: '',
          specialty: '',
          hospital_id: '',
          multipleDates: false,
          selectedDates: [],
          paymentDate: undefined,
        },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const shiftData: {
        start_time: string;
        end_time: string;
        hospital_id: string;
        value: number;
        specialty: string;
        payment_date: string;
        date?: string;
        end_date?: string;
        week_days?: string[];
      } = {
        start_time: data.startTime,
        end_time: data.endTime,
        hospital_id: data.hospital_id,
        value: parseFloat(data.value.replace(/\./g, '').replace(',', '.')),
        specialty: data.specialty,
        payment_date: format(data.paymentDate, 'yyyy-MM-dd'),
      };

      if (data.multipleDates && data.selectedDates && data.selectedDates.length > 0) {
        shiftData.date = format(data.selectedDates[0], 'yyyy-MM-dd');
        shiftData.week_days = data.selectedDates.map(day => format(day, 'yyyy-MM-dd'));
      } else if (data.shiftDate) {
        shiftData.date = format(data.shiftDate, 'yyyy-MM-dd');
        if (data.endDate) {
          shiftData.end_date = format(data.endDate, 'yyyy-MM-dd');
        }
      }

      if (mode === 'edit' && initialData) {
        await api.updateShift(initialData.id, shiftData);
        toast({
          title: 'Plantão atualizado com sucesso!',
          description: 'As alterações foram salvas.',
        });
        if (onSuccess) onSuccess();
      } else {
        await api.createShift(shiftData);
        toast({
          title: 'Plantão registrado com sucesso!',
          description: 'O plantão foi adicionado ao seu calendário.',
        });
        navigate('/shifts');
        form.reset();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: mode === 'edit' ? 'Erro ao atualizar plantão' : 'Erro ao registrar plantão',
        description: 'Tente novamente mais tarde.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="multipleDates"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Selecionar múltiplas datas</FormLabel>
                    <FormDescription>
                      Ative para selecionar várias datas específicas para o plantão
                    </FormDescription>
                  </div>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            {!form.watch("multipleDates") ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date("1900-01-01")
                            }
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data final (opcional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data final</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < (form.getValues().shiftDate || new Date("1900-01-01"))
                            }
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="selectedDates"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel>Datas selecionadas</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <Plus className="h-4 w-4" />
                              Adicionar data
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={undefined}
                              onSelect={(date) => {
                                if (date) {
                                  const currentDates = field.value || [];
                                  const dateExists = currentDates.some(d =>
                                    format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                                  );

                                  if (!dateExists) {
                                    field.onChange([...currentDates, date]);
                                  }
                                }
                              }}
                              disabled={(date) =>
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2 mt-2">
                        {field.value && field.value.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {field.value.map((day, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-md"
                              >
                                {format(day, "dd/MM/yyyy")}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5"
                                  onClick={() => {
                                    const newDays = [...field.value || []];
                                    newDays.splice(index, 1);
                                    field.onChange(newDays);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-sm p-2 border rounded-md">
                            Nenhuma data selecionada. Adicione pelo menos uma data.
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
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
              const selectedHospital = field.value
                ? hospitals.find(h => h && h.id && h.id.toString() === field.value)
                : null;

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

        <Button
          type="submit"
          className="w-full md:w-auto"
          disabled={loading}
        >
          {loading ? (mode === 'edit' ? 'Salvando...' : 'Registrando...') : (mode === 'edit' ? 'Salvar alterações' : 'Registrar plantão')}
        </Button>
        {mode === 'edit' && onCancel && (
          <Button type="button" variant="ghost" className="w-full md:w-auto ml-2" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
      </form>
    </Form>

    {mode === 'edit' && shiftId != null && (
      <ShiftExpensesSection
        shiftId={shiftId}
        shiftValue={shiftValue}
        onChanged={onExpensesChanged}
      />
    )}
    </div>
  );
}
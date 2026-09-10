import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { api } from '@/lib/api';
import { OTHER_SPECIALTY } from '@/types/doctor';
import { DOCTOR_PROFILE_SETUP_PATH } from '@/lib/doctor-profile';
import {
  PROFESSIONS,
  councilLabel,
  specialtiesFor,
  type Profession,
} from '@/lib/professions';

const formSchema = z
  .object({
    name: z.string().min(3, { message: 'Nome deve ter no mínimo 3 caracteres' }),
    email: z.string().email({ message: 'Email inválido' }),
    password: z.string().min(6, { message: 'Senha deve ter no mínimo 6 caracteres' }),
    profession: z.enum([
      'doctor',
      'nurse',
      'nursing_technician',
      'orthopedic_technician',
    ]),
    specialty: z.string().min(1, { message: 'Selecione uma especialidade' }),
    customSpecialty: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.specialty === OTHER_SPECIALTY) {
      const custom = (data.customSpecialty || '').trim();
      if (custom.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Informe a especialidade (mín. 3 caracteres)',
          path: ['customSpecialty'],
        });
      }
    }
  });

type FormData = z.infer<typeof formSchema>;

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      profession: 'doctor',
      specialty: '',
      customSpecialty: '',
    },
  });

  const selectedSpecialty = form.watch('specialty');
  const profession = form.watch('profession') as Profession;
  const specialtyOptions = useMemo(() => specialtiesFor(profession), [profession]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const mainSpecialty =
        data.specialty === OTHER_SPECIALTY
          ? (data.customSpecialty || '').trim()
          : data.specialty;

      await api.register({
        name: data.name,
        email: data.email,
        password: data.password,
        profession: data.profession,
        council_type: councilLabel(data.profession),
        main_specialty: mainSpecialty,
        specialties: [mainSpecialty],
      });

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Complete seu perfil profissional para continuar...',
      });

      await api.login(data.email, data.password);

      const me = await api.getAuthMe();
      localStorage.setItem('userData', JSON.stringify(me));
      navigate(DOCTOR_PROFILE_SETUP_PATH);
    } catch (error: unknown) {
      const errorMessage = isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message ||
          'Erro ao criar conta'
        : 'Erro ao criar conta';

      toast({
        variant: 'destructive',
        title: 'Erro no cadastro',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full max-w-md">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome completo</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="profession"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profissão</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue('specialty', '');
                  form.setValue('customSpecialty', '');
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua profissão" />
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="seuemail@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
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
              <FormLabel>Especialidade / área principal</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  if (value !== OTHER_SPECIALTY) {
                    form.setValue('customSpecialty', '');
                  }
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {specialtyOptions.map((specialty) => (
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

        {selectedSpecialty === OTHER_SPECIALTY && (
          <FormField
            control={form.control}
            name="customSpecialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Qual especialidade?</FormLabel>
                <FormControl>
                  <Input placeholder="Descreva sua especialidade" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
      </form>
    </Form>
  );
}

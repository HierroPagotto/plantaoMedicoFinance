import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const schema = z.object({
  hospital_name: z.string().min(2, 'Informe o nome do hospital'),
  address: z.string().min(5, 'Informe o endereço'),
  city: z.string().optional(),
  state: z.string().max(2).optional(),
  cnpj: z.string().optional(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  admin_name: z.string().min(2, 'Informe o nome do responsável'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha com pelo menos 6 caracteres'),
  phone: z.string().optional(),
  accepted_terms: z.literal(true, {
    errorMap: () => ({ message: 'Aceite a Política de Privacidade e os Termos de Uso' }),
  }),
});

type FormData = z.infer<typeof schema>;

const HospitalRegister = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      hospital_name: '',
      address: '',
      city: '',
      state: '',
      cnpj: '',
      latitude: -23.5505,
      longitude: -46.6333,
      admin_name: '',
      email: '',
      password: '',
      phone: '',
      accepted_terms: undefined as unknown as true,
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.registerHospital({
        hospital: {
          name: data.hospital_name,
          address: data.address,
          city: data.city || undefined,
          state: data.state || undefined,
          cnpj: data.cnpj || undefined,
          latitude: data.latitude,
          longitude: data.longitude,
        },
        admin: {
          name: data.admin_name,
          email: data.email,
          password: data.password,
          phone: data.phone || undefined,
        },
        accepted_terms: true,
      });
      toast({
        title: 'Hospital cadastrado',
        description: 'Bem-vindo ao portal hospitalar.',
      });
      navigate('/hospital');
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro no cadastro',
        description: err?.response?.data?.message || 'Verifique os dados e tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-8">
        <h1 className="mb-2 text-3xl font-semibold">Cadastrar hospital</h1>
        <p className="mb-8 text-slate-600">
          Crie a conta do hospital e o primeiro administrador.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <p className="text-sm font-medium text-slate-800">Hospital</p>
            <FormField
              control={form.control}
              name="hospital_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UF</FormLabel>
                    <FormControl>
                      <Input maxLength={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <p className="pt-4 text-sm font-medium text-slate-800">Administrador</p>
            <FormField
              control={form.control}
              name="admin_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do responsável</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
                    <Input type="email" {...field} />
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accepted_terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value === true}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-normal text-sm">
                      Li e aceito a{' '}
                      <Link to="/privacy" className="underline text-primary" target="_blank">
                        Política de Privacidade
                      </Link>{' '}
                      e os{' '}
                      <Link to="/terms" className="underline text-primary" target="_blank">
                        Termos de Uso
                      </Link>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Criar conta do hospital'}
            </Button>
          </form>
        </Form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Já tem conta?{' '}
          <Button variant="link" className="p-0" asChild>
            <Link to="/login">Entrar</Link>
          </Button>
        </p>
      </div>
    </div>
  );
};

export default HospitalRegister;

import { useState } from 'react';
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
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { isDoctorProfileComplete, DOCTOR_PROFILE_SETUP_PATH } from '@/lib/doctor-profile';
const formSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
});

type FormData = z.infer<typeof formSchema>;

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const session = await api.login(data.email, data.password);

      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando...",
      });

      if (session.role === 'hospital_staff') {
        navigate('/hospital');
        return;
      }

      const me = await api.getAuthMe();
      localStorage.setItem('userData', JSON.stringify(me));
      navigate(
        isDoctorProfileComplete(me) ? '/dashboard' : DOCTOR_PROFILE_SETUP_PATH
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: "Email ou senha incorretos.",
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

        <div className="text-right">
          <Button variant="link" className="p-0 text-sm text-gray-600 hover:text-gray-800" asChild>
            <Link to="/password-reset">Esqueceu sua senha?</Link>
          </Button>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </Form>
  );
}
import { useEffect, useState } from 'react';
import { HospitalShell } from '@/components/layout/HospitalShell';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { isAxiosError } from 'axios';
import type { MarketplaceHospital } from '@/types/marketplace';

type HospitalMe = {
  name?: string;
  email?: string;
  phone?: string;
  staff_role?: string;
  hospital?: MarketplaceHospital & {
    cnpj?: string | null;
    is_verified?: boolean;
  };
};

const HospitalSettingsPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<HospitalMe | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const me = await api.getHospitalMe();
        setData(me);
        localStorage.setItem('userData', JSON.stringify(me));
      } catch (err: unknown) {
        const message = isAxiosError(err)
          ? (err.response?.data as { message?: string } | undefined)?.message
          : undefined;
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar dados',
          description: message || 'Tente novamente.',
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const hospital = data?.hospital;

  return (
    <HospitalShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Dados do hospital</h1>
          <p className="text-slate-600">
            Informações da instituição vinculadas à sua conta.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Carregando...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Hospital</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600">
                <p>
                  <strong>Nome:</strong> {hospital?.name || '—'}
                </p>
                <p>
                  <strong>Endereço:</strong> {hospital?.address || '—'}
                </p>
                <p>
                  <strong>Cidade:</strong> {hospital?.city || '—'}
                </p>
                <p>
                  <strong>UF:</strong> {hospital?.state || '—'}
                </p>
                <p>
                  <strong>CNPJ:</strong> {hospital?.cnpj || '—'}
                </p>
                <p className="flex items-center gap-2">
                  <strong>Verificado:</strong>
                  <Badge variant="secondary">
                    {hospital?.is_verified ? 'Sim' : 'Pendente'}
                  </Badge>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seu usuário</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600">
                <p>
                  <strong>Nome:</strong> {data?.name || '—'}
                </p>
                <p>
                  <strong>Email:</strong> {data?.email || '—'}
                </p>
                <p>
                  <strong>Telefone:</strong> {data?.phone || '—'}
                </p>
                <p>
                  <strong>Papel:</strong> {data?.staff_role || '—'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </HospitalShell>
  );
};

export default HospitalSettingsPage;

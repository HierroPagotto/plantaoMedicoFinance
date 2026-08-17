import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { isAxiosError } from 'axios';

export type NotificationPreferences = {
  email_enabled: boolean;
  email_shift_tomorrow: boolean;
  email_payment_pending: boolean;
  email_goal_progress: boolean;
  email_schedule_conflict: boolean;
  email_application_approved: boolean;
  email_application_rejected: boolean;
  email_new_application: boolean;
  email_opportunity_filled: boolean;
};

type PrefKey = keyof NotificationPreferences;

type Props = {
  audience: 'doctor' | 'hospital';
};

const DOCTOR_TOGGLES: { key: PrefKey; label: string }[] = [
  { key: 'email_shift_tomorrow', label: 'Plantão amanhã' },
  { key: 'email_payment_pending', label: 'Pagamento pendente' },
  { key: 'email_goal_progress', label: 'Meta mensal (80% / 100%)' },
  { key: 'email_schedule_conflict', label: 'Conflito de plantões' },
  { key: 'email_application_approved', label: 'Candidatura aprovada' },
  { key: 'email_application_rejected', label: 'Candidatura não selecionada' },
];

const HOSPITAL_TOGGLES: { key: PrefKey; label: string }[] = [
  { key: 'email_new_application', label: 'Nova candidatura' },
  { key: 'email_opportunity_filled', label: 'Vaga preenchida' },
];

const defaults: NotificationPreferences = {
  email_enabled: true,
  email_shift_tomorrow: true,
  email_payment_pending: true,
  email_goal_progress: true,
  email_schedule_conflict: true,
  email_application_approved: true,
  email_application_rejected: true,
  email_new_application: true,
  email_opportunity_filled: true,
};

export function NotificationPreferencesCard({ audience }: Props) {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<NotificationPreferences>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getNotificationPreferences();
        setPrefs({ ...defaults, ...data });
      } catch (err: unknown) {
        const message = isAxiosError(err)
          ? (err.response?.data as { message?: string } | undefined)?.message
          : undefined;
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar preferências',
          description: message || 'Tente novamente.',
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const save = async (next: NotificationPreferences) => {
    setSaving(true);
    setPrefs(next);
    try {
      const data = await api.updateNotificationPreferences(next);
      if (data?.preferences) {
        setPrefs({ ...defaults, ...data.preferences });
      }
    } catch (err: unknown) {
      const message = isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined;
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: message || 'Tente novamente.',
      });
    } finally {
      setSaving(false);
    }
  };

  const setField = (key: PrefKey, value: boolean) => {
    const next = { ...prefs, [key]: value };
    void save(next);
  };

  const toggles = audience === 'doctor' ? DOCTOR_TOGGLES : HOSPITAL_TOGGLES;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificações por e-mail</CardTitle>
        <CardDescription>
          O aviso no aplicativo (sino) continua ativo. Aqui você controla apenas o e-mail.
          Recuperação de senha não é afetada.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="email_enabled" className="flex flex-col gap-1">
                <span>Receber notificações por e-mail</span>
                <span className="font-normal text-xs text-muted-foreground">
                  Desliga todos os e-mails de notificação abaixo
                </span>
              </Label>
              <Switch
                id="email_enabled"
                checked={prefs.email_enabled}
                disabled={saving}
                onCheckedChange={(v) => setField('email_enabled', v)}
              />
            </div>

            <div className="space-y-3 border-t pt-4">
              {toggles.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <Label htmlFor={key}>{label}</Label>
                  <Switch
                    id={key}
                    checked={prefs.email_enabled && prefs[key]}
                    disabled={saving || !prefs.email_enabled}
                    onCheckedChange={(v) => setField(key, v)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

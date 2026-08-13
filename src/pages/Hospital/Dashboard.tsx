import { HospitalShell } from '@/components/layout/HospitalShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HospitalDashboard = () => {
  let user: any = {};
  try {
    user = JSON.parse(localStorage.getItem('userData') || '{}');
  } catch {
    user = {};
  }

  return (
    <HospitalShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Olá, {user.name || 'gestor'}</h1>
          <p className="text-slate-600">
            Portal do hospital pronto. O marketplace de plantões chega na próxima fase.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Hospital</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p>
                <strong>Nome:</strong> {user.hospital?.name || '—'}
              </p>
              <p>
                <strong>Cidade:</strong> {user.hospital?.city || '—'}
              </p>
              <p>
                <strong>Seu papel:</strong> {user.staff_role || '—'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximos passos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>Gerencie a equipe agora. Em breve: publicar vagas e aprovar médicos.</p>
              <Button asChild>
                <Link to="/hospital/staff">Gerenciar equipe</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </HospitalShell>
  );
};

export default HospitalDashboard;

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import api from '@/lib/api';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { Hospital as HospitalIcon, MapPin, Calendar } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';

export default function AdminHospitals() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<any | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newHospital, setNewHospital] = useState({ name: '', address: '' });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    api.getAdminHospitals()
      .then(data => {
        setHospitals(data.hospitals || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Erro ao carregar hospitais.');
        setLoading(false);
      });
  }, []);

  const handleDelete = async (hospitalId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este hospital?')) return;
    try {
      await api.deleteAdminHospital(hospitalId);
      setHospitals(hospitals.filter((h: any) => h.id !== hospitalId));
    } catch {
      alert('Erro ao deletar hospital.');
    }
  };

  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHospital.name.trim() || !newHospital.address.trim() || newHospital.address.trim() === 'Endereço não especificado') {
      alert('Preencha todos os campos corretamente.');
      return;
    }
    setIsCreating(true);
    try {
      const created = await api.createHospital({
        name: newHospital.name,
        address: newHospital.address,
        latitude: 0.0,
        longitude: 0.0
      });
      setHospitals([...hospitals, created]);
      setNewHospital({ name: '', address: '' });
    } catch {
      alert('Erro ao criar hospital.');
    } finally {
      setIsCreating(false);
    }
  };

  const openDrawer = (hospital: any) => {
    setSelectedHospital(hospital);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedHospital(null);
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <AppShell>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Novo hospital</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col md:flex-row gap-4 items-end flex-wrap" onSubmit={handleCreateHospital}>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={newHospital.name}
                onChange={e => setNewHospital({ ...newHospital, name: e.target.value })}
                required
                placeholder="Nome do hospital ou clínica"
              />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium mb-1">Endereço</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={newHospital.address}
                onChange={e => setNewHospital({ ...newHospital, address: e.target.value })}
                required
                placeholder="Endereço completo"
              />
            </div>
            <Button type="submit" className="bg-medical-teal text-white hover:bg-medical-accent min-w-[140px]" disabled={isCreating}>
              {isCreating ? 'Cadastrando...' : '+ Cadastrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Hospitais</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="min-w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="text-left px-4 py-2">Nome</th>
                <th className="text-left px-4 py-2">Endereço</th>
                <th className="text-left px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map((hospital: any) => (
                <tr key={hospital.id} className="transition-colors hover:bg-muted/60">
                  <td className="px-4 py-2 align-middle">
                    <div className="flex items-center gap-2">
                      <HospitalIcon className="h-5 w-5 text-medical-teal" />
                      <span>{hospital.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 align-middle">{hospital.address}</td>
                  <td className="px-4 py-2 align-middle">
                    <Button size="sm" variant="outline" onClick={() => openDrawer(hospital)}>
                      Ver detalhes
                    </Button>
                    <Button variant="destructive" size="sm" className="ml-2" onClick={() => handleDelete(hospital.id)}>
                      Deletar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Detalhes do Hospital</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" className="absolute right-4 top-4">Fechar</Button>
            </DrawerClose>
          </DrawerHeader>
          {selectedHospital && (
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-4 mb-4">
                <HospitalIcon className="h-12 w-12 text-medical-teal" />
                <div>
                  <div className="text-xl font-bold">{selectedHospital.name}</div>
                  <div className="text-muted-foreground flex items-center gap-2"><MapPin size={16} /> {selectedHospital.address}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold">ID</div>
                  <div>{selectedHospital.id}</div>
                </div>
                <div>
                  <div className="font-semibold">Latitude</div>
                  <div>{selectedHospital.latitude}</div>
                </div>
                <div>
                  <div className="font-semibold">Longitude</div>
                  <div>{selectedHospital.longitude}</div>
                </div>
                <div>
                  <div className="font-semibold">Criado em</div>
                  <div className="flex items-center gap-2"><Calendar size={16} /> {selectedHospital.created_at}</div>
                </div>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </AppShell>
  );
} 
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import api from '@/lib/api';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, User, Shield } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    api.getAdminUsers()
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Erro ao carregar usuários.');
        setLoading(false);
      });
  }, []);

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este usuário?')) return;
    try {
      await api.deleteAdminUser(Number(userId));
      setUsers(users.filter((u: any) => u.id !== userId));
    } catch {
      alert('Erro ao deletar usuário.');
    }
  };

  const openDrawer = (user: any) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedUser(null);
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="min-w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="text-left px-4 py-2">Nome</th>
                <th className="text-left px-4 py-2">Email</th>
                <th className="text-left px-4 py-2">Admin</th>
                <th className="text-left px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any, idx: number) => (
                <tr key={user.id} className="transition-colors hover:bg-muted/60">
                  <td className="px-4 py-2 align-middle">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        {user.photo_url ? (
                          <AvatarImage src={user.photo_url} alt={user.name} />
                        ) : (
                          <AvatarFallback>{user.name?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        )}
                      </Avatar>
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 align-middle">{user.email}</td>
                  <td className="px-4 py-2 align-middle">{user.is_admin ? <Badge variant="outline" className="text-green-700 border-green-400 bg-green-50 flex items-center gap-1"><Shield size={14}/> Admin</Badge> : '-'}</td>
                  <td className="px-4 py-2 align-middle">
                    <Button size="sm" variant="outline" onClick={() => openDrawer(user)}>
                      Ver detalhes
                    </Button>
                    <Button variant="destructive" size="sm" className="ml-2" onClick={() => handleDelete(user.id)}>
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
            <DrawerTitle>Detalhes do Usuário</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" className="absolute right-4 top-4">Fechar</Button>
            </DrawerClose>
          </DrawerHeader>
          {selectedUser && (
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  {selectedUser.photo_url ? (
                    <AvatarImage src={selectedUser.photo_url} alt={selectedUser.name} />
                  ) : (
                    <AvatarFallback>{selectedUser.name?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <div className="text-xl font-bold">{selectedUser.name}</div>
                  <div className="text-muted-foreground">{selectedUser.email}</div>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{selectedUser.main_specialty}</Badge>
                    {selectedUser.is_admin && <Badge variant="outline" className="text-green-700 border-green-400 bg-green-50 flex items-center gap-1"><Shield size={14}/> Admin</Badge>}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold">CRM</div>
                  <div>{selectedUser.crm} / {selectedUser.crm_state || 'UF'}</div>
                </div>
                <div>
                  <div className="font-semibold">Telefone</div>
                  <div>{selectedUser.phone || '-'}</div>
                </div>
                <div>
                  <div className="font-semibold">Cidade</div>
                  <div>{selectedUser.city || '-'}</div>
                </div>
                <div>
                  <div className="font-semibold">Estado</div>
                  <div>{selectedUser.state || '-'}</div>
                </div>
                <div>
                  <div className="font-semibold">Ano de graduação</div>
                  <div>{selectedUser.graduation_year || '-'}</div>
                </div>
                <div>
                  <div className="font-semibold">Especialidade principal</div>
                  <div>{selectedUser.main_specialty || '-'}</div>
                </div>
                <div>
                  <div className="font-semibold">Procedimentos</div>
                  <div>{selectedUser.procedures || '-'}</div>
                </div>
                <div>
                  <div className="font-semibold">Aceita nota fiscal?</div>
                  <div>{selectedUser.provides_invoice ? 'Sim' : 'Não'}</div>
                </div>
                <div>
                  <div className="font-semibold">Admin</div>
                  <div>{selectedUser.is_admin ? 'Sim' : 'Não'}</div>
                </div>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </AppShell>
  );
} 
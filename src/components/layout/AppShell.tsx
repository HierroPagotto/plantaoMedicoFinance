import { useEffect, useState } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarInset,
  SidebarSeparator
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Home, Calendar, DollarSign, History, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import Header from './Header';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const [user, setUser] = useState<{ name: string; specialty: string; photo_url?: string; is_admin?: boolean }>({
    name: 'Carregando...',
    specialty: '...',
    photo_url: undefined,
    is_admin: false
  });

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser({
          name: parsed.name || 'Desconhecido(a)',
          specialty: parsed.main_specialty || '...',
          photo_url: parsed.photo_url || undefined,
          is_admin: parsed.is_admin || false
        });
      } catch {
        console.error('Erro ao carregar os dados do usuário');
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Plantões', href: '/shifts', icon: Calendar },
    { name: 'Financeiro', href: '/finance', icon: DollarSign },
    { name: 'Histórico', href: '/history', icon: History },
    { name: 'Configurações', href: '/settings', icon: Settings },
    { name: 'Perfil Médico', href: '/doctor-profile', icon: User },
    ...(user.is_admin ? [
      { name: 'Admin: Usuários', href: '/admin/users', icon: User },
      { name: 'Admin: Hospitais', href: '/admin/hospitals', icon: Home }
    ] : [])
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="flex h-screen w-screen bg-background">
        <Sidebar className="md:block">
          <SidebarHeader className="border-b border-border p-0 h-28 flex items-center justify-center">
            <Link to="/dashboard" className="flex items-center w-full justify-center">
              <img
                src="/Logo.png"
                alt="MedSinc Logo"
                className="h-24 w-auto max-w-[80%] object-contain mx-auto"
              />
            </Link>
          </SidebarHeader>

          <SidebarHeader className="border-b border-border">
            <div className="flex items-center p-2">
              <Link to="/doctor-profile" className="flex items-center w-full">
                <Avatar className="h-10 w-10">
                  {user.photo_url ? (
                    <AvatarImage src={user.photo_url} alt={user.name} />
                  ) : (
                    <AvatarFallback>{user.name.split(' ').map(name => name[0]).join('')}</AvatarFallback>
                  )}
                </Avatar>
                <div className="ml-3 overflow-hidden">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.specialty}</p>
                </div>
              </Link>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start mt-2 text-muted-foreground hover:text-foreground"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 mr-2" />
              ) : (
                <Moon className="h-5 w-5 mr-2" />
              )}
              <span>{theme === 'dark' ? 'Modo claro' : 'Modo escuro'}</span>
            </Button>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {links.map((link) => {
                const LinkIcon = link.icon;
                return (
                  <SidebarMenuItem key={link.name}>
                    <SidebarMenuButton asChild tooltip={link.name} isActive={isActive(link.href)}>
                      <Link to={link.href}>
                        <LinkIcon className="h-5 w-5" />
                        <span>{link.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link to="/logout">
                <LogOut className="h-5 w-5 mr-3" />
                <span>Sair</span>
              </Link>
            </Button>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

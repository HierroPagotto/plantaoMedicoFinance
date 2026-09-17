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
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Home, Calendar, DollarSign, History, Settings, LogOut, Moon, Sun, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import Header from './Header';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
          specialty:
            (Array.isArray(parsed.specialties) && parsed.specialties.length
              ? parsed.specialties.join(', ')
              : parsed.main_specialty) || '...',
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
    { name: 'Marketplace', href: '/marketplace', icon: Store },
    { name: 'Plantões', href: '/shifts', icon: Calendar },
    { name: 'Financeiro', href: '/finance', icon: DollarSign },
    { name: 'Histórico', href: '/history', icon: History },
    { name: 'Configurações', href: '/settings', icon: Settings },
    { name: 'Perfil', href: '/doctor-profile', icon: User },
    ...(user.is_admin ? [
      { name: 'Admin: Usuários', href: '/admin/users', icon: User },
      { name: 'Admin: Hospitais', href: '/admin/hospitals', icon: Home },
      { name: 'Admin: Marketplace', href: '/admin/opportunities', icon: Store },
    ] : [])
  ];

  const isActive = (path: string) => {
    if (path === '/marketplace') {
      return location.pathname === path || location.pathname.startsWith('/marketplace/');
    }
    return location.pathname === path;
  };

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen} defaultOpen={false}>
      <div className="flex h-screen w-screen bg-background">
        <Sidebar collapsible="icon" className="md:block">
          <SidebarHeader className="border-b border-border p-0 h-28 flex items-center justify-center group-data-[collapsible=icon]:h-14">
            <Link to="/dashboard" className="flex items-center w-full justify-center p-2">
              <img
                src="/Logo.png"
                alt="MedSinc Logo"
                className="h-24 w-auto max-w-[80%] object-contain mx-auto group-data-[collapsible=icon]:h-8"
              />
            </Link>
          </SidebarHeader>

          <SidebarHeader className="border-b border-border">
            <div className="flex items-center p-2 group-data-[collapsible=icon]:justify-center">
              <Link
                to="/doctor-profile"
                className="flex items-center w-full group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center"
              >
                <Avatar className="h-10 w-10 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
                  {user.photo_url ? (
                    <AvatarImage src={user.photo_url} alt={user.name} />
                  ) : (
                    <AvatarFallback>
                      {(user.name || '?')
                        .split(' ')
                        .filter(Boolean)
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() || '?'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="ml-3 overflow-hidden group-data-[collapsible=icon]:hidden">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.specialty}</p>
                </div>
              </Link>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start mt-2 text-muted-foreground hover:text-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 mr-2 group-data-[collapsible=icon]:mr-0" />
              ) : (
                <Moon className="h-5 w-5 mr-2 group-data-[collapsible=icon]:mr-0" />
              )}
              <span className="group-data-[collapsible=icon]:hidden">
                {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              </span>
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
              className="w-full justify-start text-muted-foreground hover:text-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
              asChild
            >
              <Link to="/logout" title="Sair">
                <LogOut className="h-5 w-5 mr-3 group-data-[collapsible=icon]:mr-0" />
                <span className="group-data-[collapsible=icon]:hidden">Sair</span>
              </Link>
            </Button>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <Header />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

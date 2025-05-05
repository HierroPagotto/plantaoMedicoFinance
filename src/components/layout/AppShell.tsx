
import { useState } from 'react';
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
  SidebarInset
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Home, Calendar, DollarSign, History, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import Header from './Header';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  
  // Mock user data
  const [user] = useState({
    name: 'Dr. João Silva',
    specialty: 'Cardiologia'
  });
  
  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Plantões', href: '/shifts', icon: Calendar },
    { name: 'Financeiro', href: '/finance', icon: DollarSign },
    { name: 'Histórico', href: '/history', icon: History },
    { name: 'Configurações', href: '/settings', icon: Settings },
    { name: 'Perfil Médico', href: '/doctor-profile', icon: User }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <Sidebar>
          <SidebarHeader className="border-b border-border">
            <div className="flex items-center p-2">
              {sidebarOpen ? (
                <div className="flex items-center justify-center w-full">
                  <Link to="/dashboard" className="flex items-center">
                    <img 
                      src="/lovable-uploads/680739ca-789e-4353-bfb4-973cfc120e15.png" 
                      alt="MedSinc Logo" 
                      className="h-10 w-auto object-contain" 
                    />
                    <h1 className="font-bold text-xl text-medical-teal ml-2">MedSinc</h1>
                  </Link>
                </div>
              ) : (
                <div className="w-10 h-10 flex items-center justify-center">
                  <img 
                    src="/lovable-uploads/680739ca-789e-4353-bfb4-973cfc120e15.png" 
                    alt="MedSinc Logo" 
                    className="h-8 w-auto object-contain"
                  />
                </div>
              )}
            </div>
          </SidebarHeader>

          <SidebarHeader className="border-b border-border">
            <div className="flex items-center p-2">
              <Link to="/doctor-profile" className="flex items-center w-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{user.name.split(' ').map(name => name[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="ml-3 overflow-hidden">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.specialty}</p>
                </div>
              </Link>
            </div>
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
              <Link to="/login">
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

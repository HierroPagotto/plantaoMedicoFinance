import { Home, Calendar, DollarSign, History, ChevronLeft, LogOut, Settings, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface AppSidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppSidebar = ({ isOpen, setIsOpen }: AppSidebarProps) => {
  const location = useLocation();
  const [user] = useState({
    name: 'Dr. João Silva',
    specialty: 'Cardiologia'
  });

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

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
    { name: 'Configurações', href: '/settings', icon: Settings }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside 
      className={cn(
        "flex flex-col bg-card border-r border-border transition-all duration-300",
        isOpen ? "w-64" : "w-20"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className={cn("flex items-center overflow-hidden", !isOpen && "justify-center w-full")}>
          {isOpen ? (
            <div>
              <h1 className="font-bold text-xl text-medical-blue">Plantão Médico</h1>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-medical-blue flex items-center justify-center">
              <span className="text-white font-bold text-lg">PM</span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={cn("text-muted-foreground", !isOpen && "hidden")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="border-b border-border p-4">
        <div className={cn("flex items-center", !isOpen && "justify-center")}>
          <div className="w-10 h-10 rounded-full bg-medical-purple flex items-center justify-center">
            <span className="text-white font-bold">
              {(user.name || '?')
                .split(' ')
                .filter(Boolean)
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || '?'}
            </span>
          </div>
          {isOpen && (
            <div className="ml-3 overflow-hidden">
              <p className="font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.specialty}</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 pt-4">
        <ul className="space-y-1 px-2">
          {links.map((link) => {
            const LinkIcon = link.icon;
            return (
              <li key={link.name}>
                <Link
                  to={link.href}
                  className={cn(
                    "flex items-center p-3 rounded-md transition-colors",
                    isActive(link.href) 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "hover:bg-muted",
                    !isOpen && "justify-center"
                  )}
                >
                  <LinkIcon className={cn("h-5 w-5", isOpen && "mr-3")} />
                  {isOpen && <span>{link.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 mt-auto border-t border-border flex flex-col gap-2">
        <Button
          variant="ghost"
          className={cn("w-full justify-start text-muted-foreground hover:text-foreground", !isOpen && "justify-center")}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <Sun className={cn("h-5 w-5", isOpen && "mr-3")}/>
          ) : (
            <Moon className={cn("h-5 w-5", isOpen && "mr-3")}/>
          )}
          {isOpen && <span>{theme === 'dark' ? 'Modo claro' : 'Modo escuro'}</span>}
        </Button>
        <Button
          variant="ghost"
          className={cn("w-full justify-start text-muted-foreground hover:text-foreground", !isOpen && "justify-center")}
        >
          <LogOut className={cn("h-5 w-5", isOpen && "mr-3")} />
          {isOpen && <span>Sair</span>}
        </Button>
      </div>
    </aside>
  );
};

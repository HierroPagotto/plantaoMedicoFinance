import { useEffect, useState } from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/NotificationBell';

const Header = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 sticky top-0 z-10">
      <SidebarTrigger variant="ghost" size="icon" className="shrink-0">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Abrir ou fechar menu</span>
      </SidebarTrigger>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span className="sr-only">
            {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          </span>
        </Button>
        <NotificationBell />
      </div>
    </header>
  );
};

export default Header;

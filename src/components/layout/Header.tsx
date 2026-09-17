import { Menu } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { NotificationBell } from '@/components/notifications/NotificationBell';

const Header = () => {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 sticky top-0 z-10">
      <SidebarTrigger variant="ghost" size="icon" className="shrink-0">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Abrir ou fechar menu</span>
      </SidebarTrigger>
      <NotificationBell />
    </header>
  );
};

export default Header;

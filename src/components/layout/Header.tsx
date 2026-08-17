
import { Menu } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header = ({ sidebarOpen: _sidebarOpen, setSidebarOpen: _setSidebarOpen }: HeaderProps) => {
  return (
    <header className="block md:hidden bg-card border-b border-border h-16 flex items-center justify-between px-4 sticky top-0 z-10">
      <SidebarTrigger
        variant="ghost"
        size="icon"
        className="mr-4"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </SidebarTrigger>
      <NotificationBell />
    </header>
  );
};

export default Header;

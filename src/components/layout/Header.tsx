
import { Bell, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  return (
    <header className="block md:hidden bg-card border-b border-border h-16 flex items-center px-4 sticky top-0 z-10">
      {/* MOBILE ONLY!!! */}
      <SidebarTrigger
        variant="ghost"
        size="icon"
        className="mr-4"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </SidebarTrigger>
    </header>
  );
};

export default Header;

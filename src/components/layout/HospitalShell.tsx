import { Link, useLocation } from 'react-router-dom';
import { Building2, LogOut, Users, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

type HospitalShellProps = {
  children: React.ReactNode;
};

function readUser() {
  try {
    const raw = localStorage.getItem('userData');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function HospitalShell({ children }: HospitalShellProps) {
  const location = useLocation();
  const user = readUser();
  const hospitalName = user.hospital?.name || 'Hospital';

  const links = [
    { name: 'Início', href: '/hospital', icon: LayoutDashboard },
    { name: 'Equipe', href: '/hospital/staff', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-teal-700" />
            <div>
              <p className="text-sm text-slate-500">Portal Hospitalar</p>
              <p className="font-semibold">{hospitalName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">
              {user.name}
              {user.staff_role ? ` · ${user.staff_role}` : ''}
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link to="/logout">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Link>
            </Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 px-4 pb-3">
          {links.map((link) => {
            const active = location.pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm ${active
                  ? 'bg-teal-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export type AppNotification = {
  id: number;
  type: string;
  title: string;
  body: string;
  data?: {
    href?: string;
    opportunity_id?: number;
    shift_id?: number;
    [key: string]: unknown;
  };
  is_read: boolean;
  created_at?: string | null;
};

function hrefFor(n: AppNotification): string | null {
  const href = n.data?.href;
  if (typeof href === 'string' && href.startsWith('/')) return href;
  if (n.data?.opportunity_id && n.type === 'new_application') {
    return `/hospital/opportunities/${n.data.opportunity_id}`;
  }
  return null;
}

function formatWhen(iso?: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

type NotificationBellProps = {
  className?: string;
  variant?: 'default' | 'hospital';
};

export function NotificationBell({
  className,
  variant = 'default',
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.listNotifications({ page: 1, per_page: 15 });
      setItems(data.notifications || []);
      setUnread(data.unread_count ?? 0);
    } catch {
      // silencioso: sino não deve quebrar o shell
    }
  }, []);

  useEffect(() => {
    load();
    const id = window.setInterval(load, 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      load().finally(() => setLoading(false));
    }
  }, [open, load]);

  const onOpenItem = async (n: AppNotification) => {
    if (!n.is_read) {
      try {
        await api.markNotificationRead(n.id);
        setItems((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x))
        );
        setUnread((c) => Math.max(0, c - 1));
      } catch {
        /* ignore */
      }
    }
    setOpen(false);
  };

  const markAll = async () => {
    try {
      await api.markAllNotificationsRead();
      setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
      setUnread(0);
    } catch {
      /* ignore */
    }
  };

  const triggerClass =
    variant === 'hospital'
      ? 'relative h-9 w-9 text-slate-700'
      : 'relative h-9 w-9';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={cn(triggerClass, className)}>
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 sm:w-96">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <p className="text-sm font-semibold">Notificações</p>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAll}>
              Marcar todas
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {loading && items.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Carregando...</p>
          ) : items.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Nenhuma notificação.</p>
          ) : (
            <ul className="divide-y">
              {items.map((n) => {
                const href = hrefFor(n);
                const content = (
                  <div
                    className={cn(
                      'px-3 py-3 text-left transition-colors hover:bg-muted/60',
                      !n.is_read && 'bg-sky-50/80 dark:bg-sky-950/30'
                    )}
                  >
                    <p className="text-sm font-medium leading-snug">{n.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
                      {n.body}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {formatWhen(n.created_at)}
                    </p>
                  </div>
                );
                return (
                  <li key={n.id}>
                    {href ? (
                      <Link to={href} onClick={() => onOpenItem(n)} className="block">
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="w-full"
                        onClick={() => onOpenItem(n)}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

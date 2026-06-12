import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useLayout } from '../../context/LayoutContext';
import client from '../../api/client';
import type { ExchangeRequest } from '../../types';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/patients': 'Patients',
  '/records': 'Records',
  '/exchange': 'Exchange',
  '/encryption': 'Encryption',
  '/audit': 'Audit Trail',
  '/users': 'Users',
  '/settings': 'Settings',
  '/timeline': 'Timeline',
  '/ai-health': 'AI Health Guide',
};

export function Header() {
  const { pathname } = useLocation();
  const { user } = useAuthStore();
  const { openSidebar } = useLayout();
  const [pending, setPending] = useState(0);

  useEffect(() => {
    client.get<ExchangeRequest[]>('/exchange')
      .then(r => setPending((r.data ?? []).filter(x => x.status === 'pending').length))
      .catch(() => {});
  }, [pathname]);

  const base = '/' + pathname.split('/')[1];
  const title = PAGE_TITLES[base] ?? 'CareNexus';

  return (
    <header className="app-header fixed top-0 left-0 right-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur-md pt-[env(safe-area-inset-top)] md:left-64">
      <div className="flex h-14 md:h-[4.5rem] items-center justify-between gap-3 px-4 md:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={openSidebar}
            className="touch-target flex-shrink-0 rounded-xl p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 md:text-xl">{title}</h1>
            <p className="hidden text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:block">
              Health Information System
            </p>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-3 md:gap-6">
          <div className="relative cursor-pointer touch-target">
            <div className="rounded-xl bg-slate-50 p-2 transition-colors hover:bg-slate-100">
              <Bell size={20} className="text-slate-500" />
            </div>
            {pending > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-lg border-2 border-white bg-primary-600 text-[10px] font-bold text-white shadow-sm">
                {pending > 9 ? '9+' : pending}
              </span>
            )}
          </div>
          <div className="hidden items-center gap-3 border-l border-slate-100 pl-4 sm:flex">
            <div className="hidden text-right md:block">
              <p className="text-sm font-bold leading-none text-slate-900">{user?.name}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-tighter text-primary-600 opacity-80">{user?.role}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
              <span className="text-xs font-bold text-slate-500">{(user?.name ?? 'U')[0]}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

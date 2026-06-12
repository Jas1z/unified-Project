import { NavLink, useNavigate } from 'react-router-dom';
import { Shield, LogOut, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { roleBadge } from '../ui/Badge';
import client from '../../api/client';
import { useLayout } from '../../context/LayoutContext';
import { navForRole } from './navConfig';

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { sidebarOpen, closeSidebar, isMobile } = useLayout();

  const handleLogout = async () => {
    try { await client.post('/auth/logout'); } catch { /* ignore */ }
    logout();
    navigate('/login');
  };

  const visible = navForRole(user?.role);
  const initials = (user?.name ?? 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const onNav = () => {
    if (isMobile) closeSidebar();
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-[min(280px,88vw)] flex-col border-r border-brand-800 bg-brand-900 select-none transition-transform duration-300 ease-out md:z-30 md:w-64 md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      aria-hidden={isMobile && !sidebarOpen}
    >
      <div className="flex items-center justify-between gap-3 px-5 py-6 md:px-6 md:py-8">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 bg-primary-600 rounded-xl shadow-lg shadow-primary-600/20 flex-shrink-0">
            <Shield size={20} className="text-white" />
          </div>
          <div className="leading-tight min-w-0">
            <p className="text-brand-400 text-[10px] uppercase tracking-widest font-semibold truncate">CareNexus</p>
            <p className="text-white font-bold text-sm tracking-tight truncate">EHR Platform</p>
          </div>
        </div>
        <button
          type="button"
          onClick={closeSidebar}
          className="touch-target p-2 rounded-xl text-brand-400 hover:text-white hover:bg-brand-800 md:hidden"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto overscroll-contain md:px-4">
        {visible.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNav}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all group touch-target ${
                isActive
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-900/20'
                  : 'text-brand-400 hover:text-white hover:bg-brand-800'
              }`
            }
          >
            <Icon size={18} className="flex-shrink-0 transition-transform group-hover:scale-110" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 bg-brand-950/50 border-t border-brand-800 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-inner">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-semibold truncate leading-none">{user?.name}</p>
            <div className="mt-1.5 transform scale-90 origin-left opacity-90">
              {user && roleBadge(user.role)}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl text-brand-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-medium border border-transparent hover:border-red-500/20 touch-target"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

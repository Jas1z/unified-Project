import { NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useLayout } from '../../context/LayoutContext';
import { bottomNavForRole } from './navConfig';

export function BottomNav() {
  const { user } = useAuthStore();
  const { openSidebar } = useLayout();
  const items = bottomNavForRole(user?.role);

  if (items.length === 0) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Primary navigation"
    >
      <div className="flex items-stretch justify-around px-1 pt-1">
        {items.map(({ to, shortLabel, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 px-1 text-[10px] font-bold uppercase tracking-tight transition-colors touch-target ${
                isActive ? 'text-primary-600' : 'text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="truncate w-full text-center">{shortLabel ?? label}</span>
              </>
            )}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={openSidebar}
          className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 px-1 text-[10px] font-bold uppercase tracking-tight text-slate-400 touch-target"
          aria-label="Open full menu"
        >
          <Menu size={20} />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
}

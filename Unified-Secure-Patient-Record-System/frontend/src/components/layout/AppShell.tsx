import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useLayout } from '../../context/LayoutContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { AiAssistantFab } from '../ai/AiAssistantFab';

export function AppShell() {
  const { pathname } = useLocation();
  const { sidebarOpen, closeSidebar, isMobile } = useLayout();

  useEffect(() => {
    if (isMobile) closeSidebar();
  }, [pathname, isMobile, closeSidebar]);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50 overflow-x-hidden">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-[2px] md:hidden"
          onClick={closeSidebar}
        />
      )}

      <Sidebar />

      <div className="flex min-h-screen min-h-[100dvh] flex-col md:ml-64">
        <Header />
        <main className="main-content flex-1">
          <div className="page-container">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomNav />
      <AiAssistantFab />
    </div>
  );
}

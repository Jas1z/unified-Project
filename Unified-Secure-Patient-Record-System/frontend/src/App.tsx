import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LayoutProvider } from './context/LayoutContext';
import { AppShell } from './components/layout/AppShell';

import Login         from './pages/Login';
import Dashboard     from './pages/Dashboard';
import Patients      from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import Records       from './pages/Records';
import EncryptionLab from './pages/EncryptionLab';
import AuditTrail    from './pages/AuditTrail';
import UserManagement from './pages/UserManagement';
import Exchange      from './pages/Exchange';
import Settings      from './pages/Settings';
import Timeline      from './pages/Timeline';
import AiHealthExplanation from './pages/AiHealthExplanation';
import { useAuthStore } from './store/authStore';

function Layout() {
  return (
    <LayoutProvider>
      <AppShell />
    </LayoutProvider>
  );
}

function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function AdminRoute() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export default function App() {
  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"  element={<Dashboard />} />
            <Route path="/patients"   element={<Patients />} />
            <Route path="/patients/:id" element={<PatientDetail />} />
            <Route path="/records"    element={<Records />} />
            <Route path="/timeline"   element={<Timeline />} />
            <Route path="/exchange"   element={<Exchange />} />
            <Route path="/encryption" element={<EncryptionLab />} />
            <Route path="/settings"   element={<Settings />} />
            <Route path="/ai-health"  element={<AiHealthExplanation />} />

            <Route element={<AdminRoute />}>
              <Route path="/audit"    element={<AuditTrail />} />
              <Route path="/users"    element={<UserManagement />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

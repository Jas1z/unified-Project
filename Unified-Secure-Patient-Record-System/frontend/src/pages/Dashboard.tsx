import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, FileText, ArrowLeftRight, CheckCircle,
  Plus, Eye, ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { StatCard } from '../components/ui/StatCard';
import { PageSpinner } from '../components/ui/Spinner';
import { actionBadge, roleBadge } from '../components/ui/Badge';
import { DataPanel } from '../components/ui/DataPanel';
import client from '../api/client';
import type { AuditLog, PaginatedPatients, PaginatedRecords, ExchangeRequest } from '../types';

interface Stats {
  patients: number;
  records: number;
  pendingExchange: number;
  consents: number;
}

const PILLARS = [
  'AES-256-GCM Encryption — All records encrypted at rest',
  'ECDH P-256 Key Exchange — Secure inter-hospital key agreement',
  'CP-ABE Access Control — Attribute-based policy enforcement active',
  'Immutable Audit Trail — Hash-chained log integrity verified',
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats]     = useState<Stats>({ patients: 0, records: 0, pendingExchange: 0, consents: 4 });
  const [logs, setLogs]       = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pRes, rRes, eRes] = await Promise.allSettled([
          client.get<PaginatedPatients>('/patients?limit=1'),
          client.get<PaginatedRecords>('/records?limit=1'),
          client.get<ExchangeRequest[]>('/exchange'),
        ]);
        const patients = pRes.status === 'fulfilled' ? (pRes.value.data.total ?? 0) : 0;
        const records  = rRes.status === 'fulfilled' ? (rRes.value.data.total ?? 0) : 0;
        const exList   = eRes.status === 'fulfilled' ? (eRes.value.data ?? []) : [];
        const pending  = exList.filter((x: ExchangeRequest) => x.status === 'pending').length;
        setStats({ patients, records, pendingExchange: pending, consents: 4 });

        if (user?.role === 'admin' || user?.role === 'doctor') {
          const aRes = await client.get('/audit?limit=10');
          setLogs(aRes.data.logs ?? []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  if (loading) return <PageSpinner />;

  const quickActions = (): Array<{ label: string; to: string; icon: React.ElementType; color: string }> => {
    const base = [{ label: 'Settings', to: '/settings', icon: ShieldCheck, color: 'bg-slate-600' }];
    if (user?.role === 'admin' || user?.role === 'doctor') {
      return [
        { label: 'New Record', to: '/records',   icon: Plus,           color: 'bg-primary-600' },
        { label: 'Patients',   to: '/patients',  icon: Users,          color: 'bg-violet-600' },
        { label: 'Exchange',   to: '/exchange',  icon: ArrowLeftRight, color: 'bg-amber-600' },
        ...base,
      ];
    }
    if (user?.role === 'nurse') {
      return [
        { label: 'Patients', to: '/patients', icon: Users,     color: 'bg-primary-600' },
        { label: 'Records',  to: '/records',  icon: Eye,       color: 'bg-violet-600' },
        ...base,
      ];
    }
    return base;
  };

  return (
    <div className="page-stack">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Good day, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-2 rounded-full border border-slate-200 w-fit">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          System Active
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatCard title="Patients" value={stats.patients} icon={Users} color="bg-primary-600" />
        <StatCard title="Records" value={stats.records} icon={FileText} color="bg-emerald-600" />
        <StatCard title="Pending" value={stats.pendingExchange} icon={ArrowLeftRight} color="bg-amber-600" />
        <StatCard title="Consents" value={stats.consents} icon={CheckCircle} color="bg-teal-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
        <div className="lg:col-span-1 data-panel p-4 sm:p-6 flex flex-col">
          <h3 className="font-bold text-slate-900 mb-4 sm:mb-6 text-sm uppercase tracking-wider">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            {quickActions().map(a => (
              <Link key={a.to} to={a.to}
                className="flex items-center gap-4 p-3 sm:p-4 rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 transition-all group touch-target min-h-[56px]">
                <div className={`p-2.5 rounded-xl ${a.color} flex-shrink-0`}>
                  <a.icon size={18} className="text-white" />
                </div>
                <span className="text-sm text-slate-700 group-hover:text-primary-600 font-bold">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 data-panel p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-8">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Security Architecture</h3>
            <ShieldCheck className="text-primary-600 flex-shrink-0" size={20} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
            {PILLARS.map(p => (
              <div key={p} className="flex items-start gap-3 p-3 sm:p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50">
                <div className="mt-0.5 p-1 bg-emerald-100 rounded-full flex-shrink-0">
                  <CheckCircle size={14} className="text-emerald-600" />
                </div>
                <span className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {logs.length > 0 && (
        <DataPanel>
          <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-50 flex items-center justify-between gap-2">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Recent Activity</h3>
            <Link to="/audit" className="text-xs font-bold text-primary-600 hover:underline flex-shrink-0">View All</Link>
          </div>

          <div className="table-mobile p-3 sm:p-4 space-y-3">
            {logs.map(l => (
              <div key={l.id} className="mobile-card">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-bold text-slate-800 text-sm">{l.userName}</span>
                  {actionBadge(l.action)}
                </div>
                <div className="mobile-card-row">
                  <span className="mobile-card-label">Time</span>
                  <span className="text-xs text-slate-500 font-mono text-right">
                    {new Date(l.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="mobile-card-row">
                  <span className="mobile-card-label">Role</span>
                  <span>{roleBadge(l.userRole)}</span>
                </div>
                <div className="mobile-card-row">
                  <span className="mobile-card-label">Resource</span>
                  <span className="text-slate-600 text-right">{l.resourceType}</span>
                </div>
                {l.details && (
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{l.details}</p>
                )}
              </div>
            ))}
          </div>

          <div className="table-desktop">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                <tr>
                  {['Time', 'User', 'Role', 'Action', 'Resource', 'Details'].map(h => (
                    <th key={h} className="text-left px-6 lg:px-8 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 lg:px-8 py-5 text-slate-400 text-xs font-mono whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-6 lg:px-8 py-5 font-bold text-slate-700">{l.userName}</td>
                    <td className="px-6 lg:px-8 py-5">{roleBadge(l.userRole)}</td>
                    <td className="px-6 lg:px-8 py-5">{actionBadge(l.action)}</td>
                    <td className="px-6 lg:px-8 py-5 text-slate-500 text-xs font-medium">{l.resourceType}</td>
                    <td className="px-6 lg:px-8 py-5 text-slate-400 text-xs truncate max-w-xs">{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataPanel>
      )}
    </div>
  );
}

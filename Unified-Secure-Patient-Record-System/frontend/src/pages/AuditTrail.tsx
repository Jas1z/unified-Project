import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Download, ShieldOff, Lock } from 'lucide-react';
import { actionBadge, roleBadge } from '../components/ui/Badge';
import { PageSpinner, InlineSpinner } from '../components/ui/Spinner';
import { DataPanel, DataPanelEmpty } from '../components/ui/DataPanel';
import { TablePagination } from '../components/ui/TablePagination';
import client from '../api/client';
import type { AuditLog, PaginatedAudit, AuditVerifyResult, Hospital } from '../types';

const ACTIONS = ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'SHARE', 'EXPORT', 'LOGIN', 'LOGOUT', 'ACCESS_DENIED'];

export default function AuditTrail() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  const [verifyRes, setVerifyRes] = useState<AuditVerifyResult | null>(null);
  const [verifying, setVerifying] = useState(false);

  const LIMIT = 20;

  useEffect(() => {
    client.get<Hospital[]>('/hospitals').then(r => setHospitals(r.data ?? [])).catch(() => {});
  }, []);

  const load = useCallback(async (a: string, df: string, dt: string, p: number) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: p, limit: LIMIT };
      if (a) params.action = a;
      if (df) params.date_from = new Date(df).toISOString();
      if (dt) {
        const end = new Date(dt); end.setHours(23,59,59);
        params.date_to = end.toISOString();
      }
      const { data } = await client.get<PaginatedAudit>('/audit', { params });
      setLogs(data.logs ?? []);
      setTotal(data.total ?? 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(actionFilter, dateFrom, dateTo, page); }, [page, actionFilter, dateFrom, dateTo, load]);

  const runVerify = async () => {
    setVerifying(true); setVerifyRes(null);
    try {
      const { data } = await client.get<AuditVerifyResult>('/audit/verify');
      setVerifyRes(data);
    } finally { setVerifying(false); }
  };

  const exportCsv = () => {
    if (logs.length === 0) return;
    const header = ['Timestamp', 'User Name', 'Role', 'Action', 'Resource Type', 'Resource ID', 'Hospital', 'IP Address', 'Hash', 'Details'].join(',');
    const rows = logs.map(l => 
      [
        l.timestamp, `"${l.userName}"`, l.userRole, l.action, l.resourceType, l.resourceId, 
        hospitals.find(h => h.id === l.hospitalId)?.name ?? l.hospitalId,
        l.ipAddress, l.hash, `"${l.details.replace(/"/g, '""')}"`
      ].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `audit_trail_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hospName = (id: string) => hospitals.find(h => h.id === id)?.name ?? id;

  return (
    <div className="page-stack">
      {/* Verify Banner */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Lock size={18} className="text-gray-500"/> Hash Chain Integrity
          </h3>
          <p className="text-sm text-gray-500 mt-1">Verify that no past records have been altered or deleted.</p>
        </div>
        <button onClick={runVerify} disabled={verifying}
          className="flex-shrink-0 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
          {verifying ? <InlineSpinner /> : <ShieldCheck size={16}/>} Verify Full Chain
        </button>
      </div>

      {verifyRes && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border ${verifyRes.intact ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {verifyRes.intact ? <ShieldCheck size={24} className="flex-shrink-0" /> : <ShieldOff size={24} className="flex-shrink-0" />}
          <div>
            <h4 className="font-bold">{verifyRes.intact ? 'Chain Intact' : 'Tampering Detected'}</h4>
            <p className="text-sm mt-0.5 opacity-90">
              {verifyRes.intact 
                ? `All ${verifyRes.total} entries successfully verified against their cryptographic hashes.`
                : `Chain is broken at entry ${verifyRes.brokenAt}. ${verifyRes.failed} entries failed validation.`}
            </p>
          </div>
        </div>
      )}

      <div className="toolbar-panel">
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}
          className="input-mobile sm:max-w-[200px]">
          <option value="">All Actions</option>
          {ACTIONS.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
        </select>
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full sm:w-auto">
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} className="input-mobile flex-1 min-w-0" />
          <span className="text-gray-400 text-sm text-center xs:inline hidden xs:block">to</span>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} className="input-mobile flex-1 min-w-0" />
        </div>
        <button type="button" onClick={exportCsv} disabled={logs.length===0} className="touch-target flex items-center justify-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 w-full sm:w-auto sm:ml-auto">
          <Download size={15}/> Export CSV
        </button>
      </div>

      <DataPanel>
        {loading ? <div className="py-12"><PageSpinner /></div> : logs.length === 0 ? (
          <DataPanelEmpty title="No audit logs found" subtitle="Try adjusting filters." />
        ) : (
          <>
            <div className="table-mobile p-3 space-y-3">
              {logs.map(l => (
                <div key={l.id} className="mobile-card">
                  <div className="flex justify-between gap-2 mb-2">
                    <span className="font-bold text-slate-800 text-sm">{l.userName}</span>
                    {actionBadge(l.action)}
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Time</span>
                    <span className="text-[11px] font-mono text-slate-500 text-right">{new Date(l.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Role</span>
                    <span>{roleBadge(l.userRole)}</span>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Resource</span>
                    <span className="text-xs text-slate-600">{l.resourceType}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="table-desktop overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <tr>{['Time', 'User', 'Role', 'Action', 'Resource', 'ID', 'Hospital', 'IP', 'Hash'].map(h => <th key={h} className="text-left px-5 py-3">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {logs.map((l, i) => (
                    <tr key={l.id} className={`border-t border-gray-50 hover:bg-gray-50/80 ${i % 2 === 1 ? 'bg-gray-50/40' : ''}`}>
                      <td className="px-5 py-3 text-gray-500 font-mono text-[11px] whitespace-nowrap">{new Date(l.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' })}</td>
                      <td className="px-5 py-3 font-medium text-gray-800">{l.userName}</td>
                      <td className="px-5 py-3">{roleBadge(l.userRole)}</td>
                      <td className="px-5 py-3">{actionBadge(l.action)}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{l.resourceType}</td>
                      <td className="px-5 py-3 text-gray-400 font-mono text-[10px]">{l.resourceId.slice(0, 8)}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{hospName(l.hospitalId)}</td>
                      <td className="px-5 py-3 text-gray-400 font-mono text-[10px]">{l.ipAddress}</td>
                      <td className="px-5 py-3 text-gray-400 font-mono text-[10px]" title={l.hash}>{l.hash.slice(0, 12)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination page={page} total={total} limit={LIMIT} label="logs" onPrev={() => setPage(p => p - 1)} onNext={() => setPage(p => p + 1)} />
          </>
        )}
      </DataPanel>
    </div>
  );
}

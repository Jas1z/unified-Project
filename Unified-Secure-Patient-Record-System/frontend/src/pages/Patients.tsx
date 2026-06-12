import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Users } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { PageSpinner, InlineSpinner } from '../components/ui/Spinner';
import { DataPanel, DataPanelEmpty } from '../components/ui/DataPanel';
import { TablePagination } from '../components/ui/TablePagination';
import client from '../api/client';
import type { Patient, Hospital, PaginatedPatients } from '../types';

const BLOOD_GROUPS = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];

interface NewPatientForm {
  name: string; dob: string; gender: string; bloodGroup: string;
  phone: string; email: string; address: string;
  primaryHospitalId: string;
  emergencyContact: { name: string; phone: string };
}

const defaultForm = (): NewPatientForm => ({
  name: '', dob: '', gender: 'Male', bloodGroup: 'O+',
  phone: '', email: '', address: '',
  primaryHospitalId: '',
  emergencyContact: { name: '', phone: '' },
});

export default function Patients() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const canWrite = user?.role === 'admin' || user?.role === 'nurse';

  const [patients, setPatients]   = useState<Patient[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [hospFilter, setHospFilter] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [formErr, setFormErr]     = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm]           = useState<NewPatientForm>(defaultForm());

  const LIMIT = 10;

  const load = useCallback(async (q: string, h: string, p: number) => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: p, limit: LIMIT };
      if (q) params.search = q;
      if (h) params.hospital_id = h;
      const { data } = await client.get<PaginatedPatients>('/patients', { params });
      setPatients(data.patients ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load hospitals once
  useEffect(() => {
    client.get<Hospital[]>('/hospitals').then(r => {
      setHospitals(r.data ?? []);
      if (r.data?.[0]) setForm(f => ({ ...f, primaryHospitalId: r.data[0].id }));
    }).catch(() => {});
  }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(search, hospFilter, 1); }, 300);
    return () => clearTimeout(t);
  }, [search, hospFilter, load]);

  useEffect(() => { load(search, hospFilter, page); }, [page, load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setFormErr('');
    try {
      await client.post('/patients', form);
      setShowAdd(false);
      setForm(defaultForm());
      setSuccessMsg('Patient registered successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
      load(search, hospFilter, page);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      setFormErr(msg ?? 'Failed to register patient.');
    } finally { setSaving(false); }
  };

  const hospName = (id: string) => hospitals.find(h => h.id === id)?.name ?? id;

  return (
    <div className="page-stack">
      <div className="toolbar-panel">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full min-w-0">
          <div className="relative flex-1 min-w-0">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              type="search" placeholder="Search patients..."
              className="input-mobile pl-11" />
          </div>
          <select value={hospFilter} onChange={e => { setHospFilter(e.target.value); setPage(1); }}
            className="input-mobile sm:max-w-[220px] font-bold text-slate-700">
            <option value="">All Hospitals</option>
            {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
        {canWrite && (
          <button type="button" onClick={() => setShowAdd(true)} className="btn-primary w-full sm:w-auto">
            <Plus size={18} strokeWidth={3} /> New Patient
          </button>
        )}
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-bold rounded-2xl px-6 py-4 animate-in fade-in slide-in-from-top-2">{successMsg}</div>
      )}

      <DataPanel>
        {loading ? <div className="py-16"><PageSpinner /></div> : patients.length === 0 ? (
          <DataPanelEmpty
            icon={<Users size={40} />}
            title="No patients found"
            subtitle="Try adjusting your search or filters."
          />
        ) : (
          <>
            <div className="table-mobile p-3 space-y-3">
              {patients.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => navigate(`/patients/${p.id}`)}
                  className="mobile-card w-full text-left"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">{p.gender} · #{p.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <Badge label={p.bloodGroup} color="red" />
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">DOB</span>
                    <span className="text-slate-600">{p.dob}</span>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Facility</span>
                    <span className="text-slate-600 font-medium text-right truncate">{hospName(p.primaryHospitalId)}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-primary-600 text-xs font-bold">
                    <Eye size={14} /> View details
                  </div>
                </button>
              ))}
            </div>

            <div className="table-desktop">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/50 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                  <tr>
                    {['Patient ID', 'Full Name', 'Date of Birth', 'Blood', 'Primary Facility', 'Actions'].map(h => (
                      <th key={h} className="text-left px-6 lg:px-8 py-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {patients.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 lg:px-8 py-6 text-slate-400 font-mono text-xs">#{p.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-6 lg:px-8 py-6">
                        <span className="font-bold text-slate-900">{p.name}</span>
                        <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-tighter mt-0.5">{p.gender}</span>
                      </td>
                      <td className="px-6 lg:px-8 py-6 text-slate-500 font-medium">{p.dob}</td>
                      <td className="px-6 lg:px-8 py-6"><Badge label={p.bloodGroup} color="red" /></td>
                      <td className="px-6 lg:px-8 py-6">
                        <span className="text-slate-600 font-bold">{hospName(p.primaryHospitalId)}</span>
                        {p.linkedHospitalIds?.length > 0 && (
                          <Badge label={`+${p.linkedHospitalIds.length}`} color="blue" size="xs" />
                        )}
                      </td>
                      <td className="px-6 lg:px-8 py-6">
                        <button type="button" onClick={() => navigate(`/patients/${p.id}`)}
                          className="flex items-center gap-2 bg-slate-100 hover:bg-primary-600 hover:text-white text-slate-600 text-xs font-bold px-4 py-2 rounded-xl transition-all min-h-[40px]">
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <TablePagination
              page={page}
              total={total}
              limit={LIMIT}
              onPrev={() => setPage(p => p - 1)}
              onNext={() => setPage(p => p + 1)}
            />
          </>
        )}
      </DataPanel>

      {/* Add Patient Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Register New Patient" size="lg">
        <form onSubmit={handleAdd} className="space-y-6 py-2">
          {formErr && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 text-sm font-bold rounded-2xl px-5 py-4">{formErr}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {([['Full Name','name','text'],['Date of Birth','dob','date'],['Phone Number','phone','tel'],['Email Address','email','email']] as const).map(([label,field,type]) => (
              <div key={field} className={field==='name'?'col-span-2':''}>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">{label}</label>
                <input type={type} value={(form as any)[field] ?? ''} required={field!=='email'}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Gender</label>
              <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all outline-none">
                {['Male','Female','Other'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Blood Group</label>
              <select value={form.bloodGroup} onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all outline-none">
                {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Residential Address</label>
              <textarea rows={2} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none resize-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Primary Healthcare Facility</label>
              <select value={form.primaryHospitalId} onChange={e => setForm(f => ({ ...f, primaryHospitalId: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all outline-none">
                {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Emergency Contact Name</label>
              <input value={form.emergencyContact.name}
                onChange={e => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, name: e.target.value } }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Emergency Contact Phone</label>
              <input value={form.emergencyContact.phone}
                onChange={e => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, phone: e.target.value } }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none" />
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 sm:pt-6">
            <button type="button" onClick={() => setShowAdd(false)}
              className="touch-target px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
            <button type="submit" disabled={saving}
              className="btn-primary">
              {saving ? <InlineSpinner /> : <Plus size={18} strokeWidth={3} />} Register Patient
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

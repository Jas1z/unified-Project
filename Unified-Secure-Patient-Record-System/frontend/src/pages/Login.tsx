import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { InlineSpinner } from '../components/ui/Spinner';
import client from '../api/client';
import type { Hospital, UserResponse } from '../types';

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

type AuthMode = 'signin' | 'signup';
type SignupRole = 'patient' | 'doctor' | 'nurse';

const ROLE_OPTIONS: Array<{ value: SignupRole; label: string }> = [
  { value: 'patient', label: 'Patient' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'nurse', label: 'Nurse' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<SignupRole>('patient');
  const [hospitalId, setHospitalId] = useState('');
  const [department, setDepartment] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const loadHospitals = async () => {
      try {
        const { data } = await client.get<Hospital[]>('/hospitals');
        setHospitals(data);
        if (data.length > 0) setHospitalId(data[0].id);
      } catch {
        setError('Hospital directory is temporarily unavailable. You can still create an account once the service is reachable.');
      }
    };

    void loadHospitals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const normalizedEmail = email.trim().toLowerCase();

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      if (!hospitalId) {
        setError('Choose your hospital before continuing.');
        setLoading(false);
        return;
      }
    }

    try {
      if (mode === 'signin') {
        const body = new URLSearchParams();
        body.append('username', normalizedEmail);
        body.append('password', password);

        const { data } = await client.post<LoginResponse>('/auth/login', body, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        login(data.user, data.access_token);
      } else {
        const payload = {
          name: name.trim(),
          email: normalizedEmail,
          password,
          role,
          hospitalId,
          department: department.trim() || undefined,
        };

        const { data } = await client.post<LoginResponse>('/auth/register', payload);
        login(data.user, data.access_token);
      }

      setVerified(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: unknown) {
      const ax = err as { response?: { status: number; data?: { detail?: string } }; code?: string; message?: string };
      const status = ax.response?.status;
      const detail = ax.response?.data?.detail;
      if (status === 403)
        setError('Your account access has been revoked. Contact your administrator.');
      else if (status === 401)
        setError('Access denied — credentials not recognised.');
      else if (status === 409)
        setError(detail || 'An account with that email already exists.');
      else if (!ax.response)
        setError('Cannot reach the API. Start the backend (port 8000) and check your network.');
      else
        setError(detail || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-brand-950 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-x-hidden overflow-y-auto">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary-600/30 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <div className="w-full max-w-md space-y-6 z-10">
        <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-2xl p-6 sm:p-10 border border-white/10 relative">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-900/30 mb-6 transition-transform hover:scale-105">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">CareNexus</h1>
            <p className="text-slate-500 font-medium mt-2 max-w-[260px]">Secure patient record access for hospitals, clinicians, and care teams.</p>
          </div>

          <div className="flex rounded-full bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'signin' ? 'bg-primary-600 text-white shadow' : 'text-slate-600'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${mode === 'signup' ? 'bg-primary-600 text-white shadow' : 'text-slate-600'}`}
            >
              Create Account
            </button>
          </div>

          {verified ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100 animate-bounce">
                <CheckCircle size={32} />
              </div>
              <p className="font-bold text-slate-800 text-lg">Identity verified</p>
              <p className="text-slate-400 text-sm">Redirecting to your secure dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 text-rose-700 text-sm rounded-2xl p-4">
                  <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {mode === 'signup' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full name</label>
                  <input
                    type="text"
                    required={mode === 'signup'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-mobile"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-mobile"
                  placeholder="you@hospital.org"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-mobile pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors p-1"
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Confirm password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPwd ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input-mobile pr-12"
                        placeholder="Re-enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPwd((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors p-1"
                      >
                        {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value as SignupRole)} className="input-mobile">
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Hospital</label>
                    <select value={hospitalId} onChange={(e) => setHospitalId(e.target.value)} className="input-mobile">
                      {hospitals.length === 0 ? (
                        <option value="">Loading hospitals...</option>
                      ) : (
                        hospitals.map((hospital) => (
                          <option key={hospital.id} value={hospital.id}>
                            {hospital.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Department (optional)</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="input-mobile"
                      placeholder="e.g. Cardiology"
                    />
                  </div>
                </>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <><InlineSpinner /> {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}</> : mode === 'signin' ? 'Sign In' : 'Create Secure Account'}
              </button>
            </form>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-white/20 text-[10px] uppercase tracking-[0.2em] font-bold">Encrypted Security Channel · Active</p>
          <div className="h-1 w-12 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-primary-500 animate-infinite-scroll" />
          </div>
        </div>
      </div>
    </div>
  );
}

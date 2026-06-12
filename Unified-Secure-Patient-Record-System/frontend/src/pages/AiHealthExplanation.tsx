import { useEffect, useState } from 'react';
import { Sparkles, FileText, MessageCircle, RotateCcw, AlertCircle } from 'lucide-react';
import client from '../api/client';
import { explainRecord, fetchAiStatus } from '../api/ai';
import { PageSpinner, InlineSpinner } from '../components/ui/Spinner';
import type { EHRRecord, ExplainRecordResponse, PaginatedRecords } from '../types';

export default function AiHealthExplanation() {
  const [records, setRecords] = useState<EHRRecord[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [result, setResult] = useState<ExplainRecordResponse | null>(null);
  const [followUp, setFollowUp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    Promise.all([
      client.get<PaginatedRecords>('/records?limit=50'),
      fetchAiStatus().catch(() => null),
    ]).then(([rRes, status]) => {
      setRecords(rRes.data.records ?? []);
      if (status) setStatusMsg(status.message);
    }).finally(() => setLoadingList(false));
  }, []);

  const runExplain = async (recordId: string, question?: string) => {
    if (!recordId) return;
    setLoadingExplain(true);
    setError(null);
    try {
      const res = await explainRecord(recordId, question);
      setResult(res);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Could not generate explanation. Please retry.');
    } finally {
      setLoadingExplain(false);
    }
  };

  const onSelect = (id: string) => {
    setSelectedId(id);
    setResult(null);
    setFollowUp('');
    runExplain(id);
  };

  if (loadingList) return <PageSpinner />;

  const exp = result?.explanation;

  return (
    <div className="page-stack max-w-3xl">
      <header className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-primary-600 to-violet-600 text-white shadow-lg shadow-primary-900/20">
          <Sparkles size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Health Explanation</h1>
          <p className="text-sm text-slate-500 mt-1">Plain-language summaries of your medical records</p>
          {statusMsg && <p className="text-xs text-primary-600 mt-2 font-medium">{statusMsg}</p>}
        </div>
      </header>

      <div className="data-panel p-4 sm:p-5">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select a record</label>
        <select
          value={selectedId}
          onChange={e => onSelect(e.target.value)}
          className="input-mobile"
        >
          <option value="">Choose a record…</option>
          {records.map(r => (
            <option key={r.id} value={r.id}>
              {r.title} ({r.recordType.replace(/_/g, ' ')})
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl px-4 py-3 text-sm">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{error}</p>
            {selectedId && (
              <button type="button" onClick={() => runExplain(selectedId)} className="mt-2 text-xs font-bold underline flex items-center gap-1">
                <RotateCcw size={12} /> Retry
              </button>
            )}
          </div>
        </div>
      )}

      {loadingExplain && (
        <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
          <InlineSpinner />
          <span className="text-sm font-medium">Generating explanation…</span>
        </div>
      )}

      {exp && !loadingExplain && (
        <div className="space-y-4">
          <div className="data-panel p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={18} className="text-primary-600" />
              <h2 className="font-bold text-slate-900">{result?.record_title}</h2>
            </div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-4">{result?.record_type.replace(/_/g, ' ')}</p>

            <section className="mb-5">
              <h3 className="text-sm font-bold text-primary-700 uppercase tracking-wider mb-2">Simple Summary</h3>
              <p className="text-sm text-slate-700 leading-relaxed">{exp.simple_summary}</p>
            </section>

            <section className="mb-5">
              <h3 className="text-sm font-bold text-primary-700 uppercase tracking-wider mb-2">Detailed Explanation</h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{exp.detailed_explanation}</p>
            </section>

            <section className="mb-5">
              <h3 className="text-sm font-bold text-primary-700 uppercase tracking-wider mb-2">Questions for Your Doctor</h3>
              <ul className="space-y-2">
                {exp.doctor_questions.map((q, i) => (
                  <li key={i} className="text-sm text-slate-700 flex gap-2">
                    <span className="text-primary-500 font-bold">•</span>{q}
                  </li>
                ))}
              </ul>
            </section>

            {exp.follow_up_actions.length > 0 && (
              <section>
                <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-2">Follow-up Actions</h3>
                <ul className="space-y-2">
                  {exp.follow_up_actions.map((a, i) => (
                    <li key={i} className="text-sm text-slate-700 flex gap-2">
                      <span className="text-amber-500 font-bold">→</span>{a}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <div className="data-panel p-4 sm:p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <MessageCircle size={16} /> Follow-up question
            </h3>
            <form
              className="flex flex-col sm:flex-row gap-2"
              onSubmit={e => { e.preventDefault(); runExplain(selectedId, followUp); }}
            >
              <input
                value={followUp}
                onChange={e => setFollowUp(e.target.value)}
                placeholder="Ask about this record…"
                className="input-mobile flex-1"
              />
              <button type="submit" disabled={!followUp.trim() || loadingExplain} className="btn-primary sm:w-auto">
                Ask AI
              </button>
            </form>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed px-1">{exp.disclaimer}</p>
        </div>
      )}

      {!selectedId && !loadingExplain && (
        <p className="text-sm text-slate-500 text-center py-8">Select a record above to view an AI-generated explanation.</p>
      )}
    </div>
  );
}

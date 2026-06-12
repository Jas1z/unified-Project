import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Send, Sparkles, AlertCircle } from 'lucide-react';
import { fetchAiStatus, sendAiChat } from '../../api/ai';
import type { AiChatMessage } from '../../types';
import { InlineSpinner } from '../ui/Spinner';

const QUICK_PROMPTS = [
  'Summarize my records',
  'Explain this prescription',
  'Explain lab results',
  'Upcoming appointments',
  'How do I view my timeline?',
];

interface AiChatPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AiChatPanel({ open, onClose }: AiChatPanelProps) {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [disclaimer, setDisclaimer] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    fetchAiStatus()
      .then(s => setStatusMsg(s.message))
      .catch(() => setStatusMsg(null));
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    setInput('');
    const userMsg: AiChatMessage = { role: 'user', content: trimmed };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setLoading(true);

    try {
      const res = await sendAiChat(trimmed, messages);
      setDisclaimer(res.disclaimer);
      setMessages([...nextHistory, { role: 'assistant', content: res.reply }]);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'AI service unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [loading, messages]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        aria-label="Close AI chat"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        className="relative flex flex-col w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 max-h-[min(92dvh,640px)] animate-in slide-in-from-bottom-4 duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="AI Health Assistant"
      >
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-primary-50 to-violet-50 rounded-t-3xl sm:rounded-t-3xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-600/25 flex-shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-900 text-sm sm:text-base">CareNexus AI</h2>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate">Records & navigation help</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="touch-target p-2 rounded-xl hover:bg-white/80 text-slate-500" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {statusMsg && (
          <p className="px-4 py-2 text-[10px] text-primary-700 bg-primary-50/80 border-b border-primary-100">{statusMsg}</p>
        )}

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3 min-h-[200px]">
          {messages.length === 0 && (
            <div className="text-center py-6 px-2">
              <p className="text-sm text-slate-600 mb-4">Ask about your records or how to use the app.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_PROMPTS.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => send(p)}
                    className="text-xs font-semibold px-3 py-2 rounded-full bg-slate-100 hover:bg-primary-50 hover:text-primary-700 text-slate-600 border border-slate-200 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
              <Link
                to="/ai-health"
                onClick={onClose}
                className="inline-block mt-4 text-xs font-bold text-primary-600 hover:underline"
              >
                Open AI Health Explanation →
              </Link>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-md'
                    : 'bg-slate-100 text-slate-800 rounded-bl-md'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-sm pl-1">
              <InlineSpinner />
              <span>CareNexus AI is thinking…</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-100 text-rose-700 text-sm rounded-xl px-4 py-3">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{error}</p>
                <button type="button" onClick={() => setError(null)} className="text-xs font-bold mt-2 underline">
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {disclaimer && (
          <p className="px-4 pb-1 text-[9px] text-slate-400 leading-snug">{disclaimer}</p>
        )}

        <form
          className="flex gap-2 p-4 border-t border-slate-100 pb-[max(1rem,env(safe-area-inset-bottom))]"
          onSubmit={e => { e.preventDefault(); send(input); }}
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a question…"
            disabled={loading}
            className="input-mobile flex-1 text-sm"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="touch-target flex-shrink-0 p-3 rounded-xl bg-primary-600 text-white disabled:opacity-40 hover:bg-primary-700 transition-colors shadow-lg shadow-primary-900/20"
            aria-label="Send"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

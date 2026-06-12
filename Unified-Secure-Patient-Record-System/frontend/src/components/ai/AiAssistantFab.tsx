import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { AiChatPanel } from './AiChatPanel';

export function AiAssistantFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open AI health assistant"
        className="ai-fab touch-target group"
      >
        <Sparkles size={22} className="text-white group-hover:scale-110 transition-transform" />
      </button>

      <AiChatPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}

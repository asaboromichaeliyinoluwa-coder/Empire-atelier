import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { Pieces, Text } from '../components/ChatParts.tsx';
import { IconSend, IconTrash, Star } from '../components/icons.tsx';
import { useStylistChat } from '../lib/chat.ts';
import { IS_PREVIEW } from '../lib/platform.ts';
import { useServerStatus } from '../lib/status.ts';
import { useApp } from '../lib/store.tsx';

export default function Stylist() {
  const app = useApp();
  const status = useServerStatus();
  const { chat, busy, error, send: ask, prompts, clear } = useStylistChat();
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chat.length, busy]);

  const send = (text: string) => {
    setDraft('');
    void ask(text);
  };

  return (
    <div className="container narrow stack gap-20 stylist">
      <div className="page-head">
        <span className="eyebrow">AI chatbot stylist</span>
        <h1 className="h1">Ask your stylist</h1>
        <p className="lead">Tell it the occasion, your budget and the mood. It answers with real pieces from the atelier you can try on and buy.</p>
      </div>

      <section className="panel chat">
        <div className="chat-log" aria-live="polite">
          <div className="msg assistant">
            <span className="avatar"><Star size={18} /></span>
            <div className="bubble">
              {app.name ? `Hello ${app.name}. ` : 'Hello. '}I'm your Empire Atelier stylist. Where are you going, and what would you like to spend? I'll put the whole outfit together.
            </div>
          </div>
          <AnimatePresence initial={false}>
            {chat.map((m, i) => (
              <motion.div key={i} className={`msg ${m.role}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {m.role === 'assistant' && <span className="avatar"><Star size={18} /></span>}
                <div className="bubble">
                  <Text text={m.text} />
                  {m.role === 'assistant' && <Pieces text={m.text} />}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {busy && (
            <div className="msg assistant">
              <span className="avatar"><Star size={18} /></span>
              <div className="bubble typing"><i /><i /><i /></div>
            </div>
          )}
          {error && <div className="error">{error}</div>}
          <div ref={endRef} />
        </div>

        {chat.length === 0 && (
          <div className="chips chat-prompts">
            {prompts.map((p) => <button key={p} className="chip" onClick={() => send(p)}>{p}</button>)}
          </div>
        )}

        <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(draft); }}>
          <input className="input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="e.g. Outfit for my sister's wedding, under $300" maxLength={600} aria-label="Message the stylist" />
          <button className="btn primary send" disabled={!draft.trim() || busy} aria-label="Send"><IconSend size={18} /></button>
        </form>
      </section>

      <div className="row between wrap gap-8">
        <span className="small muted">
          {IS_PREVIEW
            ? 'In this preview, Claude answers once you allow it; otherwise the built-in stylist does.'
            : status?.stylist
              ? 'Powered by Claude, using your style profile, saved looks and planner.'
              : 'Running the built-in stylist. Add an Anthropic API key on the server for Claude-powered conversation.'}
        </span>
        {chat.length > 0 && <button className="btn text small" onClick={clear}><IconTrash size={14} /> New conversation</button>}
      </div>
    </div>
  );
}

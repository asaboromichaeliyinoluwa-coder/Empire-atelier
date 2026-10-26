import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useStylistChat } from '../lib/chat.ts';
import { useApp } from '../lib/store.tsx';
import { Pieces, Text } from './ChatParts.tsx';
import { IconClose, IconMinus, IconSend, Star } from './icons.tsx';

/** Quick replies. A `to` opens a page instead of asking the stylist. */
const QUICK: { label: string; ask?: string; to?: string }[] = [
  { label: 'Find a piece', ask: 'Help me find a piece I would love. Ask me what I need.' },
  { label: 'Style me for an occasion', ask: 'Style me a complete outfit for an occasion coming up.' },
  { label: 'Outfit under $150', ask: 'Put together a full outfit under $150.' },
  { label: 'What’s on sale?', ask: 'What are the best pieces on sale right now?' },
  { label: 'Try clothes on me', to: '/try-on' },
  { label: 'Plan my week', to: '/planner' },
];

/** Floating AI stylist: a chat bubble on every page, sharing its conversation with the stylist page. */
export function ChatBubble() {
  const { name } = useApp();
  const navigate = useNavigate();
  const { chat, busy, error, send, clear } = useStylistChat();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: 'end' });
  }, [open, chat.length, busy]);

  const submit = (text: string) => {
    setDraft('');
    void send(text);
  };

  return (
    <div className={`chat-bubble ${open ? 'is-open' : ''}`}>
      <AnimatePresence>
        {open && (
          <motion.section
            className="chat-pop"
            role="dialog"
            aria-label="Empire Atelier stylist"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="chat-pop-head">
              <span className="avatar big"><Star size={22} /></span>
              <span className="grow">
                <b>Empire stylist</b> <span className="beta">AI</span>
                <small>Replies in seconds · uses your style profile</small>
              </span>
              <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Minimise"><IconMinus size={18} /></button>
              <button className="icon-btn" onClick={() => { setOpen(false); clear(); }} aria-label="Close and clear"><IconClose size={18} /></button>
            </header>

            <div className="chat-pop-log" aria-live="polite">
              <div className="msg assistant">
                <div className="bubble">
                  Hi{name ? ` ${name}` : ''}, I’m your Empire Atelier stylist ✦ How can I help you today?
                </div>
              </div>
              {chat.length === 0 && (
                <div className="quick">
                  {QUICK.map((q) => (
                    <button key={q.label} className="chip" onClick={() => (q.to ? (setOpen(false), navigate(q.to)) : submit(q.ask!))}>{q.label}</button>
                  ))}
                </div>
              )}
              {chat.slice(-12).map((m, i) => (
                <div key={i} className={`msg ${m.role}`}>
                  <div className="bubble">
                    <Text text={m.text} />
                    {m.role === 'assistant' && <Pieces text={m.text} />}
                  </div>
                </div>
              ))}
              {busy && <div className="msg assistant"><div className="bubble typing"><i /><i /><i /></div></div>}
              {error && <div className="error small">{error}</div>}
              <div ref={endRef} />
            </div>

            <form className="chat-pop-input" onSubmit={(e) => { e.preventDefault(); submit(draft); }}>
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask me anything…" maxLength={600} aria-label="Message the stylist" />
              <button className="send" disabled={!draft.trim() || busy} aria-label="Send"><IconSend size={17} /></button>
            </form>
            <Link to="/stylist" className="chat-pop-full small" onClick={() => setOpen(false)}>Open the full stylist →</Link>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        className="chat-fab"
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.92 }}
        aria-label={open ? 'Close the stylist' : 'Chat with your AI stylist'}
        aria-expanded={open}
      >
        {open ? <IconClose size={22} /> : <Star size={26} />}
        {!open && <span className="fab-label">Ask your stylist</span>}
      </motion.button>
    </div>
  );
}

import { AnimatePresence, motion } from 'framer-motion';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { IconCheck, IconHeart, IconSend, IconSparkle, IconTrash, Star } from '../components/icons.tsx';
import { GarmentImage, money } from '../components/ui.tsx';
import { askStylist } from '../lib/api.ts';
import { IS_PREVIEW } from '../lib/platform.ts';
import { dateKey, fromKey } from '../lib/planner.ts';
import { useServerStatus } from '../lib/status.ts';
import { useApp } from '../lib/store.tsx';
import { OCCASIONS, productById, type Product } from '../shared/catalog.ts';
import { idsInReply, type ChatTurn, type StylistContext } from '../shared/stylist.ts';

const PROMPTS = {
  women: ['What should I wear to a wedding under $400?', 'Build me a work outfit in neutrals', 'Date night look in black', 'A weekend brunch outfit'],
  men: ['What should I wear to an owambe?', 'A sharp interview outfit under $500', 'Smart-casual dinner date look', 'Linen outfit for a beach trip'],
};

/** Renders **bold** and line breaks; product ids become cards below the message. */
function Text({ text }: { text: string }) {
  const clean = text.replace(/\[\[([a-z0-9-]+)\]\]/g, (_, id) => productById(id)?.name ?? '').replace(/[ \t]{2,}/g, ' ');
  return (
    <>
      {clean.split('\n').map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line.split(/(\*\*[^*]+\*\*)/).map((part, j) => (part.startsWith('**') ? <b key={j}>{part.slice(2, -2)}</b> : part))}
        </Fragment>
      ))}
    </>
  );
}

function Pieces({ text }: { text: string }) {
  const navigate = useNavigate();
  const { saveLook, isLookSaved } = useApp();
  const items = idsInReply(text).map(productById).filter(Boolean) as Product[];
  if (!items.length) return null;
  const ids = items.map((p) => p.id);
  const wearable = items.filter((p) => p.garment);
  const saved = isLookSaved(ids);
  return (
    <div className="chat-pieces">
      <div className="chat-cards">
        {items.map((p) => (
          <Link key={p.id} to={`/product/${p.id}`} className="chat-card">
            <GarmentImage product={p} />
            <span className="small">{p.name}</span>
            <span className="small muted">{money(p.price)}</span>
          </Link>
        ))}
      </div>
      <div className="row gap-8 wrap">
        {wearable.length > 0 && (
          <button className="btn primary small" onClick={() => navigate(`/try-on?items=${ids.join(',')}`)}><IconSparkle size={14} /> Try the look on</button>
        )}
        {items.length > 1 && (
          <button className={`btn ghost small ${saved ? 'on' : ''}`} onClick={() => !saved && saveLook({ name: `Stylist pick: ${items[0].name}`, itemIds: ids })}>
            {saved ? <><IconCheck size={14} /> Saved</> : <><IconHeart size={14} /> Save look</>}
          </button>
        )}
        <span className="small muted">{money(items.reduce((s, p) => s + p.price, 0))} together</span>
      </div>
    </div>
  );
}

export default function Stylist() {
  const app = useApp();
  const status = useServerStatus();
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const endRef = useRef<HTMLDivElement>(null);
  const chat = app.chat;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chat.length, busy]);

  const context = (): StylistContext => {
    const today = dateKey(new Date());
    const plan = Object.entries(app.plan)
      .filter(([k, d]) => k >= today && (d.event || d.occasion))
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 7)
      .map(([k, d]) => `${fromKey(k).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}: ${d.event || 'no event'} (${OCCASIONS.find((o) => o.key === d.occasion)?.label ?? 'any'})`);
    return { name: app.name, prefs: app.prefs, favorites: app.favorites, looks: app.looks.map((l) => ({ name: l.name, itemIds: l.itemIds })), plan };
  };

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    const history: ChatTurn[] = [...chat, { role: 'user', text: t }];
    app.update({ chat: history });
    setDraft('');
    setBusy(true);
    setError(undefined);
    try {
      const reply = await askStylist(history.slice(-16), context());
      app.update({ chat: [...history, { role: 'assistant', text: reply }] });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The stylist is unavailable. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const prompts = app.prefs.department === 'men' ? PROMPTS.men : app.prefs.department === 'women' ? PROMPTS.women : [PROMPTS.women[0], PROMPTS.men[0], PROMPTS.women[1], PROMPTS.men[1]];

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
        {chat.length > 0 && <button className="btn text small" onClick={() => app.update({ chat: [] })}><IconTrash size={14} /> New conversation</button>}
      </div>
    </div>
  );
}

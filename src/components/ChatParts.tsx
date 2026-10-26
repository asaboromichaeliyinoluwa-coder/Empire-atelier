import { Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useApp } from '../lib/store.tsx';
import { productById, type Product } from '../shared/catalog.ts';
import { idsInReply } from '../shared/stylist.ts';
import { IconCheck, IconHeart, IconSparkle } from './icons.tsx';
import { GarmentImage, money } from './ui.tsx';

/** Renders **bold** and line breaks; product ids become cards below the message. */
export function Text({ text }: { text: string }) {
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

export function Pieces({ text }: { text: string }) {
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


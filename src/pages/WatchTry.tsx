import { createElement, useMemo, useState } from 'react';

import { BeforeAfter } from '../components/BeforeAfter.tsx';
import { PhotoPicker } from '../components/ui.tsx';
import { downscale } from '../lib/images.ts';
import { useServerStatus } from '../lib/status.ts';
import { money } from '../components/ui.tsx';
import { PRODUCTS, type Product } from '../shared/catalog.ts';

const jpeg = (src: string) =>
  new Promise<string>((ok, no) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => {
      const c = document.createElement('canvas');
      c.width = im.naturalWidth;
      c.height = im.naturalHeight;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(im, 0, 0);
      ok(c.toDataURL('image/jpeg', 0.92));
    };
    im.onerror = () => no(new Error('The watch photo could not be loaded.'));
    im.src = src;
  });

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json' } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { error?: string }).error || `Request failed (${res.status})`);
  return body as T;
}

/** Watch try-on: pick a watch, add a photo of your wrist, and YouCam puts the watch on it. */
export default function WatchTry() {
  const status = useServerStatus();
  const watches = useMemo(() => PRODUCTS.filter((p) => p.category === 'accessories' && p.image), []);
  const [watch, setWatch] = useState<Product>();
  const [photo, setPhoto] = useState<string>();
  const [result, setResult] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [manual, setManual] = useState(false);
  const [fit, setFit] = useState({ x: 50, y: 50, size: 35, rot: 0 });

  const run = async () => {
    if (!watch || !photo) return;
    setBusy(true);
    setError(undefined);
    setResult(undefined);
    try {
      const watchImage = { dataUrl: await jpeg(watch.image!) };
      const started = await api<{ demo?: true; taskId?: string }>('/api/watch', { method: 'POST', body: JSON.stringify({ source: { dataUrl: photo }, watchImage }) });
      if (!started.taskId) throw new Error('Photo-real try-on is not switched on yet.');
      for (let i = 0; i < 60; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const r = await api<{ status: string; url?: string; error?: string }>(`/api/watch/task/${encodeURIComponent(started.taskId)}`);
        if (r.status === 'success' && r.url) return setResult(r.url);
        if (r.status === 'error') throw new Error(r.error || 'The try-on failed.');
      }
      throw new Error('The try-on took too long. Please try again.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The try-on failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack gap-16">
      <div>
        <span className="eyebrow">Virtual fitting room</span>
        <h1 className="h1">Try a watch on your wrist</h1>
        <p className="muted">Choose a watch, then add a clear photo of your wrist and hand, palm down, in good light.</p>
      </div>

      <div className="picker">
        {watches.map((p) => (
          <button key={p.id} className={`pick ${watch?.id === p.id ? 'on' : ''}`} onClick={() => { setWatch(p); setResult(undefined); }}>
            {createElement('img', { src: p.image, alt: p.name, style: { width: '100%', aspectRatio: '4 / 5', objectFit: 'cover', borderRadius: 10 } })}
            <span className="small">{p.name}</span>
            <span className="small muted">{money(p.price)}</span>
          </button>
        ))}
        {!watches.length && <p className="muted">No watches in the shop yet. Add some in My products, under Watches &amp; jewellery.</p>}
      </div>

      {photo ? (
        <div className="row gap-8 wrap">
          <button className="btn primary" onClick={run} disabled={!watch || busy || status?.youcam === false}>
            {busy ? 'Fitting the watch…' : watch ? `Try on ${watch.name}` : 'Choose a watch first'}
          </button>
          <button className="btn ghost" onClick={() => { setManual(true); setResult(undefined); setError(undefined); }} disabled={!watch}>Place it myself</button>
          <button className="btn text" onClick={() => { setPhoto(undefined); setResult(undefined); setManual(false); }}>Change photo</button>
        </div>
      ) : (
        <PhotoPicker onPhoto={(p) => downscale(p, 1100, 0.88).then(setPhoto).catch(() => setPhoto(p))} />
      )}

      {photo && !result && !manual && createElement('img', { src: photo, alt: 'Your wrist photo', style: { maxWidth: 360, width: '100%', borderRadius: 16 } })}
      {photo && watch && manual && (
        <div className="stack gap-12" style={{ maxWidth: 420 }}>
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden' }}>
            {createElement('img', { src: photo, alt: 'Your wrist photo', style: { width: '100%', display: 'block' } })}
            {createElement('img', { src: watch.image, alt: watch.name, style: { position: 'absolute', left: `${fit.x}%`, top: `${fit.y}%`, width: `${fit.size}%`, transform: `translate(-50%, -50%) rotate(${fit.rot}deg)`, mixBlendMode: 'multiply', pointerEvents: 'none' } })}
          </div>
          {([['x', 'Left or right', 0, 100], ['y', 'Up or down', 0, 100], ['size', 'Size', 10, 80], ['rot', 'Turn', -180, 180]] as const).map(([k, label, min, max]) => (
            <label key={k} className="stack gap-4">
              <span className="small muted">{label}</span>
              {createElement('input', { type: 'range', min, max, step: 1, value: fit[k], onChange: (e: { target: { value: string } }) => setFit({ ...fit, [k]: Number(e.target.value) }) })}
            </label>
          ))}
          <p className="small muted">Move the sliders until the watch sits on your wrist. This is a simple preview, not a photo-real render.</p>
        </div>
      )}
      {error && <div className="error">{error.includes('correct pose') ? 'YouCam could not see your wrist clearly. Use a photo of the back of your hand and wrist, palm down, all five fingers visible, nothing covering it, in good light.' : error}</div>}
      {photo && result && <BeforeAfter before={photo} after={result} label="YouCam" />}
    </div>
  );
}

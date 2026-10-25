import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { BeforeAfter } from '../components/BeforeAfter.tsx';
import { IconCheck, IconDownload, IconTrash, IconUpload, IconWand } from '../components/icons.tsx';
import { Collage, money, PhotoPicker } from '../components/ui.tsx';
import { changerTemplates, runChanger, runYouCamTryOn, type Template } from '../lib/api.ts';
import { composeTryOn, photoKey, resolvePhoto, samplePhoto } from '../lib/compose.ts';
import { downscale, fileToDataUrl } from '../lib/images.ts';
import { saveFile } from '../lib/platform.ts';
import { useServerStatus } from '../lib/status.ts';
import { useApp } from '../lib/store.tsx';
import { productById, type Product } from '../shared/catalog.ts';

/** House looks for the changer: each is a full outfit from the catalogue. */
const PRESETS: { id: string; name: string; mood: string; gender: 'women' | 'men'; itemIds: string[] }[] = [
  { id: 'gala', name: 'Velvet Gala', mood: 'Black-tie glamour', gender: 'women', itemIds: ['empress-gown'] },
  { id: 'boardroom', name: 'Boardroom', mood: 'Sharp and tailored', gender: 'women', itemIds: ['tailored-trouser', 'white-blouse', 'black-blazer'] },
  { id: 'garden', name: 'Garden Party', mood: 'Soft florals', gender: 'women', itemIds: ['peony-midi'] },
  { id: 'denim', name: 'Weekend Denim', mood: 'Easy and polished', gender: 'women', itemIds: ['blue-jeans', 'striped-shirt'] },
  { id: 'golden', name: 'Golden Hour', mood: 'Hand-woven boho', gender: 'women', itemIds: ['kente-maxi'] },
  { id: 'noir', name: 'Sleek Noir', mood: 'Minimal evening', gender: 'women', itemIds: ['noir-jumpsuit'] },
  { id: 'owambe', name: 'Owambe Agbada', mood: 'Native glamour', gender: 'men', itemIds: ['ivory-agbada'] },
  { id: 'suit', name: 'Navy Suit', mood: 'Interview and boardroom', gender: 'men', itemIds: ['navy-suit-trouser', 'oxford-white', 'navy-suit-jacket'] },
  { id: 'senator', name: 'Senator Night', mood: 'Rich and refined', gender: 'men', itemIds: ['wine-senator'] },
  { id: 'offduty', name: 'Off Duty', mood: 'Street-smart weekend', gender: 'men', itemIds: ['indigo-jeans', 'white-tee', 'black-bomber'] },
  { id: 'resort', name: 'Resort Linen', mood: 'Beach and city breaks', gender: 'men', itemIds: ['sand-shorts', 'sand-linen-shirt'] },
  { id: 'overcoat', name: 'City Overcoat', mood: 'Quiet luxury', gender: 'men', itemIds: ['charcoal-trouser', 'camel-rollneck', 'camel-overcoat'] },
];

type Mode = 'atelier' | 'templates' | 'upload';
const GARMENT_TYPES = [
  { key: 'full_body', label: 'Full outfit or dress' },
  { key: 'upper_body', label: 'Top or jacket' },
  { key: 'lower_body', label: 'Trousers or skirt' },
] as const;

export default function Changer() {
  const app = useApp();
  const status = useServerStatus();
  const live = !!status?.youcam;
  const department = app.prefs.department;
  const [photo, setPhoto] = useState<string | undefined>(() => resolvePhoto(app.photo));
  const [mode, setMode] = useState<Mode>('atelier');
  const [templates, setTemplates] = useState<Template[]>();
  const [garmentPhoto, setGarmentPhoto] = useState<string>();
  const [garmentType, setGarmentType] = useState<(typeof GARMENT_TYPES)[number]['key']>('full_body');
  const [result, setResult] = useState<{ image: string; label: string; real: boolean; itemIds?: string[] }>();
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const garmentRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (live && mode === 'templates' && !templates) changerTemplates().then(setTemplates).catch(() => setTemplates([]));
  }, [live, mode, templates]);

  const presets = PRESETS.filter((p) => department === 'all' || p.gender === department);

  const choosePhoto = (p: string) => {
    setPhoto(p);
    setResult(undefined);
    const sample = photoKey(p);
    if (sample) return app.update({ photo: sample });
    downscale(p, 1100, 0.85).then((small) => app.update({ photo: small })).catch(() => {});
  };

  const run = async (label: string, job: () => Promise<{ image: string; real: boolean } | null>, itemIds?: string[]) => {
    if (!photo) return;
    setError(undefined);
    setSaved(false);
    setBusy('Changing your outfit…');
    try {
      const r = await job();
      if (r) setResult({ ...r, label, itemIds });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The clothes changer failed. Please try again.');
    } finally {
      setBusy(undefined);
    }
  };

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    const items = p.itemIds.map(productById).filter(Boolean) as Product[];
    run(p.name, async () => {
      if (live) {
        const url = await runYouCamTryOn(items, photo!, setBusy);
        if (url) return { image: url, real: true };
      }
      return { image: (await composeTryOn(photo!, items)).image, real: false };
    }, p.itemIds);
  };

  const applyTemplate = (t: Template) =>
    run(t.name, async () => {
      const url = await runChanger(photo!, { templateId: t.id }, setBusy);
      return url ? { image: url, real: true } : null;
    });

  const applyGarment = () =>
    garmentPhoto &&
    run('Your garment', async () => {
      const url = await runChanger(photo!, { garmentImage: await downscale(garmentPhoto, 1200, 0.9), garment: garmentType }, setBusy);
      return url ? { image: url, real: true } : null;
    });

  const keep = async () => {
    if (!result) return;
    try {
      app.addChange({ style: result.label, image: await downscale(result.image, 720, 0.84) });
      setSaved(true);
    } catch {
      setError('This picture could not be saved here. Use Download instead.');
    }
  };

  const download = async () => {
    if (!result) return;
    try {
      await saveFile(`empire-atelier-${result.label.toLowerCase().replace(/\W+/g, '-')}.jpg`, await (await fetch(result.image)).blob());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the picture.');
    }
  };

  return (
    <div className="container stack gap-24">
      <div className="page-head">
        <span className="eyebrow">AI clothes changer</span>
        <h1 className="h1">Change your outfit in one tap</h1>
        <p className="lead">
          Keep your face, body and pose, and swap what you're wearing: a house look, one of YouCam's outfit styles, or a
          photo of any garment you've seen.
        </p>
      </div>

      <div className="tryon-layout">
        <section className="tryon-stage panel">
          {!photo ? (
            <div className="stack gap-16">
              <PhotoPicker onPhoto={choosePhoto} />
              <div className="row gap-8 wrap">
                {department !== 'men' && <button className="btn ghost grow" onClick={() => choosePhoto(samplePhoto('women'))}>Use the women’s mannequin</button>}
                {department !== 'women' && <button className="btn ghost grow" onClick={() => choosePhoto(samplePhoto('men'))}>Use the men’s mannequin</button>}
              </div>
            </div>
          ) : (
            <div className="stack gap-12">
              {result ? (
                <BeforeAfter before={photo} after={result.image} label={result.real ? 'YouCam AI' : 'Preview'} />
              ) : (
                <div className="stage">
                  <img src={photo} alt="Your photo" />
                  <div className="stage-hint">Choose a new outfit →</div>
                </div>
              )}
              <AnimatePresence>
                {busy && (
                  <motion.div className="busy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="spinner" /> {busy}
                  </motion.div>
                )}
              </AnimatePresence>
              {error && <div className="error">{error}</div>}
              {result && !result.real && (
                <div className="mode-note small">
                  <b>Preview mode.</b> The outfit is drawn onto your photo on this device. With a YouCam API key on the server, the
                  changer renders a photo-real result that keeps your face, body and pose.
                </div>
              )}
              <div className="row gap-8 wrap">
                {result && (
                  <>
                    <button className={`btn ${saved ? 'ghost on' : 'primary'}`} onClick={keep} disabled={saved}>
                      {saved ? <><IconCheck size={16} /> Kept</> : <>Keep this look</>}
                    </button>
                    <button className="btn ghost" onClick={download}><IconDownload size={16} /> Download</button>
                    {result.itemIds && <Link className="btn text" to={`/look?items=${result.itemIds.join(',')}&name=${encodeURIComponent(result.label)}`}>Shop this look</Link>}
                  </>
                )}
                <button className="btn text" onClick={() => { setPhoto(undefined); setResult(undefined); }}>Change photo</button>
              </div>
            </div>
          )}
        </section>

        <aside className="tryon-side stack gap-20">
          <div className="panel stack gap-12">
            <div className="tabs">
              <button className={mode === 'atelier' ? 'on' : ''} onClick={() => setMode('atelier')}>House looks</button>
              <button className={mode === 'templates' ? 'on' : ''} onClick={() => setMode('templates')}>YouCam styles</button>
              <button className={mode === 'upload' ? 'on' : ''} onClick={() => setMode('upload')}>Any garment</button>
            </div>

            {mode === 'atelier' && (
              <div className="preset-grid">
                {presets.map((p) => {
                  const total = p.itemIds.reduce((s, id) => s + (productById(id)?.price ?? 0), 0);
                  return (
                    <button key={p.id} className={`preset ${result?.label === p.name ? 'on' : ''}`} onClick={() => applyPreset(p)} disabled={!photo || !!busy}>
                      <Collage itemIds={p.itemIds} />
                      <b>{p.name}</b>
                      <span className="small muted">{p.mood} · {money(total)}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {mode === 'templates' &&
              (!live ? (
                <p className="small muted">YouCam's outfit styles appear here once a YouCam API key is added on the server. House looks work right away.</p>
              ) : !templates ? (
                <div className="row gap-8 small"><div className="spinner" /> Loading styles…</div>
              ) : templates.length ? (
                <div className="preset-grid">
                  {templates.map((t) => (
                    <button key={t.id} className={`preset ${result?.label === t.name ? 'on' : ''}`} onClick={() => applyTemplate(t)} disabled={!photo || !!busy}>
                      <img src={t.thumb} alt="" loading="lazy" />
                      <b>{t.name}</b>
                      {t.category && <span className="small muted">{t.category}</span>}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="small muted">No YouCam styles are available on this account yet.</p>
              ))}

            {mode === 'upload' && (
              <div className="stack gap-12">
                <p className="small muted">Saw something you love elsewhere? Upload a clear photo of the garment, on a hanger or flat, and see it on you.</p>
                <button className="dropzone small-zone" onClick={() => garmentRef.current?.click()}>
                  {garmentPhoto ? <img src={garmentPhoto} alt="Garment" /> : <><IconUpload size={26} className="rose" /><span>Upload a garment photo</span></>}
                </button>
                <input ref={garmentRef} type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) setGarmentPhoto(await fileToDataUrl(f)); }} />
                <div className="chips">
                  {GARMENT_TYPES.map((g) => <button key={g.key} className={`chip ${garmentType === g.key ? 'on' : ''}`} onClick={() => setGarmentType(g.key)}>{g.label}</button>)}
                </div>
                <button className="btn primary" onClick={applyGarment} disabled={!live || !photo || !garmentPhoto || !!busy}><IconWand size={16} /> Change my outfit</button>
                {!live && <span className="small muted">Needs a YouCam API key on the server for a realistic result.</span>}
              </div>
            )}
          </div>

          {app.changes.length > 0 && (
            <div className="panel stack gap-12">
              <h2 className="h3">Kept looks</h2>
              <div className="kept-grid">
                {app.changes.map((c) => (
                  <figure key={c.id} className="kept">
                    <img src={c.image} alt={c.style} />
                    <figcaption className="row between small">
                      <span>{c.style}</span>
                      <button className="icon-btn" onClick={() => app.removeChange(c.id)} aria-label={`Remove ${c.style}`}><IconTrash size={14} /></button>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

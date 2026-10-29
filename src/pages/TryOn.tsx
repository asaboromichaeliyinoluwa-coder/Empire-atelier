import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { BeforeAfter } from '../components/BeforeAfter.tsx';
import { IconCheck, IconClose, IconDownload, IconHeart, IconSparkle } from '../components/icons.tsx';
import { GarmentImage, money, PhotoPicker, RetailerButton } from '../components/ui.tsx';
import { runYouCamTryOn } from '../lib/api.ts';
import { composeTryOn, DEFAULT_FIT, photoKey, resolvePhoto, samplePhoto, type Fit } from '../lib/compose.ts';
import { downscale } from '../lib/images.ts';
import { IS_PREVIEW, saveFile } from '../lib/platform.ts';
import { useServerStatus } from '../lib/status.ts';
import { useApp } from '../lib/store.tsx';
import { inDepartment, PRODUCTS, productById, type Category, type Product } from '../shared/catalog.ts';

const PICK_TABS: { key: Category; label: string }[] = [
  { key: 'dresses', label: 'Dresses' },
  { key: 'sets', label: 'Kaftans & sets' },
  { key: 'tops', label: 'Tops' },
  { key: 'bottoms', label: 'Bottoms' },
  { key: 'outerwear', label: 'Layers' },
];

/** One dress, or one top and one bottom, plus one layer. Shoes and bags ride along for the look. */
const SIZE_SCALE: Record<string, number> = { S: 0.9, M: 0.95, L: 1, XL: 1.07, XXL: 1.14, XXXL: 1.21 };
/** Length in inches, five steps per garment type; the middle one is the standard length. */
const LENGTHS = { top: [24, 26, 28, 30, 32], bottom: [36, 38, 40, 42, 44], full: [44, 48, 52, 56, 60] };

function addPiece(items: Product[], p: Product): Product[] {
  const keep = items.filter((x) => {
    if (x.id === p.id) return false;
    if (!x.garment || !p.garment) return x.category !== p.category || !!x.garment;
    if (p.category === 'outerwear') return x.category !== 'outerwear';
    if (p.garment === 'full_body') return x.category === 'outerwear';
    if (x.garment === 'full_body') return false;
    if (x.category === 'outerwear') return true;
    return x.garment !== p.garment;
  });
  return [...keep, p];
}

export default function TryOn() {
  const [params] = useSearchParams();
  const app = useApp();
  const status = useServerStatus();
  const department = app.prefs.department;
  const [photo, setPhoto] = useState<string | undefined>(() => resolvePhoto(app.photo));
  const [items, setItems] = useState<Product[]>(() => {
    const ids = params.get('items')?.split(',') ?? [];
    return ids.map(productById).filter(Boolean).reduce<Product[]>((acc, p) => addPiece(acc, p!), []);
  });
  const tabs = PICK_TABS.filter((t) => PRODUCTS.some((p) => p.garment && p.category === t.key && inDepartment(p, department)));
  const [tab, setTab] = useState<Category>(items.find((p) => p.garment)?.category ?? (department === 'men' ? 'tops' : 'dresses'));
  const shownTab = tabs.some((t) => t.key === tab) ? tab : tabs[0]?.key ?? 'tops';
    const [fit, setFit] = useState<Fit>(DEFAULT_FIT);
  const [size, setSize] = useState('M');
  const [lenIdx, setLenIdx] = useState(2);
  const [preview, setPreview] = useState<{ image: string; tracked: boolean }>();
  const [render, setRender] = useState<{ key: string; url: string }>();
  const [busy, setBusy] = useState<string>();
  const [error, setError] = useState<string>();
  const [savedId, setSavedId] = useState<string>();

    const wearable = items.filter((p) => p.garment);
  const lenKind = wearable.some((p) => p.garment === 'full_body') ? 'full' : wearable.some((p) => p.garment === 'upper_body') ? 'top' : 'bottom';
  const lengthIn = LENGTHS[lenKind][lenIdx];
  const key = `${photo?.length}:${wearable.map((p) => p.id).join(',')}`;
  const photoReal = render?.key === key ? render.url : undefined;
  const result = photoReal ?? preview?.image;
  const total = items.reduce((s, p) => s + p.price, 0);

  useEffect(() => {
    if (!photo) return;
    let live = true;
    setError(undefined);
        composeTryOn(photo, wearable, { ...fit, size: fit.size * SIZE_SCALE[size], len: 1 + (lenIdx - 2) * 0.07 })
      .then((r) => live && setPreview(r))
      .catch(() => live && setError('This photo could not be read. Try another one.'));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [photo, key, fit, size, lenIdx]);

  useEffect(() => setSavedId(undefined), [key]);

  const choosePhoto = (p: string) => {
    setPhoto(p);
    setRender(undefined);
    setFit(DEFAULT_FIT);
    // Keep the photo for next time: the mannequin by name, the shopper's own small enough to store.
    const sample = photoKey(p);
    if (sample) return app.update({ photo: sample });
    downscale(p, 1100, 0.85).then((small) => app.update({ photo: small })).catch(() => {});
  };

  const renderYouCam = async () => {
    if (!photo || !wearable.length) return;
    setError(undefined);
    try {
      setBusy('Sending to the atelier…');
      const url = await runYouCamTryOn(wearable, photo, setBusy);
      if (url) setRender({ key, url });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The try-on failed. Please try again.');
    } finally {
      setBusy(undefined);
    }
  };

  const saveLook = async () => {
    if (!items.length) return;
    let image: string | undefined;
    try {
      image = result ? await downscale(result, 720, 0.84) : undefined;
    } catch {
      image = undefined; // A remote render that can't be read back: save the look without it.
    }
        const look = app.saveLook({ name: `${items[0].name} look (${size}, ${lengthIn} in)`, itemIds: items.map((p) => p.id), image });
    setSavedId(look.id);
  };

  const download = async () => {
    if (!result) return;
    try {
      const blob = await (await fetch(result)).blob();
      await saveFile('empire-atelier-try-on.jpg', blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the picture.');
    }
  };

  const choices = useMemo(() => PRODUCTS.filter((p) => p.garment && p.category === shownTab && inDepartment(p, department)), [shownTab, department]);

  return (
    <div className="container stack gap-24">
      <div className="page-head">
        <span className="eyebrow">Virtual fitting room</span>
        <h1 className="h1">Try it on</h1>
        <p className="lead">See how pieces look on you before you buy. Choose a photo, then pick what to wear.</p>
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
              {wearable.length > 0 && (
                <span className={`mode-badge ${photoReal ? 'real' : 'mock'}`}>
                  {photoReal ? 'Real result · rendered by YouCam AI on your photo' : 'On-device preview · an illustrated mockup, not a photo-real result'}
                </span>
              )}
              {photoReal ? (
                <BeforeAfter before={photo} after={photoReal} label="YouCam" />
              ) : (
                <div className="stage">
                  {result ? <img src={result} alt="Try-on preview" /> : <div className="spinner" />}
                 {!wearable.length && <button className="stage-hint" onClick={() => document.getElementById('tryon-pieces')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Pick a piece to try on →</button>}#
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

              {!photoReal && wearable.length > 0 && (
                <div className="mode-note small">
                  {status?.youcam ? (
                    <>This is an instant preview. Render it with YouCam AI for a photo-real fit that keeps your face, body and pose.</>
                  ) : (
                    <>
                      <b>Preview mode.</b> Pieces are placed on your photo on this device
                      {preview && !preview.tracked && ' (we couldn’t find your full body, so use the fit sliders)'}. Add a YouCam API
                      key on the server for photo-real try-on.
                    </>
                  )}
                </div>
              )}

              {!photoReal && wearable.length > 0 && (
                <div className="fit">
                  <label>
                    <span className="small muted">Size</span>
                    <input type="range" min={0.8} max={1.3} step={0.01} value={fit.size} onChange={(e) => setFit({ ...fit, size: Number(e.target.value) })} />
                  </label>
                  <label>
                    <span className="small muted">Position</span>
                    <input type="range" min={-0.08} max={0.08} step={0.005} value={fit.lift} onChange={(e) => setFit({ ...fit, lift: Number(e.target.value) })} />
                  </label>
                </div>
              )}
                            {wearable.length > 0 && (
                <div className="stack gap-12">
                  <div>
                    <span className="small muted">Size</span>
                    <div className="chips">
                      {Object.keys(SIZE_SCALE).map((s) => <button key={s} className={`chip ${size === s ? 'on' : ''}`} onClick={() => setSize(s)}>{s}</button>)}
                    </div>
                  </div>
                  <div>
                    <span className="small muted">Length (inches)</span>
                    <div className="chips">
                      {LENGTHS[lenKind].map((n, i) => <button key={n} className={`chip ${lenIdx === i ? 'on' : ''}`} onClick={() => setLenIdx(i)}>{n}</button>)}
                    </div>
                  </div>
                </div>
              )}
               <div className="row gap-8 wrap">
                {status?.youcam && wearable.length > 0 && !photoReal && (
                  <button className="btn primary" onClick={renderYouCam} disabled={!!busy}>
                    <IconSparkle size={16} /> Render with YouCam
                  </button>
                )}
                <button className={`btn ${savedId ? 'ghost on' : status?.youcam && !photoReal ? 'ghost' : 'primary'}`} onClick={saveLook} disabled={!items.length || !!busy}>
                  {savedId ? <><IconCheck size={16} /> Saved to my looks</> : <><IconHeart size={16} /> Save this look</>}
                </button>
                {!IS_PREVIEW && (
                  <button className="btn ghost" onClick={download} disabled={!result || !wearable.length}>
                    <IconDownload size={16} /> Download
                  </button>
                )}
                <button className="btn text" onClick={() => { setPhoto(undefined); setPreview(undefined); }}>Change photo</button>
              </div>
              {savedId && <Link to="/saved" className="link small">See my saved looks</Link>}
            </div>
          )}
        </section>

        <aside className="tryon-side stack gap-20">
          <div className="panel stack gap-12">
            <div className="row between">
              <h2 className="h3">Wearing</h2>
              {items.length > 0 && <span className="price">{money(total)}</span>}
            </div>
            {items.length === 0 && <p className="small muted">Nothing yet. Choose a dress or kaftan set, or a top and bottom, below.</p>}
            {items.map((p) => (
              <div key={p.id} className="wearing">
                <GarmentImage product={p} />
                <div className="grow">
                  <Link to={`/product/${p.id}`} className="pname">{p.name}</Link>
                  <div className="small muted">{money(p.price)}{!p.garment && ' · styled with'}</div>
                </div>
                <RetailerButton product={p} className="btn text small" short />
                <button className="icon-btn" onClick={() => setItems(items.filter((x) => x.id !== p.id))} aria-label={`Remove ${p.name}`}><IconClose size={16} /></button>
              </div>
            ))}
          </div>

                <div id="tryon-pieces" className="panel stack gap-12">
            <h2 className="h3">Add a piece</h2>
            <div className="tabs">
              {tabs.map((t) => (
                <button key={t.key} className={shownTab === t.key ? 'on' : ''} onClick={() => setTab(t.key)}>{t.label}</button>
              ))}
            </div>
            <div className="picker">
              {choices.map((p) => {
                const on = items.some((x) => x.id === p.id);
                return (
                  <button key={p.id} className={`pick ${on ? 'on' : ''}`} onClick={() => setItems(on ? items.filter((x) => x.id !== p.id) : addPiece(items, p))} aria-pressed={on}>
                    <GarmentImage product={p} />
                    <span className="small">{p.name}</span>
                    <span className="small muted">{money(p.price)}</span>
                    {on && <span className="pick-check"><IconCheck size={12} /></span>}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

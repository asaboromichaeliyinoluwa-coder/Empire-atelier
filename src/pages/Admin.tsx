import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { Empty } from '../components/ui.tsx';
import { useAuth } from '../lib/auth.tsx';
import { preparePhoto, useShop } from '../lib/shop.tsx';
import { CATEGORIES } from '../shared/catalog.ts';
import type { ShopProduct } from '../shared/shop.ts';

const SIZE_SETS: Record<string, string[]> = {
  clothes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  shoes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
  waist: ['28', '30', '32', '34', '36', '38'],
  one: ['One size'],
};
const sizeSetFor = (cat: string) => (cat === 'shoes' ? SIZE_SETS.shoes : cat === 'bags' || cat === 'accessories' ? SIZE_SETS.one : SIZE_SETS.clothes);

type Draft = {
  id?: string; name: string; category: ShopProduct['category']; gender: ShopProduct['gender']; price: string; was: string; description: string; material: string;
  colorName: string; colorHex: string; sizes: string[]; photos: string[]; url: string; tryOn: boolean; group: string; createdAt?: number;
};
const blank = (): Draft => ({ name: '', category: 'tops', gender: 'unisex', price: '', was: '', description: '', material: '', colorName: '', colorHex: '#222222', sizes: [], photos: [], url: '', tryOn: false, group: '' });
const fromProduct = (p: ShopProduct): Draft => ({ ...blank(), ...p, price: String(p.price), was: p.was ? String(p.was) : '', url: p.url ?? '', group: p.group ?? '' });

export default function Admin() {
  const { user, mode } = useAuth();
  const shop = useShop();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  if (shop.loading) return <div className="container"><div className="spinner" /></div>;

  // Server mode needs a signed-in account; device mode (preview) just works on this device.
  if (shop.where === 'server' && (!user || mode !== 'server')) {
    return (
      <div className="container narrow">
        <Empty title="Sign in to manage your products">
          <p className="small muted">Create an account (or sign in), then come back here. The first account to claim the shop becomes its owner.</p>
          <Link to="/account" className="btn primary small">Sign in or create account</Link>
        </Empty>
      </div>
    );
  }
  if (shop.where === 'server' && shop.owner && !shop.owner.owner) {
    return (
      <div className="container narrow">
        <Empty title={shop.owner.canClaim ? 'Claim this shop' : 'Only the shop owner can edit products'}>
          {shop.owner.canClaim ? (
            <>
              <p className="small muted">No one owns this shop yet. Claim it with your account to add your own products and photos. Do this first, before anyone else signs up.</p>
              <button className="btn primary small" onClick={() => shop.claim().catch((e) => setError(e.message))}>Make me the shop owner</button>
              {error && <div className="error">{error}</div>}
            </>
          ) : (
            <p className="small muted">You are signed in, but this account is not the owner. Sign in with the owner’s account, or add its email to <code>ADMIN_EMAILS</code> on the server.</p>
          )}
        </Empty>
      </div>
    );
  }

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length || !draft) return;
    setBusy(true); setError('');
    try {
      const urls = await Promise.all([...files].slice(0, 8 - draft.photos.length).map((f) => preparePhoto(f)));
      setDraft((d) => (d ? { ...d, photos: [...d.photos, ...urls] } : d));
    } catch {
      setError('One of those files could not be read as a photo. Use JPG, PNG or WebP.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const save = async () => {
    if (!draft) return;
    setError('');
    const price = Number(draft.price), was = Number(draft.was);
    if (!draft.name.trim()) return setError('Give the product a name.');
    if (!(price > 0)) return setError('Enter a price above 0.');
    if (!draft.photos.length) return setError('Add at least one photo.');
    setBusy(true);
    try {
      await shop.saveProduct({
        id: draft.id, name: draft.name.trim(), category: draft.category, gender: draft.gender, price, ...(was > price ? { was } : {}),
        description: draft.description.trim(), material: draft.material.trim(), colorName: draft.colorName.trim() || 'Default', colorHex: draft.colorHex,
        sizes: draft.sizes, photos: draft.photos, ...(draft.url.trim() ? { url: draft.url.trim() } : {}), tryOn: draft.tryOn, ...(draft.group.trim() ? { group: draft.group.trim() } : {}),
        createdAt: draft.createdAt,
      });
      setNotice(`Saved “${draft.name.trim()}”. It is now in the shop.`);
      setDraft(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the product');
    } finally {
      setBusy(false);
    }
  };

  const [storeEdit, setStoreEdit] = useState(false);

  return (
    <div className="container stack gap-24 admin">
      <div className="page-head">
        <span className="eyebrow">Shop owner</span>
        <h1 className="h1">My products</h1>
        <p className="lead">Add your own items with real photos. They appear in the shop straight away, with a “Product photo” label.</p>
      </div>

      {shop.where === 'device' && (
        <div className="panel notice small">
          <b>Saved on this device only.</b> This version has no server, so your products stay in this browser. To publish them for every visitor, use the full app with a database (see MY-PRODUCTS.md), or download your file below as a backup.
        </div>
      )}
      {notice && <div className="panel notice small ok" role="status">{notice}</div>}

      <section className="panel stack gap-12">
        <div className="row between wrap gap-12">
          <div>
            <b>{shop.settings.name}</b>
            <div className="small muted">{[shop.settings.city, shop.settings.contact, shop.settings.website].filter(Boolean).join(' · ') || 'Add your store name and how buyers reach you'}</div>
          </div>
          <div className="row gap-8 wrap">
            <button className="btn ghost small" onClick={() => setStoreEdit(!storeEdit)}>{storeEdit ? 'Close' : 'Edit store details'}</button>
            {shop.where === 'device' && shop.products.length > 0 && <button className="btn ghost small" onClick={shop.exportFile}>Download my products file</button>}
          </div>
        </div>
        {storeEdit && <StoreForm onDone={() => { setStoreEdit(false); setNotice('Store details saved.'); }} />}
      </section>

      {!draft && (
        <div className="row gap-12 wrap">
          <button className="btn primary" onClick={() => { setNotice(''); setDraft(blank()); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Add a product</button>
          {shop.products.length > 0 && <Link to="/shop" className="btn ghost">See it in the shop</Link>}
        </div>
      )}

      {draft && (
        <section className="panel stack gap-20 admin-form" aria-label="Product form">
          <h2 className="h3">{draft.id ? 'Edit product' : 'New product'}</h2>

          <div className="field">
            <label>Photos <small className="muted">The first photo is the main one. Up to 8. Use your own photos.</small></label>
            <div className="photo-row">
              {draft.photos.map((u, i) => (
                <figure key={u.slice(-24) + i} className={i === 0 ? 'main' : ''}>
                  <img src={u} alt={`Photo ${i + 1}`} />
                  <figcaption>
                    {i > 0 && <button type="button" onClick={() => set('photos', [u, ...draft.photos.filter((_, j) => j !== i)])}>Make main</button>}
                    <button type="button" onClick={() => set('photos', draft.photos.filter((_, j) => j !== i))}>Remove</button>
                  </figcaption>
                </figure>
              ))}
              {draft.photos.length < 8 && (
                <label className="photo-add">
                  <input ref={fileRef} type="file" accept="image/*" multiple onChange={(e) => void addPhotos(e.target.files)} />
                  <span>{busy ? 'Preparing…' : '+ Add photos'}</span>
                </label>
              )}
            </div>
          </div>

          <div className="grid2">
            <div className="field"><label htmlFor="p-name">Name</label><input id="p-name" value={draft.name} maxLength={90} onChange={(e) => set('name', e.target.value)} placeholder="Ribbed tank, black" /></div>
            <div className="field">
              <label htmlFor="p-cat">Category</label>
              <select id="p-cat" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as Draft['category'], sizes: [] })}>
                {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="p-for">Made for</label>
              <select id="p-for" value={draft.gender} onChange={(e) => set('gender', e.target.value as Draft['gender'])}>
                <option value="women">Women</option><option value="men">Men</option><option value="unisex">Women and men</option>
              </select>
            </div>
            <div className="field"><label htmlFor="p-price">Price (US $)</label><input id="p-price" inputMode="decimal" value={draft.price} onChange={(e) => set('price', e.target.value)} placeholder="54" /></div>
            <div className="field"><label htmlFor="p-was">Old price, if on sale <small className="muted">optional</small></label><input id="p-was" inputMode="decimal" value={draft.was} onChange={(e) => set('was', e.target.value)} placeholder="70" /></div>
            <div className="field"><label htmlFor="p-mat">Material <small className="muted">optional</small></label><input id="p-mat" value={draft.material} onChange={(e) => set('material', e.target.value)} placeholder="Cotton rib" /></div>
            <div className="field">
              <label htmlFor="p-col">Colour</label>
              <div className="row gap-8"><input type="color" aria-label="Colour swatch" value={draft.colorHex} onChange={(e) => set('colorHex', e.target.value)} /><input id="p-col" value={draft.colorName} onChange={(e) => set('colorName', e.target.value)} placeholder="Black" /></div>
            </div>
            <div className="field"><label htmlFor="p-grp">Colour group <small className="muted">same word on each colour of one item</small></label><input id="p-grp" value={draft.group} onChange={(e) => set('group', e.target.value)} placeholder="rib-tank" /></div>
          </div>

          <div className="field">
            <label>Sizes you have</label>
            <div className="chips">
              {sizeSetFor(draft.category).concat(draft.category === 'bottoms' ? SIZE_SETS.waist : []).map((s) => (
                <button key={s} type="button" className={`chip ${draft.sizes.includes(s) ? 'on' : ''}`} onClick={() => set('sizes', draft.sizes.includes(s) ? draft.sizes.filter((x) => x !== s) : [...draft.sizes, s])}>{s}</button>
              ))}
            </div>
          </div>

          <div className="field"><label htmlFor="p-desc">Description</label><textarea id="p-desc" rows={4} maxLength={1200} value={draft.description} onChange={(e) => set('description', e.target.value)} placeholder="Fit, feel, care, what makes it special." /></div>
          <div className="field"><label htmlFor="p-url">Where people buy it <small className="muted">your WhatsApp, Instagram or website link. Optional</small></label><input id="p-url" value={draft.url} onChange={(e) => set('url', e.target.value)} placeholder="https://wa.me/234…" /></div>
          {['tops', 'bottoms', 'dresses', 'sets', 'outerwear'].includes(draft.category) && (
            <label className="switch"><input type="checkbox" checked={draft.tryOn} onChange={(e) => set('tryOn', e.target.checked)} /><span /> Offer virtual try-on <small className="muted">best with a clean photo of the item on a plain background</small></label>
          )}

          {error && <div className="error" role="alert">{error}</div>}
          <div className="row gap-12 wrap">
            <button className="btn primary" onClick={() => void save()} disabled={busy}>{busy ? 'Saving…' : 'Save product'}</button>
            <button className="btn text" onClick={() => { setDraft(null); setError(''); }}>Cancel</button>
          </div>
        </section>
      )}

      <section className="stack gap-12">
        <h2 className="h3">Your products ({shop.products.length})</h2>
        {shop.products.length === 0 ? (
          <Empty title="No products yet"><p className="small muted">Tap “Add a product”, upload a photo, set the price and save. It shows in the shop right away.</p></Empty>
        ) : (
          <div className="admin-list">
            {shop.products.map((p) => (
              <article key={p.id} className="panel admin-item">
                <img src={p.photos[0]} alt={p.name} />
                <div className="stack gap-4">
                  <b>{p.name}</b>
                  <span className="small muted">{CATEGORIES.find((c) => c.key === p.category)?.label} · ${p.price}{p.was ? ` (was $${p.was})` : ''} · {p.colorName}</span>
                  <span className="small muted">{p.sizes.join(', ')}</span>
                </div>
                <div className="row gap-8 wrap">
                  <Link className="btn ghost small" to={`/product/my-${p.id}`}>View</Link>
                  <button className="btn ghost small" onClick={() => { setNotice(''); setDraft(fromProduct(p)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit</button>
                  <button className="btn text small" onClick={() => { if (confirm(`Delete “${p.name}”?`)) void shop.removeProduct(p.id).then(() => setNotice('Product deleted.')).catch((e) => setError(e.message)); }}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StoreForm({ onDone }: { onDone: () => void }) {
  const shop = useShop();
  const [s, setS] = useState(shop.settings);
  const [err, setErr] = useState('');
  return (
    <div className="stack gap-12">
      <div className="grid2">
        <div className="field"><label htmlFor="s-name">Store name</label><input id="s-name" value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} /></div>
        <div className="field"><label htmlFor="s-city">City</label><input id="s-city" value={s.city} onChange={(e) => setS({ ...s, city: e.target.value })} /></div>
        <div className="field"><label htmlFor="s-web">Website or shop link</label><input id="s-web" value={s.website} onChange={(e) => setS({ ...s, website: e.target.value })} placeholder="https://…" /></div>
        <div className="field"><label htmlFor="s-con">How buyers reach you</label><input id="s-con" value={s.contact} onChange={(e) => setS({ ...s, contact: e.target.value })} placeholder="WhatsApp +234…" /></div>
      </div>
      {err && <div className="error" role="alert">{err}</div>}
      <div><button className="btn primary small" onClick={() => shop.saveSettings(s).then(onDone).catch((e) => setErr(e.message))}>Save store details</button></div>
    </div>
  );
}

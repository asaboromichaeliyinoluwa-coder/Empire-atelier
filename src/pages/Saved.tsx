import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { IconSparkle, IconTrash } from '../components/icons.tsx';
import { Collage, Empty, money, ProductCard } from '../components/ui.tsx';
import { useApp } from '../lib/store.tsx';
import { productById, type Product } from '../shared/catalog.ts';

export default function Saved() {
  const { looks, favorites, removeLook, updateLook } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'looks' | 'pieces'>(looks.length || !favorites.length ? 'looks' : 'pieces');
  const pieces = favorites.map(productById).filter(Boolean) as Product[];

  return (
    <div className="container stack gap-24">
      <div className="page-head">
        <span className="eyebrow">Your wardrobe wishlist</span>
        <div className="row between wrap gap-12">
          <h1 className="h1">Saved</h1>
          <Link to="/report" className="btn ghost small">Download my style report (PDF)</Link>
        </div>
      </div>
      <div className="tabs big">
        <button className={tab === 'looks' ? 'on' : ''} onClick={() => setTab('looks')}>Looks ({looks.length})</button>
        <button className={tab === 'pieces' ? 'on' : ''} onClick={() => setTab('pieces')}>Pieces ({pieces.length})</button>
      </div>

      {tab === 'looks' &&
        (looks.length ? (
          <div className="look-grid">
            {looks.map((l) => {
              const items = l.itemIds.map(productById).filter(Boolean) as Product[];
              return (
                <article key={l.id} className="look-card">
                  <Link to={`/look?items=${l.itemIds.join(',')}&name=${encodeURIComponent(l.name)}${l.occasion ? `&occasion=${l.occasion}` : ''}`}>
                    <Collage itemIds={l.itemIds} image={l.image} />
                  </Link>
                  <div className="look-body">
                    <div className="row between">
                      <span className="eyebrow">Saved {new Date(l.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                      <span className="price">{money(items.reduce((s, p) => s + p.price, 0))}</span>
                    </div>
                    <input className="look-name" value={l.name} onChange={(e) => updateLook(l.id, { name: e.target.value })} aria-label="Look name" />
                    <div className="small muted">{items.map((p) => p.name).join(' · ')}</div>
                    <div className="row gap-8">
                      {items.some((p) => p.garment) && (
                        <button className="btn small primary" onClick={() => navigate(`/try-on?items=${l.itemIds.join(',')}`)}><IconSparkle size={14} /> Try on</button>
                      )}
                      <button className="btn small ghost" onClick={() => removeLook(l.id)}><IconTrash size={14} /> Remove</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <Empty title="No saved looks yet">
            <p className="small muted">Save an outfit suggestion or a try-on and it will wait for you here.</p>
            <div className="row gap-8"><Link to="/outfits" className="btn small primary">Browse outfits</Link><Link to="/try-on" className="btn small ghost">Try something on</Link></div>
          </Empty>
        ))}

      {tab === 'pieces' &&
        (pieces.length ? (
          <div className="product-grid">{pieces.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>
        ) : (
          <Empty title="No favourite pieces yet">
            <p className="small muted">Tap the heart on anything you like.</p>
            <Link to="/shop" className="btn small primary">Go to the shop</Link>
          </Empty>
        ))}
    </div>
  );
}

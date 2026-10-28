import { Link, useNavigate } from 'react-router-dom';

import { IconCheck, IconHeart, IconSparkle, IconTrash } from '../components/icons.tsx';
import { Empty, GarmentImage, money, Price, RetailerButton, SellerBadge } from '../components/ui.tsx';
import { useApp } from '../lib/store.tsx';
import { productById, SELLERS, type Product } from '../shared/catalog.ts';

/**
 * The shopping bag. Empire Atelier doesn't take payment: each seller's pieces are bought on
 * that seller's own shop, so the bag groups them by seller with a buy link for every piece.
 */
export default function Bag() {
  const { bag, toggleBag, saveLook, isLookSaved } = useApp();
  const navigate = useNavigate();
  const items = bag.map(productById).filter(Boolean) as Product[];
  const total = items.reduce((s, p) => s + p.price, 0);
  const savings = items.reduce((s, p) => s + (p.was ? p.was - p.price : 0), 0);
  const groups = SELLERS.map((s) => ({ seller: s, items: items.filter((p) => p.sellerId === s.id) })).filter((g) => g.items.length);
  const wearable = items.filter((p) => p.garment);
  const saved = items.length > 1 && isLookSaved(items.map((p) => p.id));

  return (
    <div className="container stack gap-24">
      <div className="page-head">
        <span className="eyebrow">Shopping bag</span>
        <h1 className="h1">Your bag</h1>
        <p className="lead">Every piece is sold by an independent boutique. Buy each one on its seller’s own shop, tagged so they know Empire Glamour sent you.</p>
      </div>

      {items.length ? (
        <div className="bag">
          <div className="stack gap-20">
            {groups.map(({ seller, items: list }) => (
              <section key={seller.id} className="panel bag-group stack gap-12">
                <div className="row between wrap gap-8">
                  <SellerBadge sellerId={seller.id} />
                  <span className="small muted">{seller.delivery}</span>
                </div>
                {list.map((p) => (
                  <div key={p.id} className="bag-line">
                    <Link to={`/product/${p.id}`} className="bag-thumb"><GarmentImage product={p} /></Link>
                    <div className="grow stack gap-4">
                      <Link to={`/product/${p.id}`} className="pname">{p.name}</Link>
                      <span className="small muted">{p.color.name} · {p.material}</span>
                      <Price product={p} />
                    </div>
                    <div className="bag-actions">
                      <RetailerButton product={p} className="btn primary small" short />
                      <button className="icon-btn" onClick={() => toggleBag(p.id)} aria-label={`Remove ${p.name}`}><IconTrash size={17} /></button>
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </div>

          <aside className="panel bag-summary stack gap-16">
            <h2 className="h3">Summary</h2>
            <div className="row between"><span>{items.length} {items.length === 1 ? 'piece' : 'pieces'}</span><b>{money(total)}</b></div>
            {savings > 0 && <div className="row between small"><span>Sale savings</span><span className="sale-text">−{money(savings)}</span></div>}
            <div className="row between small muted"><span>Sellers</span><span>{groups.length}</span></div>
            <p className="small muted">Delivery and returns are set by each seller and shown above.</p>
            {wearable.length > 0 && (
              <button className="btn primary" onClick={() => navigate(`/try-on?items=${items.map((p) => p.id).join(',')}`)}>
                <IconSparkle size={16} /> Try the whole bag on
              </button>
            )}
            {items.length > 1 && (
              <button className={`btn ghost ${saved ? 'on' : ''}`} onClick={() => !saved && saveLook({ name: `My bag: ${items[0].name}`, itemIds: items.map((p) => p.id) })}>
                {saved ? <><IconCheck size={15} /> Saved as a look</> : <><IconHeart size={15} /> Save as a look</>}
              </button>
            )}
          </aside>
        </div>
      ) : (
        <Empty title="Your bag is empty">
          <p className="small muted">Add pieces from any product page, then buy them from each boutique in one place.</p>
          <Link to="/shop?new=1" className="btn primary small">Shop new in</Link>
        </Empty>
      )}
    </div>
  );
}

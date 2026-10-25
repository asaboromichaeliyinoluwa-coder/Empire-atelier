import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { IconCheck, IconHeart, IconSparkle } from '../components/icons.tsx';
import { Collage, Empty, GarmentImage, money, RetailerButton } from '../components/ui.tsx';
import { useApp } from '../lib/store.tsx';
import { OCCASIONS, productById, sellerById, type Occasion, type Product } from '../shared/catalog.ts';

export default function LookPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { saveLook, isLookSaved, removeLook } = useApp();
  const items = (params.get('items')?.split(',') ?? []).map(productById).filter(Boolean) as Product[];
  const name = params.get('name') || 'Your look';
  const occasion = (params.get('occasion') || undefined) as Occasion | undefined;
  if (!items.length) return <div className="container"><Empty title="This look is empty"><Link to="/outfits" className="btn ghost small">See outfits</Link></Empty></div>;

  const ids = items.map((p) => p.id);
  const saved = isLookSaved(ids);
  const total = items.reduce((s, p) => s + p.price, 0);
  const sellers = new Set(items.map((p) => p.sellerId));

  return (
    <div className="container">
      <section className="product">
        <div className="product-media panel">
          <Collage itemIds={ids} image={saved?.image} />
        </div>
        <div className="product-info stack gap-20">
          <span className="eyebrow">{OCCASIONS.find((o) => o.key === occasion)?.label ?? 'Outfit'}</span>
          <h1 className="h1">{saved?.name ?? name}</h1>
          <div className="row gap-12">
            <span className="price large">{money(total)}</span>
            <span className="small muted">{items.length} pieces from {sellers.size} {sellers.size === 1 ? 'seller' : 'sellers'}</span>
          </div>
          <div className="row gap-12 wrap">
            {items.some((p) => p.garment) && (
              <button className="btn primary" onClick={() => navigate(`/try-on?items=${ids.join(',')}`)}><IconSparkle size={16} /> Try on this look</button>
            )}
            <button className={`btn ghost ${saved ? 'on' : ''}`} onClick={() => (saved ? removeLook(saved.id) : saveLook({ name, itemIds: ids, occasion }))}>
              {saved ? <><IconCheck size={16} /> Saved</> : <><IconHeart size={16} /> Save look</>}
            </button>
          </div>
          <div className="stack gap-12">
            {items.map((p) => (
              <div key={p.id} className="wearing panel">
                <GarmentImage product={p} />
                <div className="grow">
                  <Link to={`/product/${p.id}`} className="pname">{p.name}</Link>
                  <div className="small muted">{sellerById(p.sellerId)!.name} · {money(p.price)}</div>
                </div>
                <RetailerButton product={p} className="btn ghost small" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

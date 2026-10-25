import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { IconSparkle } from '../components/icons.tsx';
import { Empty, GarmentImage, HeartButton, LookCard, Price, ProductCard, RetailerButton, SellerBadge } from '../components/ui.tsx';
import { useApp } from '../lib/store.tsx';
import { COLORS, OCCASIONS, PRODUCTS, productById, sellerById, STYLES } from '../shared/catalog.ts';
import { suggestOutfits } from '../shared/outfits.ts';

export default function ProductPage() {
  const { id = '' } = useParams();
  const product = productById(id);
  const navigate = useNavigate();
  const { prefs } = useApp();
  const [size, setSize] = useState<string>();

  const outfits = useMemo(
    () => (product ? suggestOutfits({ ...prefs, department: 'all', budget: [0, 10_000] }, { include: product.id, limit: 3 }) : []),
    [product, prefs],
  );

  if (!product) return <div className="container"><Empty title="This piece is no longer available"><Link to="/shop" className="btn ghost small">Back to the shop</Link></Empty></div>;
  const seller = sellerById(product.sellerId)!;
  const similar = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category && (p.gender === product.gender || p.gender === 'unisex' || product.gender === 'unisex')).slice(0, 4);
  const label = <T extends string>(list: { key: T; label: string }[], k: T) => list.find((x) => x.key === k)?.label;

  return (
    <div className="container stack gap-48">
      <section className="product">
        <div className="product-media panel">
          <GarmentImage product={product} className="large" />
          <HeartButton id={product.id} className="product-heart" />
        </div>
        <div className="product-info stack gap-20">
          <Link to={`/sellers/${seller.id}`} className="eyebrow">{seller.name}</Link>
          <h1 className="h1">{product.name}</h1>
          <Price product={product} />
          <p className="lead">{product.description}</p>

          <div className="specs">
            <div><span>Colour</span><b><i className="dot-swatch" style={{ background: product.color.hex }} /> {product.color.name}</b></div>
            <div><span>Material</span><b>{product.material}</b></div>
            <div><span>Style</span><b>{product.styles.map((s) => label(STYLES, s)).join(', ')}</b></div>
            <div><span>Wear it to</span><b>{product.occasions.map((o) => label(OCCASIONS, o)).join(', ')}</b></div>
            <div><span>Colour family</span><b>{label(COLORS, product.color.family)}</b></div>
            <div><span>Department</span><b>{product.gender === 'unisex' ? 'Women & men' : product.gender === 'men' ? 'Menswear' : 'Womenswear'}</b></div>
          </div>

          <div className="stack gap-8">
            <span className="small muted">Size</span>
            <div className="chips">
              {product.sizes.map((s) => (
                <button key={s} className={`chip ${size === s ? 'on' : ''}`} onClick={() => setSize(s)}>{s}</button>
              ))}
            </div>
          </div>

          <div className="row gap-12 wrap">
            {product.garment && (
              <button className="btn primary" onClick={() => navigate(`/try-on?items=${product.id}`)}>
                <IconSparkle size={16} /> Try it on
              </button>
            )}
            <RetailerButton product={product} className={product.garment ? 'btn ghost' : 'btn primary'} />
          </div>

          <div className="panel seller-card stack gap-12">
            <SellerBadge sellerId={seller.id} />
            <div className="small">{seller.about}</div>
            <div className="seller-facts small">
              <span><b>Delivery</b> {seller.delivery}</span>
              <span><b>Returns</b> {seller.returns}</span>
              <span><b>Selling since</b> {seller.since}</span>
            </div>
          </div>
        </div>
      </section>

      {outfits.length > 0 && (
        <section className="stack gap-20">
          <div className="section-head"><div><span className="eyebrow">Style it</span><h2 className="h2">Complete the look</h2></div></div>
          <div className="look-grid">{outfits.map((o, i) => <LookCard key={o.id} outfit={o} index={i} />)}</div>
        </section>
      )}

      {similar.length > 0 && (
        <section className="stack gap-20">
          <div className="section-head"><div><span className="eyebrow">You may also like</span><h2 className="h2">More {product.category}</h2></div></div>
          <div className="product-scroller">{similar.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>
        </section>
      )}
    </div>
  );
}

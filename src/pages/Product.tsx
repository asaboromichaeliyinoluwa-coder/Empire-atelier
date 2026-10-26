import { useMemo, useState } from 'react';
import { productArt, productView } from '../lib/art.ts';
import { usePhoto } from '../lib/photos.ts';
import { HOUSE_IDS, specsFor } from '../shared/luxury.ts';
import type { View } from '../shared/garments.ts';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { IconCalendar, IconLeaf, IconSparkle, IconStore, IconUser } from '../components/icons.tsx';
import { BagButton, Empty, HeartButton, LookCard, Price, ProductCard, RetailerButton, SellerBadge } from '../components/ui.tsx';
import { useApp } from '../lib/store.tsx';
import { colourways, MAISON_NOTE, OCCASIONS, PRODUCTS, productById, sellerById, STYLES, type Product } from '../shared/catalog.ts';
import { suggestOutfits } from '../shared/outfits.ts';

const VIEWS: { key: View; label: string }[] = [
  { key: 'front', label: 'Front' },
  { key: 'detail', label: 'Close-up' },
  { key: 'back', label: 'Back' },
  { key: 'swatch', label: 'Material' },
];

/** The gallery: the product from four angles, with a hover zoom. Illustrations are labelled as such. */
function PhotoGallery({ product }: { product: Product }) {
  const [photo, setPhoto] = useState(0);
  const [zoomP, setZoomP] = useState<{ x: number; y: number } | null>(null);
  const images = product.images ?? [];
  return (
      <div className="gallery">
        <div className="gallery-thumbs" role="tablist" aria-label="Photos">
          {images.map((u, i) => (
            <button key={u} role="tab" aria-selected={photo === i} className={photo === i ? 'on' : ''} onClick={() => setPhoto(i)}>
              <img src={u} alt="" draggable={false} /><span>{i + 1}</span>
            </button>
          ))}
        </div>
        <div
          className="gallery-stage photo"
          onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setZoomP({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}
          onPointerLeave={() => setZoomP(null)}
        >
          <img key={photo} src={images[photo]} alt={`${product.name}, photo ${photo + 1}`} draggable={false} style={zoomP ? { transform: 'scale(1.9)', transformOrigin: `${zoomP.x}% ${zoomP.y}%` } : undefined} />
          <span className="gallery-badge">Product photo</span>
        </div>
      </div>
  );
}

function Gallery({ product }: { product: Product }) {
  const [view, setView] = useState<View>('front');
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const shots = { front: usePhoto(product.id, 'front'), detail: usePhoto(product.id, 'detail'), back: usePhoto(product.id, 'back'), swatch: usePhoto(product.id, 'swatch') };
  const src = (v: View) => shots[v] ?? (v === 'front' ? productArt(product) : productView(product, v));
  const photographed = !!shots.front;
  return (
    <div className="gallery">
      <div className="gallery-thumbs" role="tablist" aria-label="Views">
        {VIEWS.map((v) => (
          <button key={v.key} role="tab" aria-selected={view === v.key} className={view === v.key ? 'on' : ''} onClick={() => setView(v.key)}>
            <img src={src(v.key)} alt="" draggable={false} />
            <span>{v.label}</span>
          </button>
        ))}
      </div>
      <div
        className="gallery-stage"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onPointerLeave={() => setZoom(null)}
      >
        <img
          key={view}
          src={src(view)}
          alt={`${product.name}, ${VIEWS.find((v) => v.key === view)?.label.toLowerCase()} view`}
          draggable={false}
          style={zoom ? { transform: 'scale(1.7)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
        />
        <span className="gallery-badge">{photographed ? 'Studio render, not a photograph of a real item' : 'Original render or illustration, not a photograph'}</span>
      </div>
    </div>
  );
}

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
          {product.images?.length ? <PhotoGallery key={product.id} product={product} /> : <Gallery key={product.id} product={product} />}
          <HeartButton id={product.id} className="product-heart" />
        </div>
        <div className="product-info stack gap-20">
          <Link to={`/sellers/${seller.id}`} className="eyebrow">{seller.name}</Link>
          <h1 className="h1">{product.name}</h1>
          <Price product={product} />
          <div className="story">
            <span className="story-mark" aria-hidden>“</span>
            <p>{product.description}</p>
            <span className="story-sign">{product.custom ? [seller.name, seller.city].filter(Boolean).join(', ') : `The ${seller.name} atelier, ${seller.city}`}</span>
          </div>
          {HOUSE_IDS.includes(product.sellerId) && <p className="maison-note small">{MAISON_NOTE}</p>}

          <ul className="specs">{specsFor(product).map((l) => <li key={l}>{l}</li>)}</ul>

          <div className="detail-tiles">
            <div className="detail"><span className="detail-icon"><IconLeaf size={17} /></span><span><small>Material</small><b>{product.material}</b></span></div>
            <div className="detail"><span className="detail-icon swatch-icon" style={{ background: product.color.hex }} /><span><small>Colour</small><b>{product.color.name}</b></span></div>
            <div className="detail"><span className="detail-icon"><IconSparkle size={17} /></span><span><small>Style</small><b>{product.styles.map((st) => label(STYLES, st)).join(', ')}</b></span></div>
            <div className="detail"><span className="detail-icon"><IconCalendar size={17} /></span><span><small>Wear it to</small><b>{product.occasions.map((o) => label(OCCASIONS, o)).join(', ')}</b></span></div>
            <div className="detail"><span className="detail-icon"><IconUser size={17} /></span><span><small>Cut for</small><b>{product.gender === 'unisex' ? 'Women & men' : product.gender === 'men' ? 'Menswear' : 'Womenswear'}</b></span></div>
            <div className="detail"><span className="detail-icon"><IconStore size={17} /></span><span><small>Delivery</small><b>{seller.delivery.split(',')[0]}</b></span></div>
          </div>

          {colourways(product).length > 1 && (
            <div className="stack gap-8">
              <span className="small muted">Colour: {product.color.name}</span>
              <div className="pcard-swatches big">
                {colourways(product).map((w) => (
                  <Link key={w.id} to={`/product/${w.id}`} replace className={w.id === product.id ? 'on' : ''} style={{ background: w.color.hex }} title={w.color.name} aria-label={w.color.name} />
                ))}
              </div>
            </div>
          )}

          <div className="stack gap-8">
            <span className="small muted">{size ? `Size: ${size}` : product.sizes.length > 1 ? 'Select a size' : 'Size'}</span>
            <div className="chips">
              {product.sizes.map((s) => (
                <button key={s} className={`chip ${size === s ? 'on' : ''}`} onClick={() => setSize(s)}>{s}</button>
              ))}
            </div>
          </div>

          <p className="try-note small">
            <IconSparkle size={14} />{' '}
            {product.garment
              ? 'Virtual try-on: an instant on-device preview, or a photo-real YouCam AI result when the server has a key. Results are labelled.'
              : 'Shown as an illustration. Virtual try-on is available for clothing; shoes, bags and accessories are not tried on.'}
          </p>
          <div className="row gap-12 wrap">
            {product.garment && (
              <button className="btn primary" onClick={() => navigate(`/try-on?items=${product.id}`)}>
                <IconSparkle size={16} /> Try it on
              </button>
            )}
            <RetailerButton product={product} className={product.garment ? 'btn ghost' : 'btn primary'} />
            <BagButton product={product} />
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

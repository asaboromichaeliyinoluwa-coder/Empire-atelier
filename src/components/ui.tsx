import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { usePhoto } from '../lib/photos.ts';
import { productArt } from '../lib/art.ts';
import { fileToDataUrl } from '../lib/images.ts';
import { IS_PREVIEW } from '../lib/platform.ts';
import { useApp } from '../lib/store.tsx';
import {
  colourways, isDemoLink, OCCASIONS, productById, retailerUrl, sellerById, type Product,
} from '../shared/catalog.ts';
import type { Outfit } from '../shared/outfits.ts';
import { IconBag, IconCamera, IconCheck, IconClose, IconExternal, IconHeart, IconSparkle, IconStar, IconUpload } from './icons.tsx';

export const money = (n: number) => `$${n.toLocaleString('en-US')}`;

export function GarmentImage({ product, className = '' }: { product: Product; className?: string }) {
  const photo = usePhoto(product.id, className.includes('large') ? 'front' : 'thumb');
  return (
    <div className={`garment ${className} ${product.image || photo ? 'photo' : ''}`}>
      <img src={product.image ?? photo ?? productArt(product)} alt={product.name} loading="lazy" draggable={false} />
    </div>
  );
}

export function Price({ product }: { product: Product }) {
  return (
    <span className="price">
      {money(product.price)}
      {product.was && <s>{money(product.was)}</s>}
    </span>
  );
}

export function HeartButton({ id, className = '' }: { id: string; className?: string }) {
  const { favorites, toggleFavorite } = useApp();
  const on = favorites.includes(id);
  return (
    <motion.button
      className={`heart ${on ? 'on' : ''} ${className}`}
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(id);
      }}
      aria-label={on ? 'Remove from favourites' : 'Save to favourites'}
      aria-pressed={on}
    >
      <IconHeart size={18} filled={on} />
    </motion.button>
  );
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const ways = colourways(product).slice(0, 4);
  const [shown, setShown] = useState(product);
  const seller = sellerById(shown.sellerId)!;
  return (
    <motion.div
      className="pcard"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 12) * 0.03, duration: 0.4 }}
    >
      <Link to={`/product/${shown.id}`} className="pcard-link">
        <div className="pcard-media">
          <GarmentImage product={shown} />
          {shown.was && <span className="tag sale">−{Math.round((1 - shown.price / shown.was) * 100)}%</span>}
          {shown.garment && <span className="tag tryon"><IconSparkle size={12} /> Try on</span>}
        </div>
        <div className="pcard-body">
          <div className="seller-name">{seller.name}</div>
          <div className="pname">{shown.name}</div>
          <Price product={shown} />
        </div>
      </Link>
      {ways.length > 1 && (
        <div className="pcard-swatches" role="group" aria-label="Colours">
          {ways.map((w) => (
            <button
              key={w.id}
              className={w.id === shown.id ? 'on' : ''}
              style={{ background: w.color.hex }}
              onClick={() => setShown(w)}
              title={w.color.name}
              aria-label={w.color.name}
              aria-pressed={w.id === shown.id}
            />
          ))}
        </div>
      )}
      <HeartButton id={shown.id} className="pcard-heart" />
    </motion.div>
  );
}

/** Adds a piece to the shopping bag, or takes it out. */
export function BagButton({ product, className = 'btn ghost' }: { product: Product; className?: string }) {
  const { bag, toggleBag } = useApp();
  const inBag = bag.includes(product.id);
  return (
    <button className={`${className} ${inBag ? 'on' : ''}`} onClick={() => toggleBag(product.id)} aria-pressed={inBag}>
      {inBag ? <><IconCheck size={15} /> In your bag</> : <><IconBag size={15} /> Add to bag</>}
    </button>
  );
}

/** Opens a seller's page; demo sellers explain that their links are placeholders. */
export function OutboundLink({ url, sellerName, className = 'btn primary', children }: { url: string; sellerName: string; className?: string; children: React.ReactNode }) {
  const [demo, setDemo] = useState(false);
  return (
    <>
      <a
        className={className}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          if (isDemoLink(url)) {
            e.preventDefault();
            setDemo(true);
          }
        }}
      >
        {children} <IconExternal size={15} />
      </a>
      <Dialog open={demo} onClose={() => setDemo(false)} title={`${sellerName} is a demo seller`}>
        <p>
          This button sends shoppers to the seller’s own shop, tagged so the seller can see the
          referral came from Empire Atelier.
        </p>
        <p className="muted small">
          The link it would open: <code>{url}</code>. Replace the demo sellers’ website addresses in{' '}
          <code>src/shared/catalog.ts</code> with real participating stores and this opens their shop.
        </p>
      </Dialog>
    </>
  );
}

export function RetailerButton({ product, className, short }: { product: Product; className?: string; short?: boolean }) {
  const seller = sellerById(product.sellerId)!;
  // A shop owner's product with no link: buyers are told how to reach the seller instead.
  if (product.custom && !product.url && seller.website.includes('my-store.example.com')) return <span className="small muted">{seller.delivery}</span>;
  return (
    <OutboundLink url={retailerUrl(product)} sellerName={seller.name} className={className}>
      {short ? 'Buy' : `Buy at ${seller.name}`}
    </OutboundLink>
  );
}

export function SellerBadge({ sellerId }: { sellerId: string }) {
  const s = sellerById(sellerId)!;
  return (
    <Link to={`/sellers/${s.id}`} className="seller-badge">
      <span className="monogram">{s.name.split(' ').map((w) => w[0]).filter((c) => /[A-Z]/.test(c)).slice(0, 2).join('')}</span>
      <span>
        <b>{s.name}</b>
        <span className="muted small">
          {s.city}{s.reviews > 0 && <> · <IconStar size={11} className="gold" /> {s.rating} ({s.reviews.toLocaleString()})</>}
        </span>
      </span>
    </Link>
  );
}

export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="dialog"
            role="dialog"
            aria-modal
            aria-label={title}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="row between">
              <h3 className="h3">{title}</h3>
              <button className="icon-btn" onClick={onClose} aria-label="Close"><IconClose size={18} /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** The pieces of a look laid out as a flat-lay. */
export function Collage({ itemIds, image }: { itemIds: string[]; image?: string }) {
  const items = itemIds.map(productById).filter(Boolean) as Product[];
  if (image) return <div className="collage photo"><img src={image} alt="" /></div>;
  return (
    <div className={`collage n${Math.min(items.length, 5)}`}>
      {items.slice(0, 5).map((p) => (
        <GarmentImage key={p.id} product={p} />
      ))}
    </div>
  );
}

export function LookCard({ outfit, index = 0 }: { outfit: Outfit; index?: number }) {
  const { saveLook, isLookSaved, removeLook } = useApp();
  const navigate = useNavigate();
  const saved = isLookSaved(outfit.itemIds);
  const occasion = OCCASIONS.find((o) => o.key === outfit.occasion)?.label;
  const canTry = outfit.itemIds.some((id) => productById(id)?.garment);
  return (
    <motion.article
      className="look-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.05, duration: 0.45 }}
    >
      <Link to={`/look?items=${outfit.itemIds.join(',')}&name=${encodeURIComponent(outfit.name)}&occasion=${outfit.occasion}`}>
        <Collage itemIds={outfit.itemIds} />
      </Link>
      <div className="look-body">
        <div className="row between">
          <span className="eyebrow">{outfit.curated ? 'Editors’ pick' : occasion}</span>
          <span className="price">{money(outfit.total)}</span>
        </div>
        <h3 className="h3">{outfit.name}</h3>
        <div className="reasons">
          {outfit.reasons.map((r) => (
            <span key={r}>{r}</span>
          ))}
        </div>
        <div className="row gap-8">
          {canTry && (
            <button className="btn small primary" onClick={() => navigate(`/try-on?items=${outfit.itemIds.join(',')}`)}>
              <IconSparkle size={14} /> Try on
            </button>
          )}
          <button
            className={`btn small ${saved ? 'ghost on' : 'ghost'}`}
            onClick={() => (saved ? removeLook(saved.id) : saveLook({ name: outfit.name, itemIds: outfit.itemIds, occasion: outfit.occasion }))}
          >
            {saved ? <><IconCheck size={14} /> Saved</> : <><IconHeart size={14} /> Save look</>}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

/** Two-thumb price slider. */
export function PriceRange({ value, max, onChange }: { value: [number, number]; max: number; onChange: (v: [number, number]) => void }) {
  const [lo, hi] = value;
  const pct = (n: number) => (n / max) * 100;
  return (
    <div className="range">
      <div className="range-track">
        <div className="range-fill" style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} />
      </div>
      <input type="range" min={0} max={max} step={5} value={lo} aria-label="Minimum price"
        onChange={(e) => onChange([Math.min(Number(e.target.value), hi - 5), hi])} />
      <input type="range" min={0} max={max} step={5} value={hi} aria-label="Maximum price"
        onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + 5)])} />
      <div className="row between small"><span>{money(lo)}</span><span>{hi >= max ? `${money(max)}+` : money(hi)}</span></div>
    </div>
  );
}

/** Upload a photo, or (outside the hosted preview) take one with the camera. */
export function PhotoPicker({ onPhoto }: { onPhoto: (dataUrl: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>();
  const [stream, setStream] = useState<MediaStream>();

  const onFile = async (f?: File) => {
    if (!f) return;
    setError(undefined);
    if (!f.type.startsWith('image/')) return setError('Please choose an image file.');
    try {
      onPhoto(await fileToDataUrl(f));
    } catch {
      setError('That image could not be read. Try a JPEG or PNG.');
    }
  };

  const startCamera = async () => {
    setError(undefined);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', height: { ideal: 1280 } } });
      setStream(s);
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = s;
      });
    } catch {
      setError('The camera is unavailable. Allow camera access, or upload a photo instead.');
    }
  };

  const snap = () => {
    const v = videoRef.current!;
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext('2d')!;
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(v, 0, 0);
    stream?.getTracks().forEach((t) => t.stop());
    setStream(undefined);
    onPhoto(c.toDataURL('image/jpeg', 0.92));
  };

  if (stream) {
    return (
      <div className="stage">
        <video ref={videoRef} autoPlay playsInline muted className="mirror" />
        <div className="body-guide" aria-hidden />
        <div className="stage-actions">
          <button className="btn ghost" onClick={() => { stream.getTracks().forEach((t) => t.stop()); setStream(undefined); }}>Cancel</button>
          <button className="btn primary" onClick={snap}><IconCamera size={16} /> Take photo</button>
        </div>
      </div>
    );
  }

  return (
    <div className="stack gap-12">
      <button
        className="dropzone"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFile(e.dataTransfer.files[0]);
        }}
      >
        <IconUpload size={30} className="rose" />
        <span className="h3">Upload a full-length photo</span>
        <span className="small muted">Stand facing the camera, arms slightly away from your body, in fitted clothes and good light.</span>
      </button>
      {!IS_PREVIEW && (
        <button className="btn ghost" onClick={startCamera}><IconCamera size={16} /> Use my camera</button>
      )}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      {error && <div className="error">{error}</div>}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="empty panel">
      <div className="h3">{title}</div>
      {children}
    </div>
  );
}

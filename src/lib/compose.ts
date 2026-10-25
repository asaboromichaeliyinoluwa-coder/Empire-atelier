/**
 * Instant on-device try-on: tracks the body in the photo and draws each garment's artwork onto it.
 * Used in preview mode (no YouCam key), and as the first look while YouCam renders.
 */
import type { Product } from '../shared/catalog.ts';
import { artAnchors } from '../shared/garments.ts';
import { productArt } from './art.ts';
import { loadImage } from './images.ts';
import { detectBody, type Body, type Pt } from './pose.ts';

export type Fit = { size: number; lift: number };
export const DEFAULT_FIT: Fit = { size: 1, lift: 0 };

const mid = (a: Pt, b: Pt) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

/** Lower garments first so tops and layers sit over them. */
const LAYER = (p: Product) => (p.garment === 'lower_body' ? 0 : p.garment === 'full_body' ? 1 : p.category === 'outerwear' ? 3 : 2);

/** A rough standing figure, used when the body can't be found. */
function guessBody(w: number, h: number): Body {
  const cx = w / 2, sw = w * 0.17, hw = w * 0.1;
  return {
    shoulders: [{ x: cx - sw, y: h * 0.24 }, { x: cx + sw, y: h * 0.24 }],
    hips: [{ x: cx - hw, y: h * 0.52 }, { x: cx + hw, y: h * 0.52 }],
    ankles: [{ x: cx - hw, y: h * 0.92 }, { x: cx + hw, y: h * 0.92 }],
  };
}

const samples: Partial<Record<Figure, string>> = {};
const isSample = (img: HTMLImageElement) => Object.values(samples).includes(img.src);
/** The studio mannequin photo, womenswear or menswear figure (drawn once each). */
export const samplePhoto = (figure: Figure = 'women') => (samples[figure] ??= sampleModel(figure));
export const isSamplePhoto = (photo: string) => Object.values(samples).includes(photo);
export type Figure = 'women' | 'men';
/** The photo kept in the store: a mannequin by name ('sample' / 'sample:men') or the shopper's own. */
export const resolvePhoto = (stored?: string) =>
  stored === 'sample' ? samplePhoto('women') : stored === 'sample:men' ? samplePhoto('men') : stored;
export const photoKey = (photo: string) => (photo === samplePhoto('men') ? 'sample:men' : photo === samplePhoto('women') ? 'sample' : undefined);

export type Composite = { image: string; tracked: boolean };

let cache: { photo: string; body: Body | null } | undefined;

export async function composeTryOn(photo: string, products: Product[], fit: Fit = DEFAULT_FIT): Promise<Composite> {
  const img = await loadImage(photo);
  const W = img.naturalWidth, H = img.naturalHeight;
  if (cache?.photo !== photo) {
    let body: Body | null = null;
    try {
      // The sample mannequin is drawn to the guessed proportions.
      body = isSample(img) ? guessBody(W, H) : await detectBody(img);
    } catch {
      body = null;
    }
    cache = { photo, body };
  }
  const tracked = !!cache.body;
  const body = cache.body ?? guessBody(W, H);

  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  const shoulderW = dist(...body.shoulders);
  const torso = dist(mid(...body.shoulders), mid(...body.hips));
  // Taller-than-wide torsos (camera further away, slimmer build) stretch the art vertically.
  const stretch = Math.max(0.8, Math.min(1.35, torso / shoulderW / 1.35));

  for (const p of [...products].filter((p) => p.garment).sort((a, b) => LAYER(a) - LAYER(b))) {
    const art = await loadImage(productArt(p));
    const a = artAnchors(p.art);
    let from: [Pt, Pt], to: [Pt, Pt], sy: number;
    if (a.shoulders) {
      from = a.shoulders.map(([x, y]) => ({ x, y })) as [Pt, Pt];
      // Shoulder landmarks are the joints; the garment's shoulder seam sits a little outside.
      const s = 1.22 * fit.size;
      const m = mid(...body.shoulders);
      to = body.shoulders.map((q) => ({ x: m.x + (q.x - m.x) * s, y: m.y + (q.y - m.y) * s })) as [Pt, Pt];
      sy = stretch;
    } else {
      from = a.hips!.map(([x, y]) => ({ x, y })) as [Pt, Pt];
      // Hip landmarks are the joints; the outer hip line is roughly half as wide again.
      const s = 1.6 * fit.size;
      const m = mid(...body.hips);
      to = body.hips.map((q) => ({ x: m.x + (q.x - m.x) * s, y: m.y + (q.y - m.y) * s })) as [Pt, Pt];
      sy = 1;
      if (body.ankles) {
        const legPx = mid(...body.ankles).y - m.y;
        const sx = dist(...to) / dist(...from);
        sy = Math.max(0.7, Math.min(1.6, (legPx * (a.reach ?? 1)) / ((a.bottom - from[0].y) * 0.97) / sx));
      }
    }
    const scale = dist(...to) / dist(...from);
    const angle = Math.atan2(to[1].y - to[0].y, to[1].x - to[0].x);
    const fm = mid(...from), tm = mid(...to);

    ctx.save();
    ctx.translate(tm.x, tm.y + fit.lift * H);
    ctx.rotate(angle);
    ctx.scale(scale, scale * sy);
    ctx.shadowColor = 'rgba(50, 27, 19, 0.3)';
    ctx.shadowBlur = 14 / scale;
    ctx.shadowOffsetY = 4 / scale;
    // The art is drawn at 200 × 240 units.
    ctx.drawImage(art, -fm.x, -fm.y, 200, 240);
    ctx.restore();
  }
  return { image: c.toDataURL('image/jpeg', 0.9), tracked };
}

/** The garment artwork as a PNG on white, for YouCam when a product has no product photo. */
export async function artForYouCam(p: Product): Promise<string> {
  const art = await loadImage(productArt(p));
  const c = document.createElement('canvas');
  c.width = 600;
  c.height = 720;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(art, 0, 0, c.width, c.height);
  return c.toDataURL('image/png');
}

/**
 * A drawn studio mannequin, proportioned like `guessBody`, so shoppers can try pieces before
 * uploading their own photo.
 */
export function sampleModel(figure: Figure = 'women'): string {
  const W = 900, H = 1350;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  const bg = x.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#f5ebe0');
  bg.addColorStop(1, '#dcc5aa');
  x.fillStyle = bg;
  x.fillRect(0, 0, W, H);
  // Floor shadow.
  x.fillStyle = 'rgba(50, 27, 19, 0.14)';
  x.beginPath();
  x.ellipse(W / 2, H * 0.95, W * 0.2, H * 0.018, 0, 0, Math.PI * 2);
  x.fill();

  const skin = x.createLinearGradient(W * 0.3, 0, W * 0.7, 0);
  skin.addColorStop(0, '#b98d6e');
  skin.addColorStop(0.5, '#d2a785');
  skin.addColorStop(1, '#a77a5c');
  x.fillStyle = skin;
  const cx = W / 2, sy = H * 0.24, hy = H * 0.52, ay = H * 0.92;
  const sw = W * 0.17, hw = W * 0.1;
  const men = figure === 'men';
  // Head and neck.
  x.beginPath();
  x.ellipse(cx, H * 0.13, W * (men ? 0.066 : 0.062), H * 0.052, 0, 0, Math.PI * 2);
  x.fill();
  x.fillRect(cx - W * (men ? 0.038 : 0.03), H * 0.17, W * (men ? 0.076 : 0.06), H * 0.06);
  // Torso.
  x.beginPath();
  x.moveTo(cx - sw, sy);
  x.quadraticCurveTo(cx, sy - H * 0.025, cx + sw, sy);
  const waist = men ? 1.45 : 1.15, hip = men ? 1.5 : 1.7;
  x.quadraticCurveTo(cx + sw * (men ? 1.02 : 0.85), H * 0.34, cx + hw * waist, H * 0.42);
  x.quadraticCurveTo(cx + hw * hip, hy, cx + hw * 1.45, H * 0.58);
  x.lineTo(cx - hw * 1.45, H * 0.58);
  x.quadraticCurveTo(cx - hw * hip, hy, cx - hw * waist, H * 0.42);
  x.quadraticCurveTo(cx - sw * (men ? 1.02 : 0.85), H * 0.34, cx - sw, sy);
  x.fill();
  // Arms.
  x.lineCap = 'round';
  x.strokeStyle = skin;
  x.lineWidth = W * (men ? 0.06 : 0.05);
  for (const s of [-1, 1]) {
    x.beginPath();
    x.moveTo(cx + s * sw * 0.95, sy + H * 0.015);
    x.quadraticCurveTo(cx + s * sw * 1.3, H * 0.38, cx + s * sw * 1.32, H * 0.53);
    x.stroke();
  }
  // Legs.
  x.lineWidth = W * 0.075;
  for (const s of [-1, 1]) {
    x.beginPath();
    x.moveTo(cx + s * hw * 0.85, H * 0.56);
    x.quadraticCurveTo(cx + s * hw * 0.95, H * 0.75, cx + s * hw, ay);
    x.stroke();
  }
  return c.toDataURL('image/jpeg', 0.9);
}

/** Builds the shopper's personal style report as a PDF, entirely in the browser. */
import { jsPDF } from 'jspdf';

import { COLORS, formatPrice, isDemoLink, OCCASIONS, productById, retailerUrl, sellerById, STYLES, type Product } from '../shared/catalog.ts';
import { suggestOutfits, type Preferences } from '../shared/outfits.ts';
import { productArt } from './art.ts';
import { loadImage } from './images.ts';
import { fromKey } from './planner.ts';
import type { ChangedLook, PlanDay, SavedLook } from './store.tsx';

export type ReportInput = {
  name: string;
  prefs: Preferences;
  favorites: string[];
  looks: SavedLook[];
  plan: [string, PlanDay][];
  changes: ChangedLook[];
};

type RGB = [number, number, number];
const C = {
  espresso: [50, 27, 19] as RGB,
  espresso2: [74, 42, 29] as RGB,
  cream: [236, 219, 199] as RGB,
  paper: [255, 254, 255] as RGB,
  blush: [245, 235, 224] as RGB,
  gold: [176, 144, 111] as RGB,
  goldDeep: [134, 102, 77] as RGB,
  ink: [58, 34, 24] as RGB,
  muted: [124, 97, 82] as RGB,
  line: [226, 211, 194] as RGB,
};

const label = <T extends string>(list: { key: T; label: string }[], k: T) => list.find((x) => x.key === k)?.label ?? k;
const hexRgb = (hex: string): RGB => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** An image as a JPEG data URL, or null if it can't be read (e.g. a remote render without CORS). */
async function jpeg(src: string, edge = 900): Promise<{ data: string; w: number; h: number } | null> {
  try {
    const img = await loadImage(src);
    const s = Math.min(1, edge / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * s);
    c.height = Math.round(img.naturalHeight * s);
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
    return { data: c.toDataURL('image/jpeg', 0.86), w: c.width, h: c.height };
  } catch {
    return null;
  }
}

/** A flat-lay of a look's pieces on cream, like the collages in the app. */
async function flatLay(itemIds: string[]): Promise<string> {
  const items = itemIds.map(productById).filter(Boolean) as Product[];
  const W = 500, H = 400;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const x = c.getContext('2d')!;
  x.fillStyle = '#f5ebe0';
  x.fillRect(0, 0, W, H);
  const n = Math.min(items.length, 5);
  // First piece large on the left, the rest stacked in a grid on the right.
  const cells = n === 1 ? [[0, 0, W, H]] : [[0, 0, W * 0.5, H], ...Array.from({ length: n - 1 }, (_, i) => {
    const cols = n - 1 > 2 ? 2 : 1, rows = Math.ceil((n - 1) / cols);
    const cw = (W * 0.5) / cols, ch = H / rows;
    return [W * 0.5 + (i % cols) * cw, Math.floor(i / cols) * ch, cw, ch];
  })];
  for (const [i, p] of items.slice(0, 5).entries()) {
    const [cx, cy, cw, ch] = cells[i];
    const art = await loadImage(p.image ?? productArt(p));
    const s = Math.min((cw * 0.84) / 200, (ch * 0.84) / 240);
    x.drawImage(art, cx + (cw - 200 * s) / 2, cy + (ch - 240 * s) / 2, 200 * s, 240 * s);
  }
  return c.toDataURL('image/jpeg', 0.88);
}

export async function buildReport(input: ReportInput): Promise<Blob> {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const name = input.name.trim() || 'Valued Client';
  const { prefs } = input;

  /** Centred letter-spaced text (jsPDF's centring ignores character spacing). */
  const spaced = (t: string, yy: number, cs: number) => {
    const w = doc.getTextWidth(t) + cs * (t.length - 1);
    doc.setCharSpace(cs);
    doc.text(t, (W - w) / 2, yy);
    doc.setCharSpace(0);
  };
  const star = (cx: number, cy: number, r: number, style: 'S' | 'F' = 'S') => {
    const pts: [number, number][] = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.42 : r;
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    const rel = pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]]);
    doc.lines(rel, pts[0][0], pts[0][1], [1, 1], style, true);
  };

  // ---------- Cover ----------
  doc.setFillColor(...C.espresso);
  doc.rect(0, 0, W, H, 'F');
  // Star-pattern band along the bottom, from the brand board.
  doc.setDrawColor(...C.cream);
  doc.setLineWidth(1);
  for (let row = 0; row < 3; row++) for (let col = 0; col < 14; col++) {
    const big = (row + col) % 2 === 0;
    star(24 + col * 42 + (row % 2) * 21, H - 110 + row * 38, big ? 13 : 6, big ? 'S' : 'F');
  }
  doc.setFillColor(...C.cream);
  doc.setLineWidth(2.2);
  star(W / 2, 210, 46);
  doc.setLineWidth(1.2);
  star(W / 2, 210, 26);
  doc.setTextColor(...C.cream);
  doc.setFont('times', 'normal');
  doc.setFontSize(30);
  spaced('EMPIRE GLAMOUR', 310, 7);
  doc.setFontSize(46);
  doc.setTextColor(...C.paper);
  doc.text('Personal Style', W / 2, 420, { align: 'center' });
  doc.text('Report', W / 2, 470, { align: 'center' });
  doc.setFontSize(14);
  doc.setTextColor(...C.cream);
  doc.text(`Prepared for ${name}`, W / 2, 520, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  spaced(date.toUpperCase(), 544, 2);

  // ---------- Page furniture ----------
  let y = 0;
  const newPage = () => {
    doc.addPage();
    doc.setFillColor(...C.paper);
    doc.rect(0, 0, W, H, 'F');
    doc.setFillColor(...C.espresso);
    doc.rect(0, 0, W, 8, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.setCharSpace(2);
    doc.text('EMPIRE GLAMOUR  ·  PERSONAL STYLE REPORT', M, 36);
    doc.text(name.toUpperCase(), W - M, 36, { align: 'right' });
    doc.setCharSpace(0);
    y = 80;
  };
  const ensure = (h: number) => {
    if (y + h > H - 60) newPage();
  };
  const heading = (t: string, sub?: string) => {
    if (y > 90) y += 18;
    ensure(90);
    doc.setFont('times', 'normal');
    doc.setFontSize(26);
    doc.setTextColor(...C.espresso);
    doc.text(t, M, y);
    y += 10;
    doc.setDrawColor(...C.gold);
    doc.setLineWidth(0.8);
    doc.line(M, y, M + 60, y);
    y += 22;
    if (sub) para(sub, 10, C.muted);
  };
  const para = (t: string, size = 10.5, color: RGB = C.ink) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(t, W - M * 2);
    ensure(lines.length * size * 1.5);
    doc.text(lines, M, y, { lineHeightFactor: 1.5 });
    y += lines.length * size * 1.5 + 6;
  };
  const kv = (k: string, v: string) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(v, W - M * 2 - 150);
    ensure(14 * lines.length + 12);
    doc.setTextColor(...C.muted);
    doc.text(k.toUpperCase(), M, y);
    doc.setTextColor(...C.ink);
    doc.text(lines, W - M, y, { align: 'right' });
    y += 14 * (lines.length - 1);
    doc.setDrawColor(...C.line);
    doc.setLineWidth(0.4);
    doc.line(M, y + 8, W - M, y + 8);
    y += 24;
  };
  /** One product: name, seller and colour, price, and a link to buy. */
  const productRow = (p: Product, x = M, right = W - M) => {
    ensure(34);
    const seller = sellerById(p.sellerId)!;
    doc.setFillColor(...hexRgb(p.color.hex));
    doc.setDrawColor(...C.line);
    doc.circle(x + 6, y - 4, 5, 'FD');
    doc.setFont('times', 'normal');
    doc.setFontSize(12.5);
    doc.setTextColor(...C.espresso);
    doc.text(p.name, x + 18, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.muted);
    doc.text(`${seller.name} · ${p.color.name} · ${p.material}`, x + 18, y + 12);
    doc.setFontSize(10);
    doc.setTextColor(...C.ink);
    doc.text(formatPrice(p.price), right, y, { align: 'right' });
    const url = retailerUrl(p);
    doc.setFontSize(8.5);
    doc.setTextColor(...C.goldDeep);
    if (isDemoLink(url)) doc.text('Demo seller', right, y + 12, { align: 'right' });
    else doc.textWithLink('Buy from seller', right - doc.getTextWidth('Buy from seller'), y + 12, { url });
    y += 30;
  };
  const lookBlock = async (title: string, meta: string, itemIds: string[], image?: string) => {
    const items = itemIds.map(productById).filter(Boolean) as Product[];
    const imgW = 170, imgH = 136;
    const listH = items.length * 30 + 40;
    ensure(Math.max(imgH, listH) + 16);
    const top = y;
    const pic = image ? await jpeg(image) : null;
    if (pic) {
      const h = Math.min(imgH * 1.4, (pic.h / pic.w) * imgW);
      doc.addImage(pic.data, 'JPEG', M, top, imgW, h);
    } else {
      doc.addImage(await flatLay(itemIds), 'JPEG', M, top, imgW, imgH);
    }
    const x = M + imgW + 20;
    doc.setFont('times', 'normal');
    doc.setFontSize(17);
    doc.setTextColor(...C.espresso);
    doc.text(title, x, top + 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...C.goldDeep);
    doc.text(doc.splitTextToSize(meta.toUpperCase(), W - M - x)[0], x, top + 30);
    y = top + 52;
    for (const p of items) productRow(p, x);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...C.espresso);
    doc.text(`Outfit total ${formatPrice(items.reduce((s, p) => s + p.price, 0))}`, W - M, y, { align: 'right' });
    y = Math.max(y + 10, top + (pic ? Math.min(imgH * 1.4, (pic.h / pic.w) * imgW) : imgH)) + 22;
  };

  newPage();

  // ---------- Profile ----------
  heading('Your Style Profile');
  kv('Shopping for', prefs.department === 'all' ? 'Womenswear and menswear' : prefs.department === 'men' ? 'Menswear' : 'Womenswear');
  kv('Styles you love', prefs.styles.map((s) => label(STYLES, s)).join(', ') || 'Not set yet');
  kv('Occasions', prefs.occasions.map((o) => label(OCCASIONS, o)).join(', ') || 'Not set yet');
  kv('Budget per piece', prefs.budget[1] >= 10_000 ? 'Any' : `${formatPrice(prefs.budget[0])} to ${formatPrice(prefs.budget[1])}`);
  if (prefs.colors.length) {
    ensure(46);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...C.muted);
    doc.text('YOUR COLOURS', M, y);
    prefs.colors.forEach((c, i) => {
      const sw = COLORS.find((x) => x.key === c)!;
      const cx = W - M - 12 - i * 70;
      doc.setFillColor(...hexRgb(sw.swatch));
      doc.setDrawColor(...C.line);
      doc.circle(cx, y - 4, 11, 'FD');
      doc.setFontSize(7.5);
      doc.text(sw.label.split(' ')[0], cx, y + 18, { align: 'center' });
    });
    y += 40;
  } else {
    kv('Colours', 'Not set yet');
  }

  // ---------- Planner ----------
  const plannedDays = input.plan.filter(([, d]) => d.itemIds?.length);
  if (plannedDays.length) {
    heading('Your Outfit Plan', 'Looks matched to what’s on each day, without repeating the main pieces.');
    for (const [key, day] of plannedDays) {
      const d = fromKey(key).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
      const occ = day.occasion ? label(OCCASIONS, day.occasion) : 'Any occasion';
      await lookBlock(d, `${day.event ? `${day.event} · ` : ''}${occ}${day.lookName ? ` · ${day.lookName}` : ''}`, day.itemIds!);
    }
  }

  // ---------- Saved looks ----------
  if (input.looks.length) {
    heading('Saved Looks');
    for (const l of input.looks.slice(0, 10)) {
      await lookBlock(l.name, `${l.occasion ? label(OCCASIONS, l.occasion) : 'Saved'} · ${new Date(l.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`, l.itemIds, l.image);
    }
  }

  // ---------- Recommendations ----------
  const picks = suggestOutfits(prefs, { limit: 3 });
  if (picks.length) {
    heading('Picked for You', 'Complete outfits chosen for your styles, colours and budget.');
    for (const o of picks) await lookBlock(o.name, o.reasons.join(' · '), o.itemIds);
  }

  // ---------- Favourites ----------
  const favs = input.favorites.map(productById).filter(Boolean) as Product[];
  if (favs.length) {
    heading('Favourite Pieces');
    favs.forEach((p) => productRow(p));
  }

  // ---------- Clothes changer ----------
  if (input.changes.length) {
    ensure(330);
    heading('Clothes Changer Gallery');
    const w = (W - M * 2 - 24) / 3;
    let col = 0;
    for (const c of input.changes.slice(0, 6)) {
      const img = await jpeg(c.image);
      if (!img) continue;
      const h = Math.min(w * 1.5, (img.h / img.w) * w);
      if (col === 0) ensure(h + 30);
      doc.addImage(img.data, 'JPEG', M + col * (w + 12), y, w, h);
      doc.setFont('times', 'italic');
      doc.setFontSize(11);
      doc.setTextColor(...C.espresso);
      doc.text(c.style, M + col * (w + 12), y + h + 14);
      col = (col + 1) % 3;
      if (col === 0) y += h + 30;
    }
    if (col !== 0) y += w * 1.5 + 30;
  }

  // ---------- Shopping summary ----------
  const all = [...new Set([...plannedDays.flatMap(([, d]) => d.itemIds!), ...input.looks.flatMap((l) => l.itemIds), ...input.favorites])]
    .map(productById)
    .filter(Boolean) as Product[];
  if (all.length) {
    heading('Shopping List', 'Everything in your plan, saved looks and favourites, by seller. Each piece is counted once.');
    const bySeller = new Map<string, Product[]>();
    all.forEach((p) => bySeller.set(p.sellerId, [...(bySeller.get(p.sellerId) ?? []), p]));
    for (const [sid, items] of bySeller) {
      const s = sellerById(sid)!;
      ensure(60);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...C.goldDeep);
      doc.setCharSpace(1.5);
      doc.text(`${s.name.toUpperCase()} · ${s.city.toUpperCase()}`, M, y);
      doc.setCharSpace(0);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...C.muted);
      doc.text(`${s.delivery} · ${s.returns}`, W - M, y, { align: 'right' });
      y += 20;
      items.forEach((p) => productRow(p));
      y += 4;
    }
    ensure(40);
    doc.setFillColor(...C.blush);
    doc.roundedRect(M, y, W - M * 2, 34, 6, 6, 'F');
    doc.setFont('times', 'normal');
    doc.setFontSize(15);
    doc.setTextColor(...C.espresso);
    doc.text(`${all.length} pieces`, M + 14, y + 22);
    doc.text(formatPrice(all.reduce((s, p) => s + p.price, 0)), W - M - 14, y + 22, { align: 'right' });
    y += 50;
  }

  para('Prices are in US dollars and set by each seller. Retailer links open the seller’s own page; Empire Glamour tags them so sellers know you came from us.', 8.5, C.muted);

  // Page numbers on content pages.
  const pages = doc.getNumberOfPages();
  for (let i = 2; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.text(`${i - 1} / ${pages - 1}`, W - M, H - 28, { align: 'right' });
    doc.text(date, M, H - 28);
  }
  return doc.output('blob');
}

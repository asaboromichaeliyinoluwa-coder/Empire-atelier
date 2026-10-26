/**
 * The shop owner's own products: real photos, prices, sizes and links added from the My products page.
 * Products and photos live in the same store as accounts (a data/ folder, or Upstash Redis on Vercel).
 * The owner is the first account that claims the shop (or any email in ADMIN_EMAILS).
 */
import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ShopProduct, ShopSettings } from '../src/shared/shop.ts';
import { AccountError, currentUser, db } from './accounts.ts';

export type { ShopProduct, ShopSettings };

const CATEGORIES = new Set(['tops', 'bottoms', 'dresses', 'sets', 'outerwear', 'shoes', 'bags', 'accessories']);
const GENDERS = new Set(['women', 'men', 'unisex']);
const DEFAULT_SETTINGS: ShopSettings = { name: 'Empire Atelier', city: '', website: '', contact: '' };
const MAX_PHOTO = 700_000; // characters of base64 per photo

const adminEmails = () => (process.env.ADMIN_EMAILS ?? '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);

async function readList(): Promise<ShopProduct[]> {
  const raw = await db().get('shop:products');
  return raw ? JSON.parse(raw) : [];
}
async function readSettings(): Promise<ShopSettings> {
  const raw = await db().get('shop:settings');
  return { ...DEFAULT_SETTINGS, ...(raw ? JSON.parse(raw) : {}) };
}

export async function publicShop() {
  return { settings: await readSettings(), products: await readList() };
}

async function isOwner(auth: string | undefined) {
  const user = await currentUser(auth);
  const owner = await db().get('shop:owner');
  const byEmail = !!user.email && adminEmails().includes(user.email.toLowerCase());
  return { user, isOwner: byEmail || owner === user.id, canClaim: !owner && !adminEmails().length };
}

export async function ownerStatus(auth: string | undefined) {
  const { isOwner: owner, canClaim } = await isOwner(auth);
  return { owner, canClaim };
}

export async function claimShop(auth: string | undefined) {
  const s = await isOwner(auth);
  if (s.isOwner) return { owner: true };
  if (!s.canClaim) throw new AccountError('This shop already has an owner', 403);
  await db().set('shop:owner', s.user.id);
  return { owner: true };
}

async function requireOwner(auth: string | undefined) {
  if (!(await isOwner(auth)).isOwner) throw new AccountError('Only the shop owner can change products', 403);
}

const clean = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);

export async function saveSettings(auth: string | undefined, body: any) {
  await requireOwner(auth);
  const s: ShopSettings = {
    name: clean(body?.name, 60) || 'Empire Atelier', city: clean(body?.city, 60), contact: clean(body?.contact, 120),
    website: /^https?:\/\//.test(clean(body?.website, 300)) ? clean(body?.website, 300) : '',
  };
  await db().set('shop:settings', JSON.stringify(s));
  return s;
}

export async function saveProduct(auth: string | undefined, body: any) {
  await requireOwner(auth);
  const list = await readList();
  const existing = list.find((p) => p.id === body?.id);
  const id = existing?.id ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const price = Number(body?.price);
  if (!clean(body?.name, 90)) throw new AccountError('Give the product a name');
  if (!(price > 0)) throw new AccountError('Enter a price above 0');
  if (!CATEGORIES.has(body?.category)) throw new AccountError('Choose a category');

  // photos: keep existing urls, store new uploads
  const photos: string[] = [];
  for (const ph of Array.isArray(body?.photos) ? body.photos.slice(0, 8) : []) {
    if (typeof ph === 'string' && ph.startsWith('/api/shop/img/')) photos.push(ph);
    else if (typeof ph === 'string' && /^data:image\/(webp|jpeg|png);base64,/.test(ph)) {
      if (ph.length > MAX_PHOTO) throw new AccountError('A photo is too large. Use a photo under 500 KB.', 413);
      const key = `${id}-${Date.now().toString(36)}${photos.length}`;
      await db().set(`shop:img:${key}`, ph);
      photos.push(`/api/shop/img/${key}`);
    }
  }
  if (!photos.length) throw new AccountError('Add at least one photo');
  for (const old of existing?.photos ?? []) if (!photos.includes(old)) await db().del(`shop:img:${old.split('/').pop()}`);

  const was = Number(body?.was);
  const url = clean(body?.url, 500);
  const product: ShopProduct = {
    id, name: clean(body?.name, 90), category: body.category, gender: GENDERS.has(body?.gender) ? body.gender : 'unisex',
    price: Math.round(price * 100) / 100, ...(was > price ? { was: Math.round(was * 100) / 100 } : {}),
    description: clean(body?.description, 1200), material: clean(body?.material, 120),
    colorName: clean(body?.colorName, 40) || 'Default', colorHex: /^#[0-9a-f]{6}$/i.test(body?.colorHex) ? body.colorHex : '#888888',
    sizes: (Array.isArray(body?.sizes) ? body.sizes : []).map((s: unknown) => clean(s, 12)).filter(Boolean).slice(0, 20),
    photos, ...(/^https?:\/\//.test(url) ? { url } : {}), tryOn: !!body?.tryOn, ...(clean(body?.group, 40) ? { group: clean(body?.group, 40) } : {}),
    createdAt: existing?.createdAt ?? Date.now(),
  };
  if (!product.sizes.length) product.sizes = ['One size'];
  await db().set('shop:products', JSON.stringify(existing ? list.map((p) => (p.id === id ? product : p)) : [product, ...list]));
  return product;
}

export async function deleteProduct(auth: string | undefined, id: string) {
  await requireOwner(auth);
  const list = await readList();
  const p = list.find((x) => x.id === id);
  if (!p) return { ok: true };
  for (const ph of p.photos) await db().del(`shop:img:${ph.split('/').pop()}`);
  await db().set('shop:products', JSON.stringify(list.filter((x) => x.id !== id)));
  return { ok: true };
}

/** Streams one stored photo. */
export async function sendPhoto(res: ServerResponse, key: string) {
  const raw = /^[\w-]+$/.test(key) ? await db().get(`shop:img:${key}`) : null;
  const m = raw ? /^data:(image\/\w+);base64,(.*)$/.exec(raw) : null;
  if (!m) return void res.writeHead(404).end();
  res.writeHead(200, { 'Content-Type': m[1], 'Cache-Control': 'public, max-age=31536000, immutable' });
  res.end(Buffer.from(m[2], 'base64'));
}

export type { IncomingMessage };

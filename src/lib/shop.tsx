import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { registerShop } from '../shared/catalog.ts';
import { REAL_PRODUCTS } from '../shared/real-products.ts';
import { shopProduct, shopSeller, type ShopProduct, type ShopSettings } from '../shared/shop.ts';
import { useAuth } from './auth.tsx';
import { API_BASE, IS_PREVIEW } from './platform.ts';

/**
 * The shop owner's own products. With a server they are saved there and everyone sees them; with no
 * server (the hosted preview, or a phone with no connection) they are saved on this device only.
 */
type Where = 'server' | 'device';
type Shop = {
  where: Where;
  settings: ShopSettings;
  products: ShopProduct[];
  /** Bumps whenever the catalogue changed, so screens can re-read it. */
  version: number;
  loading: boolean;
  owner: { owner: boolean; canClaim: boolean } | null;
  claim: () => Promise<void>;
  saveProduct: (p: Partial<ShopProduct> & { photos: string[] }) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  saveSettings: (s: ShopSettings) => Promise<void>;
  exportFile: () => void;
};

const DEVICE_KEY = 'empire-atelier/my-products/v1';
const EMPTY: ShopSettings = { name: 'Empire Atelier', city: '', website: '', contact: '' };
const Ctx = createContext<Shop | null>(null);

const readDevice = (): { settings: ShopSettings; products: ShopProduct[] } => {
  try {
    const raw = localStorage.getItem(DEVICE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* storage unavailable */ }
  return { settings: EMPTY, products: [] };
};
const writeDevice = (v: { settings: ShopSettings; products: ShopProduct[] }) => {
  try {
    localStorage.setItem(DEVICE_KEY, JSON.stringify(v));
  } catch {
    throw new Error('This device has no room left for more photos. Delete a product or use smaller photos.');
  }
};

async function call<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, ...rest } = init;
  const res = await fetch(API_BASE + path, { ...rest, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body as T;
}

/** Photo urls the server returns are relative; make them work in the phone app too. */
const withBase = (p: ShopProduct): ShopProduct => ({ ...p, photos: p.photos.map((u) => (u.startsWith('/api/') ? API_BASE + u : u)) });
const stripBase = (u: string) => (API_BASE && u.startsWith(API_BASE + '/api/') ? u.slice(API_BASE.length) : u);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const { token, mode } = useAuth();
  const [where, setWhere] = useState<Where>(IS_PREVIEW ? 'device' : 'server');
  const [state, setState] = useState<{ settings: ShopSettings; products: ShopProduct[] }>({ settings: EMPTY, products: [] });
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState<Shop['owner']>(null);

  const apply = useCallback((s: { settings: ShopSettings; products: ShopProduct[] }, w: Where) => {
    setState(s); setWhere(w);
    const base = import.meta.env.BASE_URL;
    const WEARABLE = ['tops', 'bottoms', 'dresses', 'sets'];
    const real = REAL_PRODUCTS.map((p) => ({ ...p, tryOn: p.tryOn ?? WEARABLE.includes(p.category), photos: p.photos.map((u) => base + u) }));
    registerShop(shopSeller(s.settings), [...real, ...s.products].map(shopProduct));
    setVersion((v) => v + 1);
  }, []);

  const load = useCallback(async () => {
    if (!IS_PREVIEW) {
      try {
        const r = await call<{ settings: ShopSettings; products: ShopProduct[] }>('/api/shop');
        return apply({ settings: r.settings, products: r.products.map(withBase) }, 'server');
      } catch { /* no server: fall through to this device */ }
    }
    apply(readDevice(), 'device');
  }, [apply]);

  useEffect(() => { void load().finally(() => setLoading(false)); }, [load]);

  // Who may edit? Device mode: whoever is using this device. Server mode: the account that claimed the shop.
  useEffect(() => {
    if (where === 'device') return setOwner({ owner: true, canClaim: false });
    if (!token || mode !== 'server') return setOwner(null);
    call<{ owner: boolean; canClaim: boolean }>('/api/shop/owner', { token }).then(setOwner).catch(() => setOwner(null));
  }, [where, token, mode]);

  const shop = useMemo<Shop>(() => ({
    where, settings: state.settings, products: state.products, version, loading, owner,
    claim: async () => {
      await call('/api/shop/claim', { method: 'POST', token });
      setOwner({ owner: true, canClaim: false });
    },
    saveProduct: async (p) => {
      if (where === 'server') {
        await call('/api/shop/product', { method: 'POST', token, body: JSON.stringify({ ...p, photos: p.photos.map(stripBase) }) });
        return load();
      }
      const cur = readDevice();
      const id = p.id ?? `d${Date.now().toString(36)}`;
      const full = { ...(p as ShopProduct), id, createdAt: p.createdAt ?? Date.now(), sizes: p.sizes?.length ? p.sizes : ['One size'] };
      const next = { ...cur, products: cur.products.some((x) => x.id === id) ? cur.products.map((x) => (x.id === id ? full : x)) : [full, ...cur.products] };
      writeDevice(next);
      apply(next, 'device');
    },
    removeProduct: async (id) => {
      if (where === 'server') {
        await call(`/api/shop/product/${id}`, { method: 'DELETE', token });
        return load();
      }
      const cur = readDevice();
      const next = { ...cur, products: cur.products.filter((x) => x.id !== id) };
      writeDevice(next);
      apply(next, 'device');
    },
    saveSettings: async (s) => {
      if (where === 'server') {
        await call('/api/shop/settings', { method: 'PUT', token, body: JSON.stringify(s) });
        return load();
      }
      const next = { ...readDevice(), settings: s };
      writeDevice(next);
      apply(next, 'device');
    },
    exportFile: () => {
      const blob = new Blob([JSON.stringify(state, null, 1)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'my-products.json'; a.click();
      URL.revokeObjectURL(a.href);
    },
  }), [where, state, version, loading, owner, token, load, apply]);

  return <Ctx.Provider value={shop}>{children}</Ctx.Provider>;
}

export function useShop() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useShop needs a ShopProvider');
  return v;
}

/** Re-reads the catalogue whenever the shop owner's products change (use in a component near the top). */
export const useCatalogVersion = () => useShop().version;

/** Shrinks a chosen photo to a web-sized WebP so it uploads fast and loads quickly. */
export async function preparePhoto(file: File, max = 1400): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  for (const q of [0.82, 0.7, 0.55]) {
    const url = c.toDataURL('image/webp', q);
    if (url.length < 480_000) return url;
  }
  return c.toDataURL('image/webp', 0.45);
}

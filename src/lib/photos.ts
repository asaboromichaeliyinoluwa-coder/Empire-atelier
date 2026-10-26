import { useEffect, useState } from 'react';

import index from '../shared/photo-index.json';
import { API_BASE } from './platform.ts';

/**
 * Studio photographs of the catalogue, packed into a few files (see tools/render/pack.py). A thumbnail pack
 * per seller loads for the shop; a small full-size pack loads on the product page. Products with no
 * photograph yet fall back to their drawing.
 */
type Ref = [pack: string, offset: number, length: number];
export type PhotoView = 'thumb' | 'front' | 'detail' | 'back' | 'swatch';
const INDEX = index as unknown as Record<string, Partial<Record<PhotoView, Ref>>>;

const packs = new Map<string, Promise<ArrayBuffer | null>>();
const urls = new Map<string, string>();

const packUrl = (name: string) => {
  const base = API_BASE || (import.meta.env.BASE_URL === './' ? new URL('.', document.baseURI).href.replace(/\/$/, '') : '');
  return `${base}/photos/${name}${import.meta.env.VITE_PACK_EXT ?? '.pack'}`;
};

function pack(name: string) {
  let p = packs.get(name);
  if (!p) {
    p = fetch(packUrl(name)).then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => null);
    packs.set(name, p);
  }
  return p;
}

export async function photoUrl(id: string, view: PhotoView): Promise<string | null> {
  const ref = INDEX[id]?.[view];
  if (!ref) return null;
  const key = `${id}:${view}`;
  const hit = urls.get(key);
  if (hit) return hit;
  const buf = await pack(ref[0]);
  if (!buf) return null;
  const url = URL.createObjectURL(new Blob([buf.slice(ref[1], ref[1] + ref[2])], { type: 'image/webp' }));
  urls.set(key, url);
  return url;
}

export const hasPhotos = (id: string) => !!INDEX[id]?.front;

/** The photograph of a product, or undefined while it loads (or if there isn't one). */
export function usePhoto(id: string, view: PhotoView = 'thumb') {
  const [url, setUrl] = useState<string | undefined>(() => urls.get(`${id}:${view}`));
  useEffect(() => {
    let live = true;
    setUrl(urls.get(`${id}:${view}`));
    photoUrl(id, view).then((u) => live && u && setUrl(u));
    return () => { live = false; };
  }, [id, view]);
  return url;
}

import type { Product } from '../shared/catalog.ts';
import { contextNote, offlineStylist, SYSTEM, type ChatTurn, type StylistContext } from '../shared/stylist.ts';
import { artForYouCam } from './compose.ts';
import { API_BASE, capability, IS_PREVIEW } from './platform.ts';

export type ImageInput = { url: string } | { dataUrl: string };

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(API_BASE + path, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body as T;
}

export async function getStatus(): Promise<{ youcam: boolean; stylist: boolean; accounts?: 'redis' | 'file' | 'none'; googleClientId?: string | null; phone?: boolean }> {
  if (IS_PREVIEW) return { youcam: false, stylist: false };
  return json('/api/status');
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
type Polled = { status: 'running' } | { status: 'error'; error: string } | { status: 'success'; url: string };

async function poll(taskId: string, onProgress?: (msg: string) => void) {
  const messages = ['Reading your pose…', 'Keeping your features…', 'Draping the fabric…', 'Matching light and shadow…'];
  for (let i = 0; i < 90; i++) {
    await sleep(i < 5 ? 1200 : 2000);
    const r = await json<Polled>(`/api/task/${encodeURIComponent(taskId)}`);
    if (r.status === 'success') return r.url;
    if (r.status === 'error') throw new Error(r.error);
    onProgress?.(messages[Math.min(messages.length - 1, Math.floor(i / 3))]);
  }
  throw new Error('This is taking longer than usual. Please try again.');
}

/**
 * Dresses the photo in each garment with YouCam, one piece after another (bottoms, then dresses,
 * then tops and layers), feeding each render into the next. Returns null in preview mode.
 */
export async function runYouCamTryOn(products: Product[], photo: string, onProgress?: (msg: string) => void): Promise<string | null> {
  if (IS_PREVIEW) return null;
  const order = { lower_body: 0, full_body: 1, upper_body: 2 } as const;
  const pieces = products.filter((p) => p.garment).sort((a, b) => order[a.garment!] - order[b.garment!]);
  let source: ImageInput = { dataUrl: photo };
  for (const [i, p] of pieces.entries()) {
    onProgress?.(pieces.length > 1 ? `Fitting ${p.name} (${i + 1} of ${pieces.length})…` : `Fitting ${p.name}…`);
    const garmentImage = p.tryOnImage && location.protocol === 'https:' ? { url: new URL(p.tryOnImage, location.origin).href } : { dataUrl: await artForYouCam(p) };
    const started: { demo: true } | { taskId: string } = await json('/api/tryon', {
      method: 'POST',
      body: JSON.stringify({ productId: p.id, source, garmentImage, garment: p.garment }),
    });
    if ('demo' in started) return null;
    source = { url: await poll(started.taskId, onProgress) };
  }
  return 'url' in source ? source.url : null;
}

type Sample = (input: string, opts?: { cache?: boolean; modelTier?: 'quick' | 'default' | 'complex' }) => Promise<{ text: string }>;

/**
 * Asks the AI stylist. The hosted preview has no server: there Claude answers through the host
 * when the viewer allows it, and the rule-based stylist otherwise.
 */
export async function askStylist(history: ChatTurn[], context: StylistContext): Promise<string> {
  if (IS_PREVIEW) {
    const sample = await capability<Sample>('sample');
    if (sample) {
      try {
        const transcript = history.map((t) => `${t.role === 'user' ? 'Client' : 'Stylist'}: ${t.text}`).join('\n\n');
        const r = await sample(`${SYSTEM}\n\nClient profile: ${contextNote(context)}\n\nConversation so far:\n${transcript}\n\nWrite the stylist's next reply only.`, { cache: false });
        if (r.text.trim()) return r.text.trim();
      } catch {
        // Not allowed or unavailable: the built-in stylist answers.
      }
    }
    await sleep(400);
    return offlineStylist(history[history.length - 1]?.text ?? '', context);
  }
  const r = await json<{ reply: string }>('/api/stylist', { method: 'POST', body: JSON.stringify({ history, context }) });
  return r.reply;
}

export type Template = { id: string; name: string; thumb: string; category?: string };

export async function changerTemplates(): Promise<Template[]> {
  if (IS_PREVIEW) return [];
  return (await json<{ templates: Template[] }>('/api/changer/templates')).templates;
}

/**
 * AI clothes changer: re-dresses the photo with a YouCam outfit template, or with any garment
 * photo. Returns null when the server has no YouCam key.
 */
export async function runChanger(
  photo: string,
  change: { templateId: string } | { garmentImage: string; garment: 'upper_body' | 'lower_body' | 'full_body' },
  onProgress?: (msg: string) => void,
): Promise<string | null> {
  if (IS_PREVIEW) return null;
  const body = 'templateId' in change ? { source: { dataUrl: photo }, templateId: change.templateId } : { source: { dataUrl: photo }, garmentImage: { dataUrl: change.garmentImage }, garment: change.garment };
  const started: { demo: true } | { taskId: string } = await json('/api/changer', { method: 'POST', body: JSON.stringify(body) });
  if ('demo' in started) return null;
  return poll(started.taskId, onProgress);
}

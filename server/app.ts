/**
 * The Empire Atelier API (try-on, clothes changer, stylist). Shared by the Node server
 * (server/index.ts) and the Vercel function (server/vercel.ts).
 * The YouCam and Anthropic keys are read from the environment and never reach the browser.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';

import { productById } from '../src/shared/catalog.ts';
import { cleanContext } from '../src/shared/stylist.ts';
import { askStylist, stylistConfigured } from './stylist.ts';
import { createTemplateChange, createTryOn, getTask, listTemplates, youcamConfigured, YouCamError, type ImageInput } from './youcam.ts';

const MAX_BODY = 15 * 1024 * 1024;
const GARMENTS = new Set(['upper_body', 'lower_body', 'full_body']);

// The iOS / Android app loads its screens from the phone and calls this server from these origins.
const APP_ORIGINS = new Set(['capacitor://localhost', 'https://localhost', 'http://localhost', ...(process.env.EXTRA_ORIGINS ?? '').split(',').filter(Boolean)]);

export function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function readJson(req: IncomingMessage): Promise<any> {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new YouCamError('Request too large', 413);
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

function validImage(x: any): ImageInput {
  if (typeof x?.dataUrl === 'string' && x.dataUrl.startsWith('data:image/')) return { dataUrl: x.dataUrl };
  if (typeof x?.url === 'string' && /^https:\/\//.test(x.url)) return { url: x.url };
  throw new YouCamError('A photo is required', 400);
}

async function api(req: IncomingMessage, res: ServerResponse, path: string) {
  if (req.method === 'GET' && path === '/api/status') return send(res, 200, { youcam: youcamConfigured(), stylist: stylistConfigured() });

  if (req.method === 'POST' && path === '/api/stylist') {
    const body = await readJson(req);
    const history = (Array.isArray(body.history) ? body.history : [])
      .filter((t: any) => (t?.role === 'user' || t?.role === 'assistant') && typeof t.text === 'string' && t.text.trim())
      .slice(-16)
      .map((t: any) => ({ role: t.role, text: String(t.text).slice(0, 2000) }));
    // The conversation has to open with the client's message.
    while (history.length && history[0].role !== 'user') history.shift();
    if (!history.length || history[history.length - 1].role !== 'user') throw new YouCamError('Send a message to the stylist', 400);
    return send(res, 200, { reply: await askStylist(history, cleanContext(body.context)) });
  }

  if (req.method === 'GET' && path === '/api/changer/templates') {
    if (!youcamConfigured()) return send(res, 200, { templates: [] });
    return send(res, 200, { templates: await listTemplates() });
  }

  if (req.method === 'POST' && path === '/api/changer') {
    const body = await readJson(req);
    const source = validImage(body.source);
    if (!youcamConfigured()) return send(res, 200, { demo: true });
    // Either one of YouCam's outfit templates, or any garment photo the shopper uploads.
    if (typeof body.templateId === 'string' && body.templateId) {
      return send(res, 200, { taskId: await createTemplateChange(source, body.templateId) });
    }
    const garment = GARMENTS.has(body.garment) ? body.garment : 'full_body';
    return send(res, 200, { taskId: await createTryOn(source, validImage(body.garmentImage), garment) });
  }

  if (req.method === 'POST' && path === '/api/tryon') {
    const body = await readJson(req);
    const product = productById(String(body.productId ?? ''));
    if (!product?.garment) throw new YouCamError('This piece can’t be tried on', 400);
    const source = validImage(body.source);
    // Products with a real product shot send its URL; illustrated ones send the rendered artwork.
    const garmentImage = product.tryOnImage ? { url: product.tryOnImage } : validImage(body.garmentImage);
    const garment = GARMENTS.has(body.garment) ? body.garment : product.garment;
    if (!youcamConfigured()) return send(res, 200, { demo: true });
    return send(res, 200, { taskId: await createTryOn(source, garmentImage, garment) });
  }

  const task = /^\/api\/task\/([^/]+)$/.exec(path);
  if (req.method === 'GET' && task) return send(res, 200, await getTask(decodeURIComponent(task[1])));

  send(res, 404, { error: 'Not found' });
}

/** Answers one /api/* request, including CORS for the phone app and friendly errors. */
export async function handleApi(req: IncomingMessage, res: ServerResponse, path: string) {
  try {
    const origin = req.headers.origin;
    if (origin && APP_ORIGINS.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Vary', 'Origin');
      if (req.method === 'OPTIONS') return void res.writeHead(204).end();
    }
    await api(req, res, path);
  } catch (err) {
    if (err instanceof YouCamError) return send(res, err.status, { error: err.message });
    console.error(err);
    // Network failures to YouCam surface as TypeError("fetch failed").
    const offline = err instanceof TypeError && /fetch failed/.test(err.message);
    send(res, offline ? 502 : 500, { error: offline ? 'Could not reach the try-on service. Please try again.' : 'Something went wrong' });
  }
}

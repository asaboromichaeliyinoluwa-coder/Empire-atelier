/**
 * YouCam AI 2D watch try-on: puts a product photo of a watch on the wrist in the shopper's photo.
 * Same File API and polling flow as the clothes try-on in youcam.ts.
 */
import { YouCamError, type ImageInput } from './youcam.ts';

const BASE_URL = (process.env.YOUCAM_BASE_URL || 'https://yce-api-01.makeupar.com').replace(/\/$/, '');
const WATCH_PATH = '/s2s/v2.0/task/2d-vto/watch';

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.YOUCAM_API_KEY || ''}`, ...(init.headers as object) },
  });
  const body: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = body?.error_code ? ` (${body.error_code})` : '';
    throw new YouCamError(`${body?.error || `YouCam request failed: HTTP ${res.status}`}${code}`, res.status === 401 ? 401 : 502);
  }
  return (body?.data ?? body) as T;
}

async function uploadDataUrl(dataUrl: string): Promise<string> {
  const match = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(dataUrl);
  if (!match) throw new YouCamError('Unsupported image format', 400);
  const [, mime, b64] = match;
  const bytes = Buffer.from(b64, 'base64');
  if (bytes.length > 10 * 1024 * 1024) throw new YouCamError('Images must be under 10 MB', 400);
  const ext = mime.split('/')[1].replace('jpeg', 'jpg');
  const data = await call<{ files: { file_id: string; requests: { url: string; method: string; headers?: Record<string, string | number> }[] }[] }>('/s2s/v2.0/file', {
    method: 'POST',
    body: JSON.stringify({ files: [{ content_type: mime, file_name: `photo.${ext}`, file_size: bytes.length }] }),
  });
  const file = data.files?.[0];
  const upload = file?.requests?.[0];
  if (!file || !upload) throw new YouCamError('File API returned no upload URL');
  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(upload.headers ?? {})) headers[k] = String(v);
  const put = await fetch(upload.url, { method: upload.method || 'PUT', headers, body: bytes });
  if (!put.ok) throw new YouCamError(`Image upload failed: HTTP ${put.status}`);
  return file.file_id;
}

async function imageField(prefix: 'src' | 'ref', input: ImageInput, plural = false) {
  const s = plural ? 's' : '';
  if ('url' in input) return { [`${prefix}_file_url${s}`]: plural ? [input.url] : input.url };
  const id = await uploadDataUrl(input.dataUrl);
  return { [`${prefix}_file_id${s}`]: plural ? [id] : id };
}

export async function createWatchTryOn(wrist: ImageInput, watch: ImageInput) {
    const src = await imageField('src', wrist);
  const ref = await imageField('ref', watch, true);
  // YouCam also wants the same file id or url once more, under source_info and object_infos.
  const srcName = String(Object.values(src)[0]);
  const refName = String((Object.values(ref)[0] as string[])[0]);
  const payload = { ...src, ...ref, source_info: { name: srcName }, object_infos: [{ name: refName, parameter: { watch_need_remove_background: true } }] };
  const { task_id } = await call<{ task_id: string }>(WATCH_PATH, { method: 'POST', body: JSON.stringify(payload) });
  if (!task_id) throw new YouCamError('YouCam returned no task id');
  return task_id;
}

export type WatchResult = { status: 'running' } | { status: 'error'; error: string } | { status: 'success'; url: string };

export async function getWatchTask(taskId: string): Promise<WatchResult> {
  const t = await call<{ task_status: string; error?: string | null; results?: any }>(`${WATCH_PATH}/${encodeURIComponent(taskId)}`);
  if (t.task_status === 'error') return { status: 'error', error: t.error || 'YouCam could not complete this try-on' };
  if (t.task_status !== 'success') return { status: 'running' };
  const r = t.results;
  const url = r?.url ?? r?.output_url ?? (Array.isArray(r) ? r[0]?.url : undefined) ?? r?.images?.[0]?.url;
  return url ? { status: 'success', url } : { status: 'error', error: 'Try-on finished but returned no image' };
}

/**
 * YouCam AI API (Perfect Corp) client, v2.0 "s2s" endpoints. Runs on the server so the API key
 * never reaches the browser and the browser never needs CORS access to YouCam.
 *
 * Flow: register the image with the File API and PUT the bytes to the returned URL (or pass a
 * public URL directly), create a task, then poll it until `task_status` is "success" or "error".
 */
const BASE_URL = (process.env.YOUCAM_BASE_URL || 'https://yce-api-01.makeupar.com').replace(/\/$/, '');
const apiKey = () => process.env.YOUCAM_API_KEY || '';
export const youcamConfigured = () => !!apiKey();

/**
 * AI Clothes: https://docs.perfectcorp.com/reference/ai_clothes
 * v4 dresses the person in a garment photo; v2 also takes a `template_id` from YouCam's own
 * outfit templates, which powers the clothes changer.
 */
const TASK_PATHS = { v4: '/s2s/v2.0/task/cloth-v4', v2: '/s2s/v2.0/task/cloth' } as const;
type TaskKind = keyof typeof TASK_PATHS;
const TEMPLATES_PATH = '/s2s/v2.0/task/template/cloth';

export class YouCamError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey()}`, ...(init.headers as object) },
  });
  const body: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = body?.error_code ? ` (${body.error_code})` : '';
    throw new YouCamError(`${body?.error || `YouCam request failed: HTTP ${res.status}`}${code}`, res.status === 401 ? 401 : 502);
  }
  // v2.0 responses wrap the payload in `data`; tolerate unwrapped bodies too.
  return (body?.data ?? body) as T;
}

/** An image the API can read: a public https URL, or a data URL from the camera / an upload. */
export type ImageInput = { url: string } | { dataUrl: string };

type FileUploadResponse = {
  files: { file_id: string; requests: { url: string; method: string; headers?: Record<string, string | number> }[] }[];
};

async function uploadDataUrl(dataUrl: string): Promise<string> {
  const match = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(dataUrl);
  if (!match) throw new YouCamError('Unsupported image format', 400);
  const [, mime, b64] = match;
  const bytes = Buffer.from(b64, 'base64');
  if (bytes.length > 10 * 1024 * 1024) throw new YouCamError('Images must be under 10 MB', 400);

  const ext = mime.split('/')[1].replace('jpeg', 'jpg');
  const data = await call<FileUploadResponse>('/s2s/v2.0/file', {
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

/** Resolves an input to the `{prefix}_file_id` / `{prefix}_file_url` field a task expects. */
async function imageField(prefix: 'src' | 'ref', input: ImageInput) {
  if ('url' in input) return { [`${prefix}_file_url`]: input.url };
  return { [`${prefix}_file_id`]: await uploadDataUrl(input.dataUrl) };
}

export type Garment = 'upper_body' | 'lower_body' | 'full_body';

/**
 * Creates a clothes try-on task. YouCam keeps the person's face, body and pose in `source` and
 * dresses them in the garment from `garmentImage`.
 */
export async function createTryOn(source: ImageInput, garmentImage: ImageInput, garment: Garment) {
  const payload = { ...(await imageField('src', source)), ...(await imageField('ref', garmentImage)), garment_category: garment };
  return startTask('v4', payload);
}

/** Clothes changer with one of YouCam's outfit templates. */
export async function createTemplateChange(source: ImageInput, templateId: string) {
  return startTask('v2', { ...(await imageField('src', source)), template_id: templateId });
}

/** Task ids carry the API version they were made with, so polling hits the same endpoint. */
async function startTask(kind: TaskKind, payload: object) {
  const { task_id } = await call<{ task_id: string }>(TASK_PATHS[kind], { method: 'POST', body: JSON.stringify(payload) });
  if (!task_id) throw new YouCamError('YouCam returned no task id');
  return `${kind}.${task_id}`;
}

export type Template = { id: string; name: string; thumb: string; category?: string };

let templates: { at: number; list: Template[] } | undefined;

/** YouCam's outfit templates for the clothes changer (cached for an hour). */
export async function listTemplates(): Promise<Template[]> {
  if (templates && Date.now() - templates.at < 3_600_000) return templates.list;
  const list: Template[] = [];
  let token: string | undefined;
  for (let page = 0; page < 5; page++) {
    const q = new URLSearchParams({ page_size: '50', ...(token ? { starting_token: token } : {}) });
    const data = await call<any>(`${TEMPLATES_PATH}?${q}`);
    const items: any[] = data?.templates ?? data?.results ?? data?.items ?? (Array.isArray(data) ? data : []);
    for (const t of items) {
      const id = t.id ?? t.template_id;
      const thumb = t.thumb ?? t.thumbnail ?? t.thumb_url ?? t.thumbnail_url ?? t.image_url ?? t.url;
      if (id && thumb) list.push({ id: String(id), thumb, name: t.title ?? t.name ?? t.style_name ?? 'Style', category: t.category ?? t.category_name });
    }
    token = data?.next_token ?? data?.starting_token ?? undefined;
    if (!token) break;
  }
  templates = { at: Date.now(), list };
  return list;
}

export type TaskResult = { status: 'running' } | { status: 'error'; error: string } | { status: 'success'; url: string };

export async function getTask(taskId: string): Promise<TaskResult> {
  const [kind, id] = taskId.includes('.') ? (taskId.split('.', 2) as [TaskKind, string]) : (['v4', taskId] as const);
  if (!(kind in TASK_PATHS)) throw new YouCamError('Unknown task', 400);
  const t = await call<{ task_status: string; error?: string | null; results?: any }>(`${TASK_PATHS[kind]}/${encodeURIComponent(id)}`);
  if (t.task_status === 'error') return { status: 'error', error: t.error || 'YouCam could not complete this try-on' };
  if (t.task_status !== 'success') return { status: 'running' };
  const r = t.results;
  const url = r?.url ?? r?.output_url ?? (Array.isArray(r) ? r[0]?.url : undefined) ?? r?.images?.[0]?.url;
  return url ? { status: 'success', url } : { status: 'error', error: 'Try-on finished but returned no image' };
}

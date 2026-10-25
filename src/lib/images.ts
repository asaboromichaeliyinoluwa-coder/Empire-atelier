/** Image helpers: downscale uploads, grab video frames, sample colours. */

const MAX_EDGE = 1600;

function toCanvas(src: CanvasImageSource, w: number, h: number, mirror = false) {
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext('2d')!;
  if (mirror) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = src;
  });
}

/** Reads a picked file, fixes orientation (browsers apply EXIF on decode) and downsizes to JPEG. */
export async function fileToDataUrl(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    return toCanvas(img, img.naturalWidth, img.naturalHeight).toDataURL('image/jpeg', 0.9);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function captureVideo(video: HTMLVideoElement, mirror: boolean): string {
  return toCanvas(video, video.videoWidth, video.videoHeight, mirror).toDataURL('image/jpeg', 0.92);
}

export async function downscale(dataUrl: string, edge = 640, quality = 0.82): Promise<string> {
  const img = await loadImage(dataUrl);
  const s = Math.min(1, edge / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * s);
  c.height = Math.round(img.naturalHeight * s);
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', quality);
}

/** Median colour of small patches at normalised points (used for on-device skin sampling). */
export function samplePatches(img: HTMLImageElement, points: { x: number; y: number }[], radius = 0.018): string {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const r = Math.max(3, Math.round(radius * Math.min(c.width, c.height)));
  const rs: number[] = [], gs: number[] = [], bs: number[] = [];
  for (const p of points) {
    const { data } = ctx.getImageData(Math.round(p.x * c.width) - r, Math.round(p.y * c.height) - r, r * 2, r * 2);
    for (let i = 0; i < data.length; i += 4) {
      rs.push(data[i]);
      gs.push(data[i + 1]);
      bs.push(data[i + 2]);
    }
  }
  const med = (a: number[]) => a.sort((x, y) => x - y)[Math.floor(a.length / 2)] ?? 0;
  return '#' + [med(rs), med(gs), med(bs)].map((v) => v.toString(16).padStart(2, '0')).join('');
}

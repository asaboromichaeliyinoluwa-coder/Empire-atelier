/**
 * On-device body tracking with MediaPipe Pose (WebAssembly in the browser). It places garments on
 * the photo for the instant try-on preview; YouCam's render replaces the preview when a key is set.
 */
import { FilesetResolver, PoseLandmarker, type NormalizedLandmark } from '@mediapipe/tasks-vision';

// VITE_MEDIAPIPE_BASE points at self-hosted copies (wasm/, pose_landmarker.task).
const SELF = import.meta.env.VITE_MEDIAPIPE_BASE?.replace(/\/$/, '');
// Hosts that only serve web file types get the model under another extension (bytes unchanged).
const MODEL_EXT = import.meta.env.VITE_MEDIAPIPE_MODEL_EXT || '.task';
const abs = (p: string) => new URL(p, document.baseURI).href;
const WASM = SELF ? abs(`${SELF}/wasm`) : 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm';
const MODEL = SELF
  ? abs(`${SELF}/pose_landmarker${MODEL_EXT}`)
  : 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

let pose: Promise<PoseLandmarker> | undefined;

function load() {
  pose ??= FilesetResolver.forVisionTasks(WASM).then((v) =>
    PoseLandmarker.createFromOptions(v, {
      baseOptions: { modelAssetPath: MODEL, delegate: 'GPU' },
      runningMode: 'IMAGE',
      numPoses: 1,
    }),
  );
  pose.catch(() => (pose = undefined));
  return pose;
}

export type Pt = { x: number; y: number };
/** Body points in pixels. Left/right are as seen in the photo, not the wearer's own left. */
export type Body = {
  shoulders: [Pt, Pt];
  hips: [Pt, Pt];
  ankles?: [Pt, Pt];
};

const seen = (l: NormalizedLandmark) => (l.visibility ?? 1) > 0.5;

export async function detectBody(img: HTMLImageElement): Promise<Body | null> {
  const r = (await load()).detect(img);
  const l = r.landmarks[0];
  if (!l) return null;
  const px = (i: number): Pt => ({ x: l[i].x * img.naturalWidth, y: l[i].y * img.naturalHeight });
  const pair = (a: number, b: number): [Pt, Pt] => {
    const [p, q] = [px(a), px(b)];
    return p.x <= q.x ? [p, q] : [q, p];
  };
  if (![11, 12, 23, 24].every((i) => seen(l[i]))) return null;
  return {
    shoulders: pair(11, 12),
    hips: pair(23, 24),
    ankles: seen(l[27]) && seen(l[28]) ? pair(27, 28) : undefined,
  };
}

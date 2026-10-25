/**
 * Flat-lay garment illustrations, drawn as SVG so every product has a clean, transparent image
 * that also works as the on-device try-on overlay. Replace with real product photos by setting
 * `image` / `tryOnImage` on a product in catalog.ts.
 *
 * Art space is 200 × 240. `anchors` say where the body sits in that space so the try-on preview
 * can map the garment onto pose landmarks.
 */

export type GarmentKind =
  | 'cami' | 'blouse' | 'knit' | 'blazer' | 'trench'
  | 'midi-dress' | 'slip-dress' | 'gown' | 'mini-dress' | 'jumpsuit'
  | 'skirt' | 'pleated-skirt' | 'trousers' | 'jeans'
  | 'heels' | 'sneakers' | 'tote' | 'clutch'
  | 'shirt' | 'tee' | 'polo' | 'bomber' | 'kaftan' | 'agbada' | 'shorts'
  | 'loafers' | 'oxford' | 'briefcase' | 'backpack';

export type Pattern = 'stripe' | 'dots' | 'floral' | 'plaid';

type Pt = [number, number];
/**
 * Upper anchors are the wearer's shoulders; lower anchors are the hips. `bottom` is the hem.
 * `reach` is how far down the leg a lower garment ends (1 = ankle), so shorts stop above the knee.
 */
export type ArtAnchors = { shoulders?: [Pt, Pt]; hips?: [Pt, Pt]; bottom: number; reach?: number };

type Art = { body: string; details?: string; anchors: ArtAnchors };

const ART: Record<GarmentKind, Art> = {
  cami: {
    body: 'M78 18 L82 18 L86 50 Q100 56 114 50 L118 18 L122 18 L126 60 Q134 118 130 168 Q100 174 70 168 Q66 118 74 60 Z',
    details: 'M86 50 Q100 56 114 50 M72 158 Q100 164 128 158',
    anchors: { shoulders: [[62, 22], [138, 22]], bottom: 170 },
  },
  blouse: {
    body: 'M72 24 Q100 34 128 24 L156 36 Q168 92 176 150 L160 155 Q150 112 142 78 L141 170 Q100 176 59 170 L58 78 Q50 112 40 155 L24 150 Q32 92 44 36 Z',
    details: 'M88 27 L100 48 L112 27 M100 48 L100 168 M42 146 L58 150 M158 150 L142 146 M100 72 m-2 0 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0 M100 100 m-2 0 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0 M100 128 m-2 0 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0',
    anchors: { shoulders: [[50, 32], [150, 32]], bottom: 172 },
  },
  knit: {
    body: 'M74 22 Q100 30 126 22 L156 36 Q170 96 174 152 L156 156 Q150 112 142 80 L142 168 Q100 172 58 168 L58 80 Q50 112 44 156 L26 152 Q30 96 44 36 Z',
    details: 'M80 24 Q100 40 120 24 M60 158 L140 158 M60 162 L140 162 M28 144 L44 147 M156 147 L172 144 M70 60 L70 150 M85 60 L85 150 M100 60 L100 150 M115 60 L115 150 M130 60 L130 150',
    anchors: { shoulders: [[50, 32], [150, 32]], bottom: 170 },
  },
  blazer: {
    body: 'M70 22 Q100 30 130 22 L158 34 Q170 96 176 162 L158 166 Q150 120 144 82 L146 186 Q100 192 54 186 L56 82 Q50 120 42 166 L24 162 Q30 96 42 34 Z',
    details: 'M84 24 L100 98 L116 24 M84 24 L76 52 L92 60 M116 24 L124 52 L108 60 M100 98 L100 188 M66 140 L86 140 M114 140 L134 140 M104 112 m-2.5 0 a2.5 2.5 0 1 0 5 0 a2.5 2.5 0 1 0 -5 0 M104 134 m-2.5 0 a2.5 2.5 0 1 0 5 0 a2.5 2.5 0 1 0 -5 0',
    anchors: { shoulders: [[50, 30], [150, 30]], bottom: 190 },
  },
  trench: {
    body: 'M70 20 Q100 28 130 20 L158 32 Q170 100 176 170 L158 174 Q150 124 144 84 L150 234 Q100 240 50 234 L56 84 Q50 124 42 174 L24 170 Q30 100 42 32 Z',
    details: 'M82 22 L100 92 L118 22 M82 22 L72 54 L92 62 M118 22 L128 54 L108 62 M100 92 L100 236 M56 112 L144 112 M56 120 L144 120 M92 108 L108 108 L108 124 L92 124 Z M86 86 m-2.5 0 a2.5 2.5 0 1 0 5 0 a2.5 2.5 0 1 0 -5 0 M114 86 m-2.5 0 a2.5 2.5 0 1 0 5 0 a2.5 2.5 0 1 0 -5 0',
    anchors: { shoulders: [[50, 28], [150, 28]], bottom: 236 },
  },
  'midi-dress': {
    body: 'M78 20 L86 20 Q100 40 114 20 L122 20 L128 62 Q124 82 118 94 Q148 168 164 226 Q100 236 36 226 Q52 168 82 94 Q76 82 72 62 Z',
    details: 'M82 94 Q100 100 118 94 M86 20 Q100 40 114 20 M92 100 Q88 160 80 228 M108 100 Q112 160 120 228',
    anchors: { shoulders: [[62, 22], [138, 22]], bottom: 230 },
  },
  'slip-dress': {
    body: 'M80 16 L83 16 L86 48 Q100 58 114 48 L117 16 L120 16 L126 58 Q132 110 130 150 Q138 200 142 230 Q100 238 58 230 Q62 200 70 150 Q68 110 74 58 Z',
    details: 'M86 48 Q100 58 114 48 M74 84 Q100 92 126 84',
    anchors: { shoulders: [[62, 20], [138, 20]], bottom: 232 },
  },
  gown: {
    body: 'M76 18 Q100 30 124 18 L130 60 Q126 82 120 94 Q160 170 182 234 Q100 242 18 234 Q40 170 80 94 Q74 82 70 60 Z',
    details: 'M80 94 Q100 102 120 94 M90 102 Q78 170 66 236 M110 102 Q122 170 134 236 M100 104 L100 238',
    anchors: { shoulders: [[62, 20], [138, 20]], bottom: 238 },
  },
  'mini-dress': {
    body: 'M74 22 Q100 34 126 22 L150 34 Q154 52 152 66 L136 64 L134 90 Q150 126 158 158 Q100 168 42 158 Q50 126 66 90 L64 64 L48 66 Q46 52 50 34 Z',
    details: 'M86 25 Q100 40 114 25 M66 90 Q100 98 134 90',
    anchors: { shoulders: [[54, 30], [146, 30]], bottom: 162 },
  },
  jumpsuit: {
    body: 'M78 20 L86 20 Q100 40 114 20 L122 20 L128 62 Q126 84 124 96 L146 232 L108 232 L100 130 L92 232 L54 232 L76 96 Q74 84 72 62 Z',
    details: 'M76 96 Q100 104 124 96 M86 20 Q100 40 114 20 M100 104 L100 130',
    anchors: { shoulders: [[62, 22], [138, 22]], bottom: 232 },
  },
  skirt: {
    body: 'M68 18 L132 18 L134 32 Q150 120 162 214 Q100 224 38 214 Q50 120 66 32 Z',
    details: 'M66 32 L134 32 M88 34 Q82 120 76 218 M112 34 Q118 120 124 218',
    anchors: { hips: [[66, 46], [134, 46]], bottom: 220 },
  },
  'pleated-skirt': {
    body: 'M68 18 L132 18 L134 32 Q152 120 164 214 Q100 224 36 214 Q48 120 66 32 Z',
    details: 'M66 32 L134 32 M74 34 L52 216 M82 34 L68 218 M91 34 L84 220 M100 34 L100 220 M109 34 L116 220 M118 34 L132 218 M126 34 L148 216',
    anchors: { hips: [[66, 46], [134, 46]], bottom: 220 },
  },
  trousers: {
    body: 'M66 16 L134 16 L136 30 Q144 120 150 230 L108 232 L100 86 L92 232 L50 230 Q56 120 64 30 Z',
    details: 'M64 30 L136 30 M80 32 L74 230 M120 32 L126 230 M100 30 L100 86',
    anchors: { hips: [[64, 46], [136, 46]], bottom: 232 },
  },
  jeans: {
    body: 'M68 16 L132 16 L134 30 Q138 120 136 230 L106 232 L100 88 L94 232 L64 230 Q62 120 66 30 Z',
    details: 'M66 30 L134 30 M70 36 Q78 58 94 54 M130 36 Q122 58 106 54 M100 30 L100 88 M66 226 L94 226 M106 226 L134 226',
    anchors: { hips: [[66, 46], [134, 46]], bottom: 232 },
  },
  heels: {
    body: 'M18 192 Q18 176 40 172 Q78 166 104 152 Q126 138 142 116 Q152 106 164 110 Q172 116 170 132 L166 152 L160 152 L157 206 L151 206 L149 156 Q130 162 112 178 Q92 194 60 196 L26 198 Q18 198 18 192 Z',
    details: 'M40 172 Q62 158 84 160 Q110 150 134 124 M22 190 Q60 188 98 182',
    anchors: { bottom: 208 },
  },
  sneakers: {
    body: 'M26 150 Q30 112 70 108 L110 108 Q132 128 168 136 Q182 140 180 158 L180 170 L24 170 Z',
    details: 'M24 158 L180 158 M74 112 L84 132 M84 112 L94 132 M94 112 L104 132 M120 132 Q140 150 168 146',
    anchors: { bottom: 172 },
  },
  tote: {
    body: 'M40 92 L160 92 L170 214 Q100 222 30 214 Z',
    details: 'M70 92 Q70 40 100 40 Q130 40 130 92 M78 92 Q78 52 100 52 Q122 52 122 92 M40 108 L160 108',
    anchors: { bottom: 220 },
  },
  clutch: {
    body: 'M30 100 L170 100 Q178 100 178 108 L178 168 Q178 176 170 176 L30 176 Q22 176 22 168 L22 108 Q22 100 30 100 Z',
    details: 'M22 104 L100 146 L178 104 M96 146 L104 146 L104 156 L96 156 Z',
    anchors: { bottom: 178 },
  },
  shirt: {
    body: 'M74 22 Q100 30 126 22 L156 34 Q168 92 174 156 L158 160 Q150 114 143 80 L143 174 Q100 180 57 174 L57 80 Q50 114 42 160 L26 156 Q32 92 44 34 Z',
    details: 'M82 20 L100 40 L118 20 M82 20 L88 36 L100 40 M118 20 L112 36 L100 40 M100 40 L100 176 M28 148 L42 152 M158 152 L172 148 M66 70 L84 70 L84 84 L66 84 M100 64 m-2 0 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0 M100 92 m-2 0 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0 M100 120 m-2 0 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0 M100 148 m-2 0 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0',
    anchors: { shoulders: [[50, 30], [150, 30]], bottom: 178 },
  },
  tee: {
    body: 'M72 24 Q100 34 128 24 L160 38 L176 78 L152 88 L142 72 L142 172 Q100 176 58 172 L58 72 L48 88 L24 78 L40 38 Z',
    details: 'M84 27 Q100 40 116 27 M150 84 L172 74 M50 84 L28 74',
    anchors: { shoulders: [[52, 32], [148, 32]], bottom: 174 },
  },
  polo: {
    body: 'M72 24 Q100 34 128 24 L160 38 L176 78 L152 88 L142 72 L142 172 Q100 176 58 172 L58 72 L48 88 L24 78 L40 38 Z',
    details: 'M84 26 L100 38 L116 26 M84 26 L90 40 L100 38 M116 26 L110 40 L100 38 M100 38 L100 68 M100 48 m-2 0 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0 M100 60 m-2 0 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0 M150 84 L172 74 M50 84 L28 74 M60 166 L140 166',
    anchors: { shoulders: [[52, 32], [148, 32]], bottom: 174 },
  },
  bomber: {
    body: 'M70 22 Q100 30 130 22 L158 34 Q170 96 176 160 L158 166 Q150 120 144 82 L144 160 L146 172 Q100 178 54 172 L56 160 L56 82 Q50 120 42 166 L24 160 Q30 96 42 34 Z',
    details: 'M84 24 Q100 34 116 24 M100 30 L100 172 M56 160 L144 160 M24 154 L42 158 M158 158 L176 154 M66 92 L80 120 M134 92 L120 120',
    anchors: { shoulders: [[50, 30], [150, 30]], bottom: 174 },
  },
  kaftan: {
    body: 'M72 22 Q100 32 128 22 L156 34 Q168 96 174 160 L158 164 Q150 120 144 84 L146 160 L140 162 L136 232 L106 234 L100 164 L94 234 L64 232 L60 162 L54 160 L56 84 Q50 120 42 164 L26 160 Q32 96 44 34 Z',
    details: 'M86 24 L100 34 L114 24 M100 34 L100 96 M54 160 L146 160 M68 76 L86 76 M92 40 L108 40 M90 50 L110 50',
    anchors: { shoulders: [[50, 30], [150, 30]], bottom: 234 },
  },
  agbada: {
    body: 'M76 20 Q100 30 124 20 L192 60 L186 150 Q160 160 140 150 L146 232 Q100 238 54 232 L60 150 Q40 160 14 150 L8 60 Z',
    details: 'M84 22 Q100 52 116 22 M88 24 Q100 44 112 24 M92 64 Q100 74 108 64 M100 56 L100 110 M14 140 Q40 150 60 142 M186 140 Q160 150 140 142 M86 80 Q100 92 114 80',
    anchors: { shoulders: [[46, 32], [154, 32]], bottom: 236 },
  },
  shorts: {
    body: 'M66 18 L134 18 L136 32 Q142 70 146 120 L106 124 L100 76 L94 124 L54 120 Q58 70 64 32 Z',
    details: 'M64 32 L136 32 M100 32 L100 76 M72 38 Q80 56 92 52 M128 38 Q120 56 108 52',
    anchors: { hips: [[64, 46], [136, 46]], bottom: 124, reach: 0.42 },
  },
  loafers: {
    body: 'M20 170 Q22 150 52 146 Q84 140 104 132 Q118 126 134 128 Q164 132 178 150 Q184 160 180 170 Z',
    details: 'M60 146 Q80 152 104 142 M84 142 L84 152 L112 150 L110 138 M20 164 L180 164',
    anchors: { bottom: 172 },
  },
  oxford: {
    body: 'M20 170 Q22 148 54 144 Q82 136 102 124 Q116 118 134 122 Q166 130 178 150 Q184 160 180 170 Z',
    details: 'M134 124 Q122 140 130 152 M96 130 L108 142 M102 126 L114 138 M108 122 L120 134 M20 164 L180 164',
    anchors: { bottom: 172 },
  },
  briefcase: {
    body: 'M24 96 L176 96 Q182 96 182 102 L182 196 Q182 202 176 202 L24 202 Q18 202 18 196 L18 102 Q18 96 24 96 Z',
    details: 'M78 96 L78 80 Q78 74 84 74 L116 74 Q122 74 122 80 L122 96 M18 130 L182 130 M92 126 L108 126 L108 138 L92 138 Z',
    anchors: { bottom: 204 },
  },
  backpack: {
    body: 'M50 70 Q50 40 100 40 Q150 40 150 70 L156 210 Q156 220 146 220 L54 220 Q44 220 44 210 Z',
    details: 'M80 40 Q80 20 100 20 Q120 20 120 40 M50 90 L150 90 M50 90 Q100 120 150 90 M70 140 L130 140 L132 200 L68 200 Z',
    anchors: { bottom: 222 },
  },
};

export const artAnchors = (kind: GarmentKind) => ART[kind].anchors;

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(Math.max(0, Math.min(255, amt > 0 ? v + (255 - v) * amt : v * (1 + amt))));
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(f);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const isLight = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 > 170;
};

function patternDef(p: Pattern, ink: string) {
  switch (p) {
    case 'stripe':
      return `<pattern id="p" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="4" height="10" fill="${ink}" opacity=".55"/></pattern>`;
    case 'dots':
      return `<pattern id="p" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="1.8" fill="${ink}" opacity=".7"/></pattern>`;
    case 'plaid':
      return `<pattern id="p" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="5" fill="${ink}" opacity=".3"/><rect width="5" height="22" fill="${ink}" opacity=".3"/><rect y="13" width="22" height="1" fill="${ink}" opacity=".5"/></pattern>`;
    case 'floral':
      return `<pattern id="p" width="28" height="28" patternUnits="userSpaceOnUse">${[[7, 7], [21, 21]]
        .map(([x, y]) => [0, 72, 144, 216, 288].map((a) => {
          const r = (a * Math.PI) / 180;
          return `<circle cx="${(x + Math.cos(r) * 2.6).toFixed(1)}" cy="${(y + Math.sin(r) * 2.6).toFixed(1)}" r="2" fill="${ink}" opacity=".6"/>`;
        }).join('') + `<circle cx="${x}" cy="${y}" r="1.3" fill="#c9a96e"/>`)
        .join('')}</pattern>`;
  }
}

/** Standalone SVG markup (its own ids), safe to use as an <img> data URI or to draw on a canvas. */
export function garmentSvg(kind: GarmentKind, color: string, pattern?: Pattern, accent?: string) {
  const a = ART[kind];
  const line = isLight(color) ? shade(color, -0.32) : shade(color, 0.28);
  const ink = accent ?? (isLight(color) ? shade(color, -0.45) : shade(color, 0.5));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="400" height="480">
<defs>
<linearGradient id="g" x1="0" x2="1" y1="0" y2="0.25"><stop offset="0" stop-color="${shade(color, 0.16)}"/><stop offset=".55" stop-color="${color}"/><stop offset="1" stop-color="${shade(color, -0.16)}"/></linearGradient>
<linearGradient id="s" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
${pattern ? patternDef(pattern, ink) : ''}
</defs>
<path d="${a.body}" fill="url(#g)"/>
${pattern ? `<path d="${a.body}" fill="url(#p)"/>` : ''}
<path d="${a.body}" fill="url(#s)"/>
${a.details ? `<path d="${a.details}" fill="none" stroke="${line}" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>` : ''}
<path d="${a.body}" fill="none" stroke="${line}" stroke-width="1.3" stroke-linejoin="round"/>
</svg>`;
}

export const svgDataUri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

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
  | 'loafers' | 'oxford' | 'briefcase' | 'backpack'
  | 'slides' | 'chunky-sneaker' | 'top-handle' | 'hoodie' | 'scarf'
  | 'slide-band' | 'slide-cross' | 'slide-notch' | 'thong' | 'rope-slide' | 'tank' | 'flare-jeans'
  | 'watch' | 'belt' | 'pendant' | 'bangle' | 'ring' | 'sunglasses' | 'duffel' | 'trunk' | 'crossbody' | 'wallet' | 'biker';

/** How the surface is rendered: highlights, grain and stitching follow the real material. */
export type Finish = 'rib' | 'waxed' | 'cotton' | 'leather' | 'suede' | 'satin' | 'denim' | 'knit' | 'wool' | 'linen' | 'canvas' | 'metal' | 'nylon';

/** Reads the finish from a product's material description. */
export function finishFor(material: string): Finish {
  const m = material.toLowerCase();
  if (/^(?:\d+\s?(?:k|ct)\s)?(gold|silver|steel|stainless|brass|platinum|titanium|sterling|rhodium|metal|enamel)/.test(m)) return 'metal';
  if (/nylon|ripstop|technical/.test(m)) return 'nylon';
  if (/wax/.test(m)) return 'waxed';
  if (/suede|nubuck/.test(m)) return 'suede';
  if (/leather|calf|patent|lambskin|vachetta/.test(m)) return 'leather';
  if (/denim/.test(m)) return 'denim';
  if (/silk|satin|charmeuse/.test(m)) return 'satin';
  if (/\brib/.test(m)) return 'rib';
  if (/cashmere|merino|knit|piqué|pique|fleece/.test(m)) return 'knit';
  if (/wool|tweed|bouclé|boucle|flannel|velvet/.test(m)) return 'wool';
  if (/linen/.test(m)) return 'linen';
  if (/canvas|gabardine/.test(m)) return 'canvas';
  return 'cotton';
}

/**
 * Prints. The last six are the Maison edit's house signatures: original Empire Atelier motifs in the
 * spirit of luxury-house canvases (a star monogram, quilting, a heritage stripe, houndstooth, baroque
 * scrolls and a house check). No other brand's logos or trademarked patterns are used.
 */
export type Pattern = 'stripe' | 'dots' | 'floral' | 'plaid' | 'monogram' | 'quilted' | 'heritage' | 'houndstooth' | 'baroque' | 'check' | 'chevron';

type Pt = [number, number];
/**
 * Upper anchors are the wearer's shoulders; lower anchors are the hips. `bottom` is the hem.
 * `reach` is how far down the leg a lower garment ends (1 = ankle), so shorts stop above the knee.
 */
export type ArtAnchors = { shoulders?: [Pt, Pt]; hips?: [Pt, Pt]; bottom: number; reach?: number };

/** Extra shapes: `under` is drawn beneath the main body (soles), `over` on top (trim, stitching, cut-outs). */
type Shape = { d: string; fill?: string; stroke?: string; sw?: number };
type Art = { body: string; details?: string; anchors: ArtAnchors; under?: Shape[]; over?: Shape[] };

/** A foot-shaped sole seen from above, toe at the top. */
const FOOT = 'M100 10 Q148 10 152 62 Q155 112 146 152 Q140 190 140 208 Q138 236 100 236 Q62 236 60 208 Q60 190 54 152 Q45 112 48 62 Q52 10 100 10 Z';
const INFOOT = 'M100 20 Q140 20 143 64 Q146 112 137 152 Q131 190 131 208 Q129 227 100 227 Q71 227 69 208 Q69 190 63 152 Q54 112 57 64 Q60 20 100 20 Z';

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
  slides: {
    body: 'M100 26 Q142 26 148 78 Q152 120 144 150 Q138 178 141 202 Q142 230 100 232 Q58 230 59 202 Q62 178 56 150 Q48 120 52 78 Q58 26 100 26 Z',
    details: 'M100 38 Q134 38 138 80 Q140 118 132 150 Q128 178 130 202 Q130 220 100 222 Q70 220 70 202 Q72 178 68 150 Q60 118 62 80 Q66 38 100 38 M54 86 Q100 78 146 86 L148 132 Q100 140 52 132 Z M86 84 L86 104 L114 104 L114 84 M86 136 L86 116 L114 116 L114 136',
    anchors: { bottom: 232 },
  },
  'chunky-sneaker': {
    body: 'M20 140 Q24 102 64 98 L104 98 Q128 116 164 124 Q186 130 184 150 L186 188 Q100 196 16 188 Z',
    details: 'M16 160 Q100 168 186 160 M18 175 Q100 183 186 175 M70 102 L80 124 M82 102 L92 124 M94 102 L104 124 M34 140 Q76 126 120 132 Q150 142 176 144 M150 128 L160 160',
    anchors: { bottom: 192 },
  },
  'top-handle': {
    body: 'M34 100 L166 100 L178 214 Q100 222 22 214 Z',
    details: 'M34 100 L52 148 L148 148 L166 100 M76 100 Q76 54 100 54 Q124 54 124 100 M84 100 Q84 64 100 64 Q116 64 116 100 M93 148 L107 148 L107 166 L93 166 Z M60 138 L70 162 M140 138 L130 162 M24 200 Q100 208 176 200',
    anchors: { bottom: 220 },
  },
  hoodie: {
    body: 'M64 32 Q68 6 100 6 Q132 6 136 32 L166 46 Q180 106 184 168 L162 172 Q156 124 148 94 L150 198 Q100 204 50 198 L52 94 Q44 124 38 172 L16 168 Q20 106 34 46 Z',
    details: 'M78 32 Q100 54 122 32 Q120 14 100 14 Q80 14 78 32 M92 50 L90 80 M108 50 L110 80 M68 138 L132 138 L140 172 L60 172 Z M52 188 L148 188 M18 158 L38 162 M162 162 L182 158',
    anchors: { shoulders: [[44, 42], [156, 42]], bottom: 200 },
  },
  scarf: {
    body: 'M100 20 L180 100 L100 180 L20 100 Z',
    details: 'M100 34 L166 100 L100 166 L34 100 Z M100 46 L154 100 L100 154 L46 100 Z',
    anchors: { bottom: 182 },
  },
  'slide-band': {
    body: 'M49 70 Q100 54 151 70 L153 128 Q100 142 47 128 Z',
    details: 'M49 76 Q100 60 151 76 M47 122 Q100 136 153 122',
    under: [{ d: FOOT, fill: '@sole' }, { d: INFOOT, fill: '@insole' }],
    over: [{ d: 'M49 92 Q100 78 151 92 L151.5 98 Q100 84 48.5 98 Z', fill: '@accent' }, { d: 'M48.5 104 Q100 90 151.5 104 L152 109 Q100 95 48 109 Z', fill: '@accent' }],
    anchors: { bottom: 238 },
  },
  'slide-cross': {
    body: 'M49 78 L151 114 L152 142 L48 106 Z M151 78 L152 106 L48 142 L49 114 Z',
    details: 'M52 84 L148 118 M148 84 L52 118',
    under: [{ d: FOOT, fill: '@sole' }, { d: INFOOT, fill: '@insole' }],
    over: [{ d: 'M126 84 L132 80 L146 86 L140 92 Z', fill: '@accent' }],
    anchors: { bottom: 238 },
  },
  'slide-notch': {
    body: 'M48 66 Q100 50 152 66 L152 140 Q100 152 48 140 Z',
    details: 'M50 72 Q100 57 150 72',
    under: [{ d: FOOT, fill: '@sole' }, { d: INFOOT, fill: '@insole' }],
    over: [{ d: 'M80 146 L80 106 Q80 96 90 96 L110 96 Q120 96 120 106 L120 146 Q100 152 80 146 Z', fill: '@insole' }, { d: 'M138 82 L146 82 L146 90 L138 90 Z', fill: '@accent' }],
    anchors: { bottom: 238 },
  },
  thong: {
    body: 'M52 64 Q70 56 100 104 Q130 56 148 64 L152 94 Q124 104 106 138 L94 138 Q76 104 48 94 Z',
    details: 'M58 72 Q76 66 100 108 Q124 66 142 72 M56 92 Q78 98 94 130 M144 92 Q122 98 106 130',
    under: [{ d: FOOT, fill: '@sole' }, { d: INFOOT, fill: '@insole' }, { d: 'M100 120 L100 138', stroke: '@insole', sw: 7 }],
    anchors: { bottom: 238 },
  },
  'rope-slide': {
    body: 'M50 68 Q100 52 150 68 L150 146 L118 146 L118 110 Q118 100 108 100 L92 100 Q82 100 82 110 L82 146 L50 146 Z',
    details: 'M52 74 Q100 59 148 74 M50 142 L82 142 M118 142 L150 142',
    under: [{ d: FOOT, fill: '@rope' }, { d: 'M70 166 Q70 150 100 150 Q130 150 130 166 L132 210 Q132 226 100 226 Q68 226 68 210 Z', fill: '@insole' }],
    anchors: { bottom: 238 },
  },
  tank: {
    body: 'M74 22 Q100 44 126 22 L142 30 Q154 76 146 106 L150 182 Q100 188 50 182 L54 106 Q46 76 58 30 Z',
    details: 'M62 92 L60 178 M138 92 L140 178 M50 176 Q100 182 150 176',
    over: [
      { d: 'M74 22 Q100 44 126 22', stroke: '@accent', sw: 7 },
      { d: 'M58 30 Q46 76 54 106', stroke: '@accent', sw: 7 },
      { d: 'M142 30 Q154 76 146 106', stroke: '@accent', sw: 7 },
    ],
    anchors: { shoulders: [[58, 32], [142, 32]], bottom: 184 },
  },
  'flare-jeans': {
    body: 'M58 14 L142 14 L146 36 Q150 80 160 140 L176 228 Q146 236 108 230 L100 96 L92 230 Q54 236 24 228 L40 140 Q50 80 54 36 Z',
    details: 'M54 30 L146 30 M100 30 L100 96 M62 32 Q64 58 84 64 M138 32 Q136 58 116 64 M44 128 Q66 142 92 130 M108 130 Q134 142 156 128 M46 150 Q70 156 88 150 M112 150 Q132 156 154 150 M34 214 Q62 222 90 214 M110 214 Q138 222 166 214',
    anchors: { hips: [[54, 34], [146, 34]], bottom: 232 },
  },
  watch: {
    body: 'M80 6 L120 6 L124 70 L76 70 Z M76 170 L124 170 L120 234 L80 234 Z',
    details: 'M86 16 L114 16 M86 24 L114 24 M86 216 L114 216 M86 224 L114 224 M100 184 m-1.6 0 a1.6 1.6 0 1 0 3.2 0 a1.6 1.6 0 1 0 -3.2 0 M100 196 m-1.6 0 a1.6 1.6 0 1 0 3.2 0 a1.6 1.6 0 1 0 -3.2 0 M100 208 m-1.6 0 a1.6 1.6 0 1 0 3.2 0 a1.6 1.6 0 1 0 -3.2 0',
    over: [
      { d: 'M72 66 L128 66 L124 82 L76 82 Z M76 158 L124 158 L128 174 L72 174 Z', fill: '@metal' },
      { d: 'M144 114 L156 114 L156 126 L144 126 Z', fill: '@metal' },
      { d: 'M52 120 a48 48 0 1 0 96 0 a48 48 0 1 0 -96 0', fill: '@metal' },
      { d: 'M60 120 a40 40 0 1 0 80 0 a40 40 0 1 0 -80 0', fill: '@dial' },
      { d: 'M100 86 L100 94 M100 146 L100 154 M66 120 L74 120 M126 120 L134 120 M76 96 L80 100 M124 96 L120 100 M76 144 L80 140 M124 144 L120 140', stroke: '@metal', sw: 2.4 },
      { d: 'M100 120 L100 98 M100 120 L118 130', stroke: '@metal', sw: 3 },
      { d: 'M96 120 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0', fill: '@metal' },
    ],
    anchors: { bottom: 236 },
  },
  belt: {
    body: 'M10 100 L132 100 L132 140 L10 140 Q2 120 10 100 Z M162 100 L192 100 L192 140 L162 140 Z',
    details: 'M12 106 L130 106 M12 134 L130 134 M164 106 L190 106 M164 134 L190 134 M34 120 m-2.6 0 a2.6 2.6 0 1 0 5.2 0 a2.6 2.6 0 1 0 -5.2 0 M52 120 m-2.6 0 a2.6 2.6 0 1 0 5.2 0 a2.6 2.6 0 1 0 -5.2 0 M70 120 m-2.6 0 a2.6 2.6 0 1 0 5.2 0 a2.6 2.6 0 1 0 -5.2 0 M88 120 m-2.6 0 a2.6 2.6 0 1 0 5.2 0 a2.6 2.6 0 1 0 -5.2 0',
    over: [
      { d: 'M136 88 L160 88 L160 152 L136 152 Z', stroke: '@metal', sw: 9 },
      { d: 'M136 120 L158 120', stroke: '@metal', sw: 5 },
      { d: 'M116 100 L116 140', stroke: '@metal', sw: 3 },
    ],
    anchors: { bottom: 160 },
  },
  pendant: {
    body: 'M76 150 a24 24 0 1 0 48 0 a24 24 0 1 0 -48 0',
    details: 'M82 150 a18 18 0 1 0 36 0 a18 18 0 1 0 -36 0',
    under: [{ d: 'M38 14 Q100 230 162 14', stroke: '@metal', sw: 3.4 }, { d: 'M92 118 L100 102 L108 118 Z', fill: '@metal' }],
    over: [{ d: 'M100 134 L112 150 L100 166 L88 150 Z', fill: '@accent' }, { d: 'M100 134 L100 166 M88 150 L112 150', stroke: 'rgba(255,255,255,.45)', sw: 0.8 }],
    anchors: { bottom: 180 },
  },
  bangle: {
    body: 'M24 120 a76 66 0 1 1 152 0 a76 66 0 1 1 -152 0 M42 120 a58 48 0 1 0 116 0 a58 48 0 1 0 -116 0',
    details: 'M36 120 a64 54 0 1 1 128 0',
    over: [{ d: 'M88 46 L112 46 L118 62 L82 62 Z', fill: '@accent' }, { d: 'M46 78 L50 74 M154 78 L150 74', stroke: '@accent', sw: 3 }],
    anchors: { bottom: 190 },
  },
  ring: {
    body: 'M44 152 a56 56 0 1 1 112 0 a56 56 0 1 1 -112 0 M62 152 a38 38 0 1 0 76 0 a38 38 0 1 0 -76 0 M70 58 L130 58 L142 102 L58 102 Z',
    details: 'M54 152 a46 46 0 1 1 92 0',
    over: [{ d: 'M80 68 L120 68 L128 94 L72 94 Z', fill: '@accent' }, { d: 'M80 68 L100 94 L120 68 M72 94 L128 94', stroke: 'rgba(255,255,255,.5)', sw: 0.9 }],
    anchors: { bottom: 210 },
  },
  sunglasses: {
    body: 'M10 98 Q10 90 20 90 L86 90 Q98 90 100 104 Q102 90 114 90 L180 90 Q190 90 190 98 L186 132 Q180 168 148 168 Q116 168 110 132 Q100 118 90 132 Q84 168 52 168 Q20 168 14 132 Z',
    details: 'M10 98 L2 92 M190 98 L198 92',
    over: [
      { d: 'M24 100 L82 100 Q94 102 92 128 Q86 158 56 158 Q30 158 26 128 Z', fill: '@dial' },
      { d: 'M176 100 L118 100 Q106 102 108 128 Q114 158 144 158 Q170 158 174 128 Z', fill: '@dial' },
      { d: 'M34 108 L60 106', stroke: 'rgba(255,255,255,.55)', sw: 3 },
      { d: 'M126 108 L152 106', stroke: 'rgba(255,255,255,.55)', sw: 3 },
      { d: 'M97 100 L103 100', stroke: '@metal', sw: 4 },
    ],
    anchors: { bottom: 172 },
  },
  duffel: {
    body: 'M24 100 Q24 82 46 82 L154 82 Q176 82 176 100 L182 176 Q182 198 160 198 L40 198 Q18 198 18 176 Z',
    details: 'M24 108 Q100 124 176 108 M34 142 L70 142 L70 188 L34 188 M130 142 L166 142 L166 188 L130 188 M20 168 L180 168',
    under: [{ d: 'M60 84 Q60 40 100 40 Q140 40 140 84', stroke: '@sole', sw: 9 }],
    over: [{ d: 'M92 108 L108 108 L108 124 L92 124 Z', fill: '@metal' }, { d: 'M54 142 L54 148 M146 142 L146 148', stroke: '@metal', sw: 4 }],
    anchors: { bottom: 200 },
  },
  trunk: {
    body: 'M30 58 L170 58 Q184 58 184 72 L184 186 Q184 200 170 200 L30 200 Q16 200 16 186 L16 72 Q16 58 30 58 Z',
    details: 'M16 106 L184 106 M16 152 L184 152 M58 58 L58 200 M142 58 L142 200',
    under: [{ d: 'M78 60 Q78 36 100 36 Q122 36 122 60', stroke: '@sole', sw: 8 }],
    over: [
      { d: 'M88 100 L112 100 L112 120 L88 120 Z', fill: '@metal' },
      { d: 'M92 108 L108 108', stroke: 'rgba(0,0,0,.45)', sw: 2 },
      { d: 'M20 62 L40 62 L40 70 L28 70 L28 82 L20 82 Z M180 62 L160 62 L160 70 L172 70 L172 82 L180 82 Z M20 196 L40 196 L40 188 L28 188 L28 176 L20 176 Z M180 196 L160 196 L160 188 L172 188 L172 176 L180 176 Z', fill: '@metal' },
    ],
    anchors: { bottom: 204 },
  },
  crossbody: {
    body: 'M42 96 Q42 82 56 82 L144 82 Q158 82 158 96 L158 166 Q158 182 142 182 L58 182 Q42 182 42 166 Z',
    details: 'M42 112 Q100 156 158 112 M48 90 L152 90',
    under: [{ d: 'M54 86 Q54 14 100 14 Q146 14 146 86', stroke: '@sole', sw: 7 }],
    over: [{ d: 'M90 126 L110 126 L110 144 L90 144 Z', fill: '@metal' }, { d: 'M96 134 L104 134', stroke: 'rgba(0,0,0,.4)', sw: 2 }],
    anchors: { bottom: 184 },
  },
  wallet: {
    body: 'M30 70 L170 70 Q180 70 180 80 L180 170 Q180 180 170 180 L30 180 Q20 180 20 170 L20 80 Q20 70 30 70 Z',
    details: 'M20 104 L180 104 M30 78 L170 78 M30 172 L170 172',
    over: [{ d: 'M92 92 L108 92 L108 116 L92 116 Z', fill: '@metal' }],
    anchors: { bottom: 182 },
  },
  biker: {
    body: 'M72 20 L100 32 L128 20 L158 34 Q170 92 180 152 L164 156 Q154 114 146 86 L146 170 Q100 176 54 170 L54 86 Q46 114 36 156 L20 152 Q30 92 42 34 Z',
    details: 'M72 20 L86 66 L100 58 M128 20 L112 74 L100 58 M100 58 L112 170 M44 148 L58 150 M156 148 L142 150 M62 112 L90 118 M138 112 L122 126 M80 150 L88 152',
    over: [{ d: 'M76 24 L88 62 L100 54 L84 24 Z M124 24 L112 70 L100 54 L116 24 Z', fill: 'rgba(255,255,255,.07)' }, { d: 'M100 58 L112 168', stroke: '@metal', sw: 2.2 }, { d: 'M62 112 L90 118', stroke: '@metal', sw: 2.4 }],
    anchors: { shoulders: [[46, 34], [154, 34]], bottom: 172 },
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
    case 'monogram': {
      // Empire Atelier star, a four-petal flower and a diamond, staggered like a monogram canvas.
      const star = (x: number, y: number, r: number) => {
        const pts = Array.from({ length: 10 }, (_, i) => {
          const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r * 0.42 : r;
          return `${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`;
        });
        return `<polygon points="${pts.join(' ')}" fill="${ink}" opacity=".8"/>`;
      };
      const flower = (x: number, y: number) => [0, 90, 180, 270].map((a) => {
        const r = (a * Math.PI) / 180;
        return `<ellipse cx="${(x + Math.cos(r) * 2.4).toFixed(1)}" cy="${(y + Math.sin(r) * 2.4).toFixed(1)}" rx="1.9" ry="1.9" fill="${ink}" opacity=".75"/>`;
      }).join('') + `<circle cx="${x}" cy="${y}" r="0.9" fill="${ink}" opacity=".2"/>`;
      return `<pattern id="p" width="30" height="30" patternUnits="userSpaceOnUse">${star(7.5, 7.5, 4.6)}${flower(22.5, 22.5)}<path d="M22.5 3.5 l3 4 -3 4 -3 -4Z M7.5 18.5 l3 4 -3 4 -3 -4Z" fill="none" stroke="${ink}" stroke-width=".9" opacity=".7"/></pattern>`;
    }
    case 'quilted':
      return `<pattern id="p" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="16" fill="#fff" opacity=".04"/><path d="M0 0H16M0 0V16" stroke="${ink}" stroke-width="1" stroke-dasharray="1.6 1.2" opacity=".75"/><path d="M1.5 1.5H14.5V14.5" fill="none" stroke="#fff" stroke-width="1.2" opacity=".14"/><path d="M1.5 14.5H14.5V1.5" fill="none" stroke="#000" stroke-width="1.2" opacity=".14"/></pattern>`;
    case 'heritage':
      return `<pattern id="p" width="200" height="12" patternUnits="userSpaceOnUse"><rect x="84" width="32" height="12" fill="#5c1f24" opacity=".85"/><rect x="88" width="24" height="12" fill="${ink}" opacity=".9"/><rect x="96" width="8" height="12" fill="#5c1f24" opacity=".85"/><rect x="80" width="2" height="12" fill="#c9a96e"/><rect x="118" width="2" height="12" fill="#c9a96e"/></pattern>`;
    case 'houndstooth':
      return `<pattern id="p" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 0h4l4 4v-4h4v4l-4 4h4v4h-4l-4-4v4H0V8l4-4H0Z" fill="${ink}" opacity=".55"/></pattern>`;
    case 'baroque':
      return `<pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse"><g fill="none" stroke="${ink}" stroke-width="1.3" stroke-linecap="round" opacity=".85"><path d="M20 6c6 0 9 4 9 8s-4 6-7 4M20 6c-6 0-9 4-9 8s4 6 7 4"/><path d="M20 34c6 0 9-4 9-8s-4-6-7-4M20 34c-6 0-9-4-9-8s4-6 7-4"/><path d="M6 20c0-6 4-9 8-9M34 20c0-6-4-9-8-9M6 20c0 6 4 9 8 9M34 20c0 6-4 9-8 9"/><circle cx="20" cy="20" r="3"/><path d="M0 0l4 4M40 0l-4 4M0 40l4-4M40 40l-4-4"/></g><circle cx="20" cy="20" r="1.2" fill="${ink}"/></pattern>`;
    case 'chevron':
      return `<pattern id="p" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M0 4 L7 11 L14 4 M0 -3 L7 4 L14 -3" fill="none" stroke="${ink}" stroke-width="2.2" opacity=".6"/></pattern>`;
    case 'check':
      return `<pattern id="p" width="36" height="36" patternUnits="userSpaceOnUse"><rect y="10" width="36" height="7" fill="#2a1710" opacity=".45"/><rect x="10" width="7" height="36" fill="#2a1710" opacity=".45"/><rect y="25" width="36" height="1.2" fill="#fffeff" opacity=".7"/><rect x="25" width="1.2" height="36" fill="#fffeff" opacity=".7"/><rect y="30" width="36" height="1" fill="${ink}" opacity=".9"/><rect x="30" width="1" height="36" fill="${ink}" opacity=".9"/></pattern>`;
  }
}

/** Soft vertical folds: alternating light and shadow across the width, like fabric falling from the shoulders. */
const FOLDS = [0, 0.14, 0.27, 0.4, 0.52, 0.63, 0.76, 0.88, 1]
  .map((o, i) => `<stop offset="${o}" stop-color="${i % 2 ? '#fff' : '#000'}" stop-opacity="${i % 2 ? '.07' : i === 0 || i === 8 ? '.14' : '.06'}"/>`)
  .join('');

/** Surface grain per material: turbulence frequency and strength. */
const GRAIN: Record<Finish, [string, number]> = {
  cotton: ['1.1', 0.1], rib: ['2.2 0.05', 0.12], waxed: ['0.35 0.9', 0.2], leather: ['0.9', 0.05], suede: ['1.8', 0.2], satin: ['0.5 0.03', 0.05], denim: ['1.4 0.6', 0.16],
  knit: ['0.25 1.6', 0.14], wool: ['0.7', 0.17], linen: ['1.2 0.35', 0.14], canvas: ['1.3', 0.12], metal: ['0.04 1.3', 0.07], nylon: ['1.7', 0.06],
};
/** Leather and denim show their seams. */
const STITCH: Partial<Record<Finish, true>> = { leather: true, denim: true, waxed: true };

function finishDefs(f: Finish) {
  switch (f) {
    case 'leather':
      // A crisp specular highlight and a darker roll at the edges.
      return `<linearGradient id="fx" x1="0" x2="1" y1="0" y2=".35"><stop offset=".18" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff" stop-opacity=".34"/><stop offset=".36" stop-color="#fff" stop-opacity=".05"/><stop offset=".7" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>`;
    case 'satin':
      // Long liquid sheen bands that run with the drape.
      return `<linearGradient id="fx" x1="0" x2=".7" y1="0" y2="1"><stop offset=".1" stop-color="#fff" stop-opacity="0"/><stop offset=".24" stop-color="#fff" stop-opacity=".32"/><stop offset=".34" stop-color="#fff" stop-opacity="0"/><stop offset=".55" stop-color="#000" stop-opacity=".1"/><stop offset=".68" stop-color="#fff" stop-opacity=".22"/><stop offset=".78" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
    case 'rib':
      return `<pattern id="fx" width="3.4" height="6" patternUnits="userSpaceOnUse"><rect width="1.1" height="6" fill="#000" opacity=".16"/><rect x="1.7" width="1" height="6" fill="#fff" opacity=".14"/></pattern>`;
    case 'waxed':
      // Waxed, crinkled coating: sharp, uneven highlights over a dark base.
      return `<linearGradient id="fx" x1="0" x2="1" y1="0" y2=".6"><stop offset=".08" stop-color="#fff" stop-opacity=".02"/><stop offset=".2" stop-color="#fff" stop-opacity=".3"/><stop offset=".27" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".16"/><stop offset=".52" stop-color="#000" stop-opacity=".1"/><stop offset=".72" stop-color="#fff" stop-opacity=".26"/><stop offset=".8" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
    case 'denim':
      return `<pattern id="fx" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><rect width="4" height="1.3" fill="#fff" opacity=".13"/></pattern>`;
    case 'knit':
      return `<pattern id="fx" width="5" height="6" patternUnits="userSpaceOnUse"><path d="M0 0 L2.5 3 L5 0 M0 3 L2.5 6 L5 3" fill="none" stroke="#000" stroke-width=".6" opacity=".14"/></pattern>`;
    case 'linen':
      return `<pattern id="fx" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 1.5H6M0 4.2H6" stroke="#fff" stroke-width=".7" opacity=".14"/><path d="M2 0V6" stroke="#000" stroke-width=".5" opacity=".07"/></pattern>`;
    case 'canvas':
      return `<pattern id="fx" width="3" height="3" patternUnits="userSpaceOnUse"><path d="M0 .75H3M.75 0V3" stroke="#000" stroke-width=".5" opacity=".08"/></pattern>`;
    case 'suede':
      // Matte nap: a soft brushed shading instead of a shine.
      return `<linearGradient id="fx" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".08"/><stop offset=".5" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#000" stop-opacity=".1"/></linearGradient>`;
    case 'metal':
      // Polished metal: hard bright bands and dark reflections across the surface.
      return `<linearGradient id="fx" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".16" stop-color="#fff" stop-opacity=".05"/><stop offset=".32" stop-color="#000" stop-opacity=".28"/><stop offset=".48" stop-color="#fff" stop-opacity=".5"/><stop offset=".62" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity=".3"/><stop offset="1" stop-color="#fff" stop-opacity=".35"/></linearGradient>`;
    case 'nylon':
      // Technical nylon: a ripstop grid under a soft, even sheen.
      return `<pattern id="fx" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M0 3.5H7M3.5 0V7" stroke="#fff" stroke-width=".45" opacity=".16"/><path d="M0 .2H7M.2 0V7" stroke="#000" stroke-width=".4" opacity=".1"/></pattern>`;
    default:
      return '';
  }
}
const finishLayer = (f: Finish, body: string) => (finishDefs(f) ? `<path d="${body}" fill="url(#fx)"/>` : '');

const shapes = (list: Shape[] | undefined, ink: string, parts: { sole?: string; insole?: string }) =>
  (list ?? [])
    .map((sh) => {
      const c = (v?: string) => (v === '@sole' ? parts.sole ?? '#1b181b' : v === '@insole' ? parts.insole ?? '#2a2427' : v === '@accent' ? ink : v === '@rope' ? 'url(#rope)' : v === '@metal' ? 'url(#mt)' : v === '@dial' ? parts.insole ?? '#1b181b' : v ?? 'none');
      return sh.stroke
        ? `<path d="${sh.d}" fill="none" stroke="${c(sh.stroke)}" stroke-width="${sh.sw ?? 2}" stroke-linecap="round"/>`
        : `<path d="${sh.d}" fill="${c(sh.fill)}" stroke="rgba(0,0,0,.25)" stroke-width=".8"/>`;
    })
    .join('');

/** The views a product page offers: the product, a close-up of the material, the back, and a swatch. */
export type View = 'front' | 'detail' | 'back' | 'swatch';
type Parts = { sole?: string; insole?: string; view?: View };

const SWATCH: Art = {
  body: 'M12 18 L188 18 L188 222 L12 222 Z',
  details: 'M22 28 L178 28 L178 212 L22 212 Z',
  anchors: { bottom: 222 },
};

/** Standalone SVG markup (its own ids), safe to use as an <img> data URI or to draw on a canvas. */
export function garmentSvg(kind: GarmentKind, color: string, pattern?: Pattern, accent?: string, finish: Finish = 'cotton', parts: Parts = {}) {
  const view = parts.view ?? 'front';
  const a = view === 'swatch' ? SWATCH : ART[kind];
  const line = isLight(color) ? shade(color, -0.32) : shade(color, 0.28);
  const ink = accent ?? (isLight(color) ? shade(color, -0.45) : shade(color, 0.5));
  const metal = finish === 'metal' ? color : accent ?? '#c9a96e';
  const box = view === 'detail' ? (a.anchors.shoulders ? '52 30 96 115' : a.anchors.hips ? '52 40 96 115' : '52 62 96 115') : '0 0 200 240';
  const mirror = view === 'back' ? ' transform="translate(200 0) scale(-1 1)"' : '';
  const hardware = view !== 'back' && view !== 'swatch';
  const stitchInset = view === 'swatch' ? '' : ' transform="translate(100 120) scale(.955) translate(-100 -120)"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" width="400" height="480">
<defs>
<linearGradient id="g" x1="0" x2="1" y1="0" y2="0.25"><stop offset="0" stop-color="${shade(color, 0.16)}"/><stop offset=".55" stop-color="${color}"/><stop offset="1" stop-color="${shade(color, -0.16)}"/></linearGradient>
<linearGradient id="mt" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${shade(metal, 0.5)}"/><stop offset=".3" stop-color="${metal}"/><stop offset=".5" stop-color="${shade(metal, -0.35)}"/><stop offset=".72" stop-color="${shade(metal, 0.35)}"/><stop offset="1" stop-color="${shade(metal, -0.2)}"/></linearGradient>
<linearGradient id="s" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
<linearGradient id="f" x1="0" x2="1" y1="0" y2="0.08">${FOLDS}</linearGradient>
<radialGradient id="h" cx=".38" cy=".22" r=".55"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<filter id="t" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${GRAIN[finish][0]}" numOctaves="2" seed="4" result="n"/><feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${GRAIN[finish][1] * (view === 'detail' || view === 'swatch' ? 1.7 : 1)} 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
${finishDefs(finish)}
<filter id="d" x="-20%" y="-10%" width="140%" height="130%"><feGaussianBlur in="SourceAlpha" stdDeviation="4"/><feOffset dy="5"/><feComponentTransfer><feFuncA type="linear" slope=".22"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
${pattern ? patternDef(pattern, ink) : ''}
<pattern id="rope" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)"><rect width="7" height="7" fill="#dcc79c"/><path d="M0 1.2 L7 5.8 M0 5.8 L7 1.2" stroke="#a98b57" stroke-width="1.1"/><path d="M0 3.5H7" stroke="#f1e3bf" stroke-width=".8" opacity=".8"/></pattern>
</defs>
<g${mirror}>
<g filter="url(#d)">${shapes(view === 'swatch' ? [] : a.under, ink, parts)}<path d="${a.body}" fill="url(#g)"/></g>
${pattern ? `<path d="${a.body}" fill="url(#p)"/>` : ''}
<path d="${a.body}" fill="url(#f)"/>
<path d="${a.body}" fill="#000" filter="url(#t)"/>
${finishLayer(finish, a.body)}
<path d="${a.body}" fill="url(#h)"/>
<path d="${a.body}" fill="url(#s)"/>
${a.details && view !== 'back' ? `<path d="${a.details}" fill="none" stroke="${line}" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>` : ''}
<path d="${a.body}" fill="none" stroke="${line}" stroke-width="1.3" stroke-linejoin="round"/>
${hardware ? shapes(a.over, ink, parts) : view === 'back' ? shapes((a.over ?? []).filter((sh) => sh.fill === '@metal' || sh.stroke === '@metal'), ink, parts) : ''}
${STITCH[finish] || view === 'swatch' ? `<path d="${a.body}" fill="none" stroke="${finish === 'denim' ? '#d49a4c' : shade(color, isLight(color) ? -0.2 : 0.35)}" stroke-width=".9" stroke-dasharray="2.4 2" opacity=".9"${stitchInset}/>` : ''}
</g>
</svg>`;
}

export const svgDataUri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/** For the studio renderer (tools/render): the raw shapes and the pattern layer of a drawing. */
export const artOf = (kind: GarmentKind) => ART[kind];
export { shade, isLight };
export const ARTS = ART;
/** A flat colour-and-print texture (no lighting) in art space; the renderer lights it in 3D. */
export function albedoSvg(color: string, pattern?: Pattern, accent?: string) {
  const ink = accent ?? (isLight(color) ? shade(color, -0.45) : shade(color, 0.5));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="2048" height="2458"><defs>${pattern ? patternDef(pattern, ink) : ''}</defs><rect width="200" height="240" fill="${color}"/>${pattern ? '<rect width="200" height="240" fill="url(#p)"/>' : ''}</svg>`;
}

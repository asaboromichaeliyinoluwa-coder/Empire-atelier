import type { Product } from '../shared/catalog.ts';
import { finishFor, garmentSvg, svgDataUri, type View } from '../shared/garments.ts';

/** A product's illustrated artwork as an image URL. */
export const productArt = (p: Product) => svgDataUri(garmentSvg(p.art, p.color.hex, p.pattern, p.accent, finishFor(p.material), { sole: p.sole, insole: p.insole }));

/** The same product from another angle, for the gallery: a close-up, the back, or a swatch of the material. */
export const productView = (p: Product, view: View) =>
  svgDataUri(garmentSvg(p.art, p.color.hex, p.pattern, p.accent, finishFor(p.material), { sole: p.sole, insole: p.insole, view }));

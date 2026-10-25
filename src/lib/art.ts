import type { Product } from '../shared/catalog.ts';
import { garmentSvg, svgDataUri } from '../shared/garments.ts';

/** A product's illustrated artwork as an image URL. */
export const productArt = (p: Product) => svgDataUri(garmentSvg(p.art, p.color.hex, p.pattern));

/** The shop owner's own products (added on the My products page) and how they join the catalogue. */
import type { ColorFamily, Category, Gender, Garment, Product, Seller } from './catalog.ts';

export type ShopSettings = { name: string; city: string; website: string; contact: string };
export type ShopProduct = {
  id: string; name: string; category: Category; gender: Gender; price: number; was?: number; description: string; material: string;
  colorName: string; colorHex: string; sizes: string[]; photos: string[]; url?: string; tryOn?: boolean; group?: string; createdAt: number;
};

export const SHOP_SELLER_ID = 'my-store';

export function familyOf(hex: string): ColorFamily {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 510, d = max - min;
  if (l < 0.16) return 'black';
  if (l > 0.9) return 'white';
  if (d < 28) return l > 0.78 ? 'white' : l < 0.3 ? 'black' : 'neutral';
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  if (h < 15 || h >= 335) return l > 0.7 ? 'pink' : 'red';
  if (h < 50) return l > 0.6 && d < 90 ? 'neutral' : 'gold';
  if (h < 70) return 'gold';
  if (h < 170) return 'green';
  if (h < 260) return 'blue';
  return 'pink';
}

const TRY_ON: Partial<Record<Category, Garment>> = { tops: 'upper_body', outerwear: 'upper_body', bottoms: 'lower_body', dresses: 'full_body', sets: 'full_body' };

export function shopSeller(s: ShopSettings): Seller {
  return {
    id: SHOP_SELLER_ID, name: s.name || 'Empire Atelier', city: s.city, rating: 0, reviews: 0, since: new Date().getFullYear(),
    delivery: s.contact ? `Order with the seller: ${s.contact}` : 'Arranged with the seller when you order', returns: 'Ask the seller',
    about: `Products photographed and sold by ${s.name || 'the shop owner'}.`, website: s.website || 'https://my-store.example.com',
  };
}

export function shopProduct(p: ShopProduct): Product {
  const artFor: Record<string, Product['art']> = { tops: 'tee', bottoms: 'jeans', dresses: 'midi-dress', sets: 'kaftan', outerwear: 'blazer', shoes: 'sneakers', bags: 'tote', accessories: 'watch' };
  return {
    id: `my-${p.id}`, name: p.name, category: p.category, gender: p.gender, art: artFor[p.category] ?? 'tee',
    garment: p.tryOn ? TRY_ON[p.category] : undefined, price: p.price, was: p.was,
    color: { name: p.colorName, hex: p.colorHex, family: familyOf(p.colorHex) },
    styles: ['classic'], occasions: ['casual'], sellerId: SHOP_SELLER_ID, material: p.material || 'See description', sizes: p.sizes,
    description: p.description || p.name, image: p.photos[0], images: p.photos, tryOnImage: p.tryOn ? p.photos[0] : undefined, url: p.url,
    custom: true, group: p.group,
  };
}

/**
 * Demo catalog: participating sellers and their clothing. Prices are in US dollars.
 *
 * To go live, replace each seller's `website` and each product's `url` with real links, and set
 * `image` (catalog photo) and `tryOnImage` (product-only shot YouCam uses for try-on). Products
 * without photos are drawn from `art` (see garments.ts).
 */
import type { GarmentKind, Pattern } from './garments.ts';
import { HOUSE_NOTE, HOUSE_PRODUCTS, HOUSES } from './luxury.ts';

export type Category = 'tops' | 'bottoms' | 'dresses' | 'sets' | 'outerwear' | 'shoes' | 'bags' | 'accessories' | 'caps' | 'belts' | 'glasses';
/** Who a piece is cut for. Unisex pieces show in both departments. */
export type Gender = 'women' | 'men' | 'unisex';
/** The department the shopper is browsing. */
export type Department = 'women' | 'men' | 'all';
export type Style = 'romantic' | 'minimal' | 'classic' | 'glam' | 'boho' | 'street';
export type Occasion = 'work' | 'casual' | 'date' | 'evening' | 'wedding' | 'vacation';
export type ColorFamily = 'pink' | 'neutral' | 'white' | 'black' | 'red' | 'blue' | 'green' | 'gold';
/** How YouCam's clothes try-on treats the piece. Shoes and bags are styled but not tried on. */
export type Garment = 'upper_body' | 'lower_body' | 'full_body';

export type Seller = {
  id: string;
  name: string;
  city: string;
  rating: number;
  reviews: number;
  delivery: string;
  returns: string;
  about: string;
  website: string;
  since: number;
};

export type Product = {
  id: string;
  name: string;
  category: Category;
  gender: Gender;
  art: GarmentKind;
  garment?: Garment;
  price: number;
  /** Original price when on sale. */
  was?: number;
  color: { name: string; hex: string; family: ColorFamily };
  pattern?: Pattern;
  /** Colour of the print or hardware, when it isn't drawn from the base colour (e.g. gold monogram). */
  accent?: string;
  /** Sole and insole colours for footwear drawings. */
  sole?: string;
  insole?: string;
  styles: Style[];
  occasions: Occasion[];
  sellerId: string;
  material: string;
  sizes: string[];
  description: string;
  image?: string;
  /** All real photos, when the shop owner added them (see src/shared/shop.ts). */
  images?: string[];
  /** True for products the shop owner added with their own photos. */
  custom?: true;
  /** Custom products with the same group name are colours of one piece. */
  group?: string;
  tryOnImage?: string;
  url?: string;
};

export const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'dresses', label: 'Dresses' },
  { key: 'sets', label: 'Kaftans & sets' },
  { key: 'tops', label: 'Tops' },
  { key: 'bottoms', label: 'Bottoms' },
  { key: 'outerwear', label: 'Outerwear' },
  { key: 'shoes', label: 'Shoes' },
    { key: 'bags', label: 'Bags' },
  { key: 'caps', label: 'Caps' },
  { key: 'belts', label: 'Belts' },
  { key: 'glasses', label: 'Glasses' },
  { key: 'accessories', label: 'Watches & jewellery' },
];

export const STYLES: { key: Style; label: string; blurb: string; women?: true }[] = [
  { key: 'romantic', label: 'Romantic', blurb: 'Soft colour, florals, flowing shapes', women: true },
  { key: 'minimal', label: 'Minimal', blurb: 'Clean lines, quiet neutrals' },
  { key: 'classic', label: 'Classic', blurb: 'Tailoring and timeless pieces' },
  { key: 'glam', label: 'Glam', blurb: 'Satin, shine and evening drama' },
  { key: 'boho', label: 'Boho', blurb: 'Relaxed, earthy, free-spirited, native prints' },
  { key: 'street', label: 'Street', blurb: 'Denim, sneakers, easy layers' },
];

export const OCCASIONS: { key: Occasion; label: string }[] = [
  { key: 'work', label: 'Work' },
  { key: 'casual', label: 'Everyday' },
  { key: 'date', label: 'Date night' },
  { key: 'evening', label: 'Evening & parties' },
  { key: 'wedding', label: 'Weddings' },
  { key: 'vacation', label: 'Vacation' },
];

export const COLORS: { key: ColorFamily; label: string; swatch: string }[] = [
  { key: 'pink', label: 'Pink & blush', swatch: '#e8a0b0' },
  { key: 'neutral', label: 'Beige & camel', swatch: '#d9c3a5' },
  { key: 'white', label: 'White & ivory', swatch: '#f7f1e8' },
  { key: 'black', label: 'Black', swatch: '#1d1b1e' },
  { key: 'red', label: 'Red & wine', swatch: '#8e2a44' },
  { key: 'blue', label: 'Blue & denim', swatch: '#4d6a92' },
  { key: 'green', label: 'Green & sage', swatch: '#8fa58a' },
  { key: 'gold', label: 'Gold & metallic', swatch: '#c9a96e' },
];

export const SELLERS: Seller[] = [
  {
    id: 'maison-rose', name: 'Maison Rosé', city: 'Lagos', rating: 4.9, reviews: 1284, since: 2016,
    delivery: '1–3 days in Nigeria, 5–8 days worldwide', returns: 'Free returns within 14 days',
    about: 'Romantic ready-to-wear cut in Lagos: soft tailoring, florals and occasion dresses.',
    website: 'https://maison-rose.example.com',
  },
  {
    id: 'atelier-noor', name: 'Atelier Noor', city: 'Abuja', rating: 4.8, reviews: 642, since: 2019,
    delivery: '2–4 days', returns: 'Exchanges within 10 days',
    about: 'Modest, minimal silhouettes in fluid crepe and linen, made to order.',
    website: 'https://atelier-noor.example.com',
  },
  {
    id: 'velvet-vine', name: 'Velvet & Vine', city: 'London', rating: 4.7, reviews: 2210, since: 2012,
    delivery: '3–6 days worldwide', returns: 'Free returns within 30 days',
    about: 'Evening and wedding-guest wear: satin, velvet and hand-finished gowns.',
    website: 'https://velvetandvine.example.com',
  },
  {
    id: 'kora-studio', name: 'Kora Studio', city: 'Accra', rating: 4.8, reviews: 498, since: 2020,
    delivery: '4–7 days', returns: 'Returns within 14 days',
    about: 'Bold prints and relaxed boho shapes, woven and finished by hand in Ghana.',
    website: 'https://korastudio.example.com',
  },
  {
    id: 'linen-lane', name: 'Linen Lane', city: 'Lisbon', rating: 4.6, reviews: 913, since: 2015,
    delivery: '3–5 days worldwide', returns: 'Free returns within 21 days',
    about: 'Everyday essentials in natural fibres. Denim, knits and the perfect white shirt.',
    website: 'https://linenlane.example.com',
  },
  {
    id: 'soleil-row', name: 'Soleil Row', city: 'New York', rating: 4.7, reviews: 1577, since: 2014,
    delivery: '2–5 days worldwide', returns: 'Free returns within 30 days',
    about: 'Shoes and bags to finish the look, from city sneakers to evening clutches.',
    website: 'https://soleilrow.example.com',
  },
  {
    id: 'adeyemi', name: 'House of Adeyemi', city: 'Lagos', rating: 4.9, reviews: 1036, since: 2013,
    delivery: '1–3 days in Nigeria, 5–9 days worldwide', returns: 'Alterations free for 30 days',
    about: 'Menswear tailoring and native wear: agbada, senator kaftans and sharp suiting, cut in Lagos.',
    website: 'https://houseofadeyemi.example.com',
  },
  {
    id: 'northcote', name: 'Northcote & Sons', city: 'London', rating: 4.7, reviews: 1820, since: 2009,
    delivery: '3–6 days worldwide', returns: 'Free returns within 30 days',
    about: 'Modern British menswear: oxford shirts, merino knits, overcoats and leather goods.',
    website: 'https://northcoteandsons.example.com',
  },
  {
    id: 'maison-lumiere', name: 'Maison Lumière', city: 'Paris', rating: 4.9, reviews: 2764, since: 2008,
    delivery: '2–5 days worldwide, signature gift box', returns: 'Free returns within 30 days',
    about: 'The Maison edit: original monogram canvas, quilting, baroque silks and house checks, inspired by the great luxury houses and drawn by the Empire Atelier studio.',
    website: 'https://maison-lumiere.example.com',
  },
];

/** The Maison edit's note, shown wherever its luxury-inspired pieces appear. */
export const MAISON_NOTE = HOUSE_NOTE;
export const MAISON_ID = 'maison-lumiere';

const S = ['XS', 'S', 'M', 'L', 'XL'];
const SH = ['36', '37', '38', '39', '40', '41'];
const M = ['S', 'M', 'L', 'XL', 'XXL'];
const MW = ['30', '32', '34', '36', '38'];
const MSH = ['40', '41', '42', '43', '44', '45', '46'];

export const PRODUCTS: Product[] = [
  // Dresses
  { id: 'peony-midi', name: 'Peony Wrap Midi', category: 'dresses', gender: 'women', art: 'midi-dress', garment: 'full_body', price: 168, was: 198, color: { name: 'Rose floral', hex: '#c9667f', family: 'pink' }, pattern: 'floral', styles: ['romantic', 'boho'], occasions: ['date', 'wedding', 'vacation'], sellerId: 'maison-rose', material: 'Viscose georgette', sizes: S, description: 'A fluttering wrap midi printed with blush peonies, cinched at the waist and swinging below the knee.' },
  { id: 'blush-slip', name: 'Blush Satin Slip', category: 'dresses', gender: 'women', art: 'slip-dress', garment: 'full_body', price: 142, color: { name: 'Blush', hex: '#f0c9cf', family: 'pink' }, styles: ['glam', 'minimal', 'romantic'], occasions: ['date', 'evening'], sellerId: 'velvet-vine', material: 'Silk-feel satin', sizes: S, description: 'Bias-cut satin that skims the body, with fine adjustable straps and a cowl front.' },
  { id: 'empress-gown', name: 'Empress Velvet Gown', category: 'dresses', gender: 'women', art: 'gown', garment: 'full_body', price: 389, was: 460, color: { name: 'Wine', hex: '#7a2840', family: 'red' }, styles: ['glam', 'classic'], occasions: ['evening', 'wedding'], sellerId: 'velvet-vine', material: 'Stretch velvet', sizes: S, description: 'A floor-sweeping velvet gown with a sculpted bodice and a full skirt that moves beautifully.' },
  { id: 'ivory-column', name: 'Ivory Column Dress', category: 'dresses', gender: 'women', art: 'slip-dress', garment: 'full_body', price: 210, color: { name: 'Ivory', hex: '#f6eee3', family: 'white' }, styles: ['minimal', 'classic'], occasions: ['wedding', 'evening', 'work'], sellerId: 'atelier-noor', material: 'Heavy crepe', sizes: S, description: 'A clean column of ivory crepe, lined, with a softly scooped neck.' },
  { id: 'polka-mini', name: 'Polka Puff Mini', category: 'dresses', gender: 'women', art: 'mini-dress', garment: 'full_body', price: 96, was: 118, color: { name: 'White dot', hex: '#fbf7f2', family: 'white' }, pattern: 'dots', styles: ['romantic', 'street'], occasions: ['casual', 'date', 'vacation'], sellerId: 'maison-rose', material: 'Cotton poplin', sizes: S, description: 'Puff sleeves and a flippy skirt in crisp polka-dot cotton.' },
  { id: 'gilded-mini', name: 'Gilded Party Mini', category: 'dresses', gender: 'women', art: 'mini-dress', garment: 'full_body', price: 178, color: { name: 'Champagne', hex: '#d2b47e', family: 'gold' }, styles: ['glam'], occasions: ['evening', 'date'], sellerId: 'velvet-vine', material: 'Metallic jacquard', sizes: S, description: 'A champagne jacquard mini that catches every light on the dance floor.' },
  { id: 'kente-maxi', name: 'Kente Sun Maxi', category: 'dresses', gender: 'women', art: 'gown', garment: 'full_body', price: 154, color: { name: 'Terracotta stripe', hex: '#c4724e', family: 'neutral' }, pattern: 'stripe', styles: ['boho'], occasions: ['vacation', 'wedding', 'casual'], sellerId: 'kora-studio', material: 'Hand-woven cotton', sizes: S, description: 'A sweeping maxi in hand-woven stripes, made for golden-hour celebrations.' },
  { id: 'sage-jumpsuit', name: 'Sage Linen Jumpsuit', category: 'dresses', gender: 'women', art: 'jumpsuit', garment: 'full_body', price: 124, color: { name: 'Sage', hex: '#9db09a', family: 'green' }, styles: ['minimal', 'boho'], occasions: ['casual', 'vacation', 'work'], sellerId: 'linen-lane', material: '100% linen', sizes: S, description: 'Wide-leg linen jumpsuit with a square neck and a relaxed, breezy fit.' },
  { id: 'noir-jumpsuit', name: 'Noir Tailored Jumpsuit', category: 'dresses', gender: 'women', art: 'jumpsuit', garment: 'full_body', price: 198, color: { name: 'Black', hex: '#1f1c1f', family: 'black' }, styles: ['classic', 'minimal', 'glam'], occasions: ['work', 'evening'], sellerId: 'atelier-noor', material: 'Stretch crepe', sizes: S, description: 'Sharp, sleek and easy: a tailored black jumpsuit that goes desk to dinner.' },

  // Tops
  { id: 'pink-cami', name: 'Petal Silk Cami', category: 'tops', gender: 'women', art: 'cami', garment: 'upper_body', price: 58, color: { name: 'Petal pink', hex: '#eba9b7', family: 'pink' }, styles: ['romantic', 'glam', 'minimal'], occasions: ['date', 'casual', 'evening'], sellerId: 'maison-rose', material: 'Washed silk', sizes: S, description: 'A barely-there silk cami with a soft V and fine straps.' },
  { id: 'striped-shirt', name: 'Riviera Striped Shirt', category: 'tops', gender: 'women', art: 'blouse', garment: 'upper_body', price: 72, color: { name: 'Ivory stripe', hex: '#f5efe6', family: 'white' }, pattern: 'stripe', styles: ['classic', 'minimal', 'street'], occasions: ['work', 'casual', 'vacation'], sellerId: 'linen-lane', material: 'Cotton-linen', sizes: S, description: 'A relaxed button-down in fine ivory stripes. Tuck it, knot it, or wear it open.' },
  { id: 'white-blouse', name: 'Essential White Blouse', category: 'tops', gender: 'women', art: 'blouse', garment: 'upper_body', price: 64, color: { name: 'White', hex: '#fbf8f3', family: 'white' }, styles: ['classic', 'minimal'], occasions: ['work', 'casual'], sellerId: 'linen-lane', material: 'Organic cotton', sizes: S, description: 'The perfect white shirt: crisp, softly oversized, with a deep cuff.' },
  { id: 'rose-blouse', name: 'Rosewater Blouse', category: 'tops', gender: 'women', art: 'blouse', garment: 'upper_body', price: 88, color: { name: 'Dusty rose', hex: '#d98c9e', family: 'pink' }, styles: ['romantic', 'classic'], occasions: ['work', 'date'], sellerId: 'maison-rose', material: 'Crepe de chine', sizes: S, description: 'A fluid crepe blouse in dusty rose with covered buttons.' },
  { id: 'camel-knit', name: 'Camel Cloud Knit', category: 'tops', gender: 'women', art: 'knit', garment: 'upper_body', price: 92, was: 115, color: { name: 'Camel', hex: '#c9a37a', family: 'neutral' }, styles: ['minimal', 'classic', 'street'], occasions: ['casual', 'work'], sellerId: 'linen-lane', material: 'Merino-cashmere', sizes: S, description: 'A cloud-soft knit in warm camel with ribbed edges.' },
  { id: 'blush-knit', name: 'Blush Cable Knit', category: 'tops', gender: 'women', art: 'knit', garment: 'upper_body', price: 84, was: 105, color: { name: 'Blush', hex: '#f0c2c9', family: 'pink' }, styles: ['romantic', 'street', 'boho'], occasions: ['casual', 'vacation'], sellerId: 'kora-studio', material: 'Cotton blend', sizes: S, description: 'A cosy blush knit with a relaxed drop shoulder.' },
  { id: 'black-cami', name: 'Midnight Satin Cami', category: 'tops', gender: 'women', art: 'cami', garment: 'upper_body', price: 54, color: { name: 'Black', hex: '#1f1c1f', family: 'black' }, styles: ['glam', 'minimal'], occasions: ['evening', 'date'], sellerId: 'velvet-vine', material: 'Satin', sizes: S, description: 'Liquid black satin for evenings out.' },

  // Bottoms
  { id: 'blush-pleat', name: 'Blush Pleated Midi Skirt', category: 'bottoms', gender: 'women', art: 'pleated-skirt', garment: 'lower_body', price: 86, color: { name: 'Blush', hex: '#e6aab5', family: 'pink' }, styles: ['romantic', 'classic', 'glam'], occasions: ['work', 'date', 'wedding'], sellerId: 'maison-rose', material: 'Plissé satin', sizes: S, description: 'Sunray pleats in blush satin that swish as you walk.' },
  { id: 'ivory-skirt', name: 'Ivory A-line Skirt', category: 'bottoms', gender: 'women', art: 'skirt', garment: 'lower_body', price: 74, color: { name: 'Ivory', hex: '#f4ece0', family: 'white' }, styles: ['minimal', 'classic', 'romantic'], occasions: ['work', 'casual', 'vacation'], sellerId: 'atelier-noor', material: 'Cotton twill', sizes: S, description: 'A clean A-line midi skirt with hidden pockets.' },
  { id: 'gold-skirt', name: 'Liquid Gold Skirt', category: 'bottoms', gender: 'women', art: 'skirt', garment: 'lower_body', price: 118, color: { name: 'Gold satin', hex: '#cdae78', family: 'gold' }, styles: ['glam'], occasions: ['evening', 'wedding'], sellerId: 'velvet-vine', material: 'Satin', sizes: S, description: 'A bias-cut satin midi skirt with a molten gold sheen.' },
  { id: 'tailored-trouser', name: 'Wide-leg Tailored Trouser', category: 'bottoms', gender: 'women', art: 'trousers', garment: 'lower_body', price: 112, color: { name: 'Oat', hex: '#e2d3bd', family: 'neutral' }, styles: ['classic', 'minimal'], occasions: ['work', 'casual'], sellerId: 'atelier-noor', material: 'Wool blend', sizes: S, description: 'High-waisted, pressed-crease trousers with a floor-skimming wide leg.' },
  { id: 'plaid-trouser', name: 'Heritage Plaid Trouser', category: 'bottoms', gender: 'women', art: 'trousers', garment: 'lower_body', price: 98, color: { name: 'Cream plaid', hex: '#ece2d2', family: 'neutral' }, pattern: 'plaid', styles: ['classic', 'street'], occasions: ['work', 'casual'], sellerId: 'linen-lane', material: 'Brushed wool blend', sizes: S, description: 'Soft cream check, a high waist and a relaxed straight leg.' },
  { id: 'blue-jeans', name: 'Straight Vintage Jeans', category: 'bottoms', gender: 'women', art: 'jeans', garment: 'lower_body', price: 79, color: { name: 'Mid blue', hex: '#5878a0', family: 'blue' }, styles: ['street', 'classic', 'boho'], occasions: ['casual', 'vacation'], sellerId: 'linen-lane', material: 'Rigid organic denim', sizes: ['24', '26', '28', '30', '32'], description: 'A vintage-wash straight leg that only gets better with wear.' },
  { id: 'black-trouser', name: 'Noir Cigarette Trouser', category: 'bottoms', gender: 'women', art: 'jeans', garment: 'lower_body', price: 89, color: { name: 'Black', hex: '#221f22', family: 'black' }, styles: ['minimal', 'classic', 'street'], occasions: ['work', 'evening', 'casual'], sellerId: 'atelier-noor', material: 'Stretch twill', sizes: S, description: 'Slim, cropped and endlessly versatile.' },

  // Outerwear
  { id: 'camel-trench', name: 'Camel Belted Trench', category: 'outerwear', gender: 'women', art: 'trench', garment: 'upper_body', price: 248, was: 295, color: { name: 'Camel', hex: '#c8a77c', family: 'neutral' }, styles: ['classic', 'minimal'], occasions: ['work', 'casual'], sellerId: 'linen-lane', material: 'Water-repellent cotton gabardine', sizes: S, description: 'The forever trench: double-breasted, belted and storm-flapped.' },
  { id: 'blush-blazer', name: 'Blush Boyfriend Blazer', category: 'outerwear', gender: 'women', art: 'blazer', garment: 'upper_body', price: 168, color: { name: 'Blush', hex: '#e9b3bd', family: 'pink' }, styles: ['romantic', 'classic', 'street'], occasions: ['work', 'date', 'casual'], sellerId: 'maison-rose', material: 'Crepe', sizes: S, description: 'An easy, slouchy blazer in the softest blush.' },
  { id: 'black-blazer', name: 'Sculpted Black Blazer', category: 'outerwear', gender: 'women', art: 'blazer', garment: 'upper_body', price: 196, color: { name: 'Black', hex: '#1f1c1f', family: 'black' }, styles: ['classic', 'minimal', 'glam'], occasions: ['work', 'evening'], sellerId: 'atelier-noor', material: 'Wool crepe', sizes: S, description: 'Strong shoulders and a nipped waist. The jacket that does the work.' },
  { id: 'ivory-trench', name: 'Ivory Longline Coat', category: 'outerwear', gender: 'women', art: 'trench', garment: 'upper_body', price: 284, color: { name: 'Ivory', hex: '#f1e8db', family: 'white' }, styles: ['minimal', 'glam'], occasions: ['work', 'evening', 'wedding'], sellerId: 'velvet-vine', material: 'Wool-cashmere', sizes: S, description: 'A long ivory coat that turns any outfit into an entrance.' },

  // Shoes
  { id: 'nude-pump', name: 'Nude Pointed Pump', category: 'shoes', gender: 'women', art: 'heels', price: 128, color: { name: 'Nude', hex: '#dcb79a', family: 'neutral' }, styles: ['classic', 'minimal', 'glam', 'romantic'], occasions: ['work', 'wedding', 'evening', 'date'], sellerId: 'soleil-row', material: 'Nappa leather', sizes: SH, description: 'An 85 mm pointed pump in a skin-tone nude that lengthens the leg.' },
  { id: 'gold-heel', name: 'Gold Evening Heel', category: 'shoes', gender: 'women', art: 'heels', price: 156, color: { name: 'Gold', hex: '#c9a96e', family: 'gold' }, styles: ['glam'], occasions: ['evening', 'wedding', 'date'], sellerId: 'soleil-row', material: 'Metallic leather', sizes: SH, description: 'Metallic gold leather on a slim stiletto.' },
  { id: 'blush-heel', name: 'Blush Satin Heel', category: 'shoes', gender: 'women', art: 'heels', price: 118, color: { name: 'Blush', hex: '#eab4be', family: 'pink' }, styles: ['romantic', 'glam'], occasions: ['wedding', 'date', 'evening'], sellerId: 'maison-rose', material: 'Satin', sizes: SH, description: 'Blush satin pumps, made for dancing at weddings.' },
  { id: 'white-sneaker', name: 'Court White Sneaker', category: 'shoes', gender: 'unisex', art: 'sneakers', price: 89, was: 110, color: { name: 'White', hex: '#f8f5f0', family: 'white' }, styles: ['street', 'minimal', 'boho'], occasions: ['casual', 'vacation', 'work'], sellerId: 'soleil-row', material: 'Leather', sizes: SH, description: 'Clean leather court sneakers that go with everything.' },
  { id: 'blush-sneaker', name: 'Rose Suede Sneaker', category: 'shoes', gender: 'women', art: 'sneakers', price: 95, color: { name: 'Rose', hex: '#e7a7b4', family: 'pink' }, styles: ['street', 'romantic'], occasions: ['casual', 'vacation'], sellerId: 'soleil-row', material: 'Suede', sizes: SH, description: 'Soft rose suede on a cushioned sole.' },

  // Bags
  { id: 'camel-tote', name: 'Camel Leather Tote', category: 'bags', gender: 'women', art: 'tote', price: 189, color: { name: 'Camel', hex: '#d0aa7c', family: 'neutral' }, styles: ['classic', 'minimal', 'street', 'boho'], occasions: ['work', 'casual', 'vacation'], sellerId: 'soleil-row', material: 'Vegetable-tanned leather', sizes: ['One size'], description: 'Fits a laptop and a life. Ages to a rich patina.' },
  { id: 'blush-tote', name: 'Blush Mini Tote', category: 'bags', gender: 'women', art: 'tote', price: 132, was: 158, color: { name: 'Blush', hex: '#f0bfc7', family: 'pink' }, styles: ['romantic', 'street'], occasions: ['casual', 'date', 'vacation'], sellerId: 'maison-rose', material: 'Pebbled leather', sizes: ['One size'], description: 'A sweet blush mini tote with a detachable strap.' },
  { id: 'gold-clutch', name: 'Champagne Clutch', category: 'bags', gender: 'women', art: 'clutch', price: 98, color: { name: 'Champagne', hex: '#cfb17e', family: 'gold' }, styles: ['glam', 'classic', 'romantic'], occasions: ['evening', 'wedding', 'date'], sellerId: 'velvet-vine', material: 'Satin with gold clasp', sizes: ['One size'], description: 'A champagne satin envelope clutch with a gold clasp.' },
  { id: 'black-clutch', name: 'Noir Envelope Clutch', category: 'bags', gender: 'women', art: 'clutch', price: 84, color: { name: 'Black', hex: '#221f22', family: 'black' }, styles: ['minimal', 'glam', 'classic'], occasions: ['evening', 'work', 'date'], sellerId: 'atelier-noor', material: 'Leather', sizes: ['One size'], description: 'Sleek black leather clutch, sized for the essentials.' },
  // Menswear: kaftans and sets
  { id: 'ivory-agbada', name: 'Ivory Embroidered Agbada', category: 'sets', gender: 'men', art: 'agbada', garment: 'full_body', price: 340, color: { name: 'Ivory', hex: '#f2eadc', family: 'white' }, styles: ['classic', 'glam'], occasions: ['wedding', 'evening'], sellerId: 'adeyemi', material: 'Cotton damask, hand embroidery', sizes: M, description: 'A three-piece agbada with tonal embroidery at the neck. Made for the groom’s side of the aisle.' },
  { id: 'navy-senator', name: 'Midnight Senator Kaftan', category: 'sets', gender: 'men', art: 'kaftan', garment: 'full_body', price: 175, was: 210, color: { name: 'Navy', hex: '#26324a', family: 'blue' }, styles: ['classic', 'minimal'], occasions: ['work', 'wedding', 'evening'], sellerId: 'adeyemi', material: 'Cashmere-feel wool blend', sizes: M, description: 'A long senator top with matching trousers, clean placket and piped pocket.' },
  { id: 'sage-kaftan', name: 'Sage Linen Kaftan', category: 'sets', gender: 'men', art: 'kaftan', garment: 'full_body', price: 138, color: { name: 'Sage', hex: '#93a68f', family: 'green' }, styles: ['boho', 'minimal'], occasions: ['casual', 'vacation'], sellerId: 'adeyemi', material: '100% linen', sizes: M, description: 'An airy linen kaftan and drawstring trouser set for slow weekends.' },
  { id: 'wine-senator', name: 'Burgundy Senator Set', category: 'sets', gender: 'men', art: 'kaftan', garment: 'full_body', price: 189, color: { name: 'Burgundy', hex: '#6e2234', family: 'red' }, styles: ['glam', 'classic'], occasions: ['evening', 'date', 'wedding'], sellerId: 'adeyemi', material: 'Brushed wool blend', sizes: M, description: 'Rich burgundy with tonal buttons. Pairs with espresso loafers.' },

  // Menswear: tops
  { id: 'oxford-white', name: 'Crisp White Oxford Shirt', category: 'tops', gender: 'men', art: 'shirt', garment: 'upper_body', price: 68, color: { name: 'White', hex: '#fbf9f5', family: 'white' }, styles: ['classic', 'minimal'], occasions: ['work', 'casual', 'wedding', 'date'], sellerId: 'northcote', material: 'Oxford cotton', sizes: M, description: 'The cornerstone shirt: button-down collar, soft oxford weave, tailored fit.' },
  { id: 'sky-shirt', name: 'Sky Poplin Shirt', category: 'tops', gender: 'men', art: 'shirt', garment: 'upper_body', price: 72, color: { name: 'Sky blue', hex: '#a9c0dc', family: 'blue' }, pattern: 'stripe', styles: ['classic', 'street'], occasions: ['work', 'casual'], sellerId: 'northcote', material: 'Cotton poplin', sizes: M, description: 'Fine sky-blue stripes on crisp poplin. Office-ready, weekend-easy.' },
  { id: 'sand-linen-shirt', name: 'Sand Linen Shirt', category: 'tops', gender: 'men', art: 'shirt', garment: 'upper_body', price: 79, color: { name: 'Sand', hex: '#dcc7a6', family: 'neutral' }, styles: ['boho', 'minimal'], occasions: ['vacation', 'casual', 'date'], sellerId: 'linen-lane', material: '100% linen', sizes: M, description: 'Washed linen with a camp collar, cut to wear open over a tee.' },
  { id: 'black-tee', name: 'Essential Black Tee', category: 'tops', gender: 'men', art: 'tee', garment: 'upper_body', price: 32, color: { name: 'Black', hex: '#1f1c1f', family: 'black' }, styles: ['street', 'minimal'], occasions: ['casual', 'vacation', 'date'], sellerId: 'linen-lane', material: 'Heavyweight organic cotton', sizes: M, description: 'A dense, structured tee that keeps its shape wash after wash.' },
  { id: 'white-tee', name: 'Heavyweight White Tee', category: 'tops', gender: 'men', art: 'tee', garment: 'upper_body', price: 34, color: { name: 'White', hex: '#f9f7f2', family: 'white' }, styles: ['street', 'minimal', 'classic'], occasions: ['casual', 'vacation'], sellerId: 'linen-lane', material: 'Heavyweight organic cotton', sizes: M, description: 'Boxy, bright white and built to last.' },
  { id: 'navy-polo', name: 'Navy Knit Polo', category: 'tops', gender: 'men', art: 'polo', garment: 'upper_body', price: 64, color: { name: 'Navy', hex: '#2b3650', family: 'blue' }, styles: ['classic', 'minimal'], occasions: ['work', 'casual', 'date'], sellerId: 'northcote', material: 'Fine-gauge cotton knit', sizes: M, description: 'A knitted polo with a three-button placket. Smart enough for the office.' },
  { id: 'camel-rollneck', name: 'Camel Merino Rollneck', category: 'tops', gender: 'men', art: 'knit', garment: 'upper_body', price: 96, color: { name: 'Camel', hex: '#c39e74', family: 'neutral' }, styles: ['classic', 'minimal'], occasions: ['work', 'date', 'evening'], sellerId: 'northcote', material: 'Extra-fine merino', sizes: M, description: 'Warm camel merino that sits neatly under a blazer or overcoat.' },
  { id: 'espresso-polo', name: 'Espresso Piqué Polo', category: 'tops', gender: 'men', art: 'polo', garment: 'upper_body', price: 58, color: { name: 'Espresso', hex: '#4a2c20', family: 'neutral' }, styles: ['street', 'classic'], occasions: ['casual', 'vacation', 'date'], sellerId: 'linen-lane', material: 'Cotton piqué', sizes: M, description: 'Rich espresso piqué with a ribbed collar.' },

  // Menswear: bottoms
  { id: 'charcoal-trouser', name: 'Charcoal Tailored Trouser', category: 'bottoms', gender: 'men', art: 'trousers', garment: 'lower_body', price: 118, color: { name: 'Charcoal', hex: '#3a383c', family: 'black' }, styles: ['classic', 'minimal'], occasions: ['work', 'evening', 'wedding'], sellerId: 'northcote', material: 'Wool flannel', sizes: MW, description: 'Pressed crease, slim straight leg, side adjusters.' },
  { id: 'navy-suit-trouser', name: 'Navy Suit Trouser', category: 'bottoms', gender: 'men', art: 'trousers', garment: 'lower_body', price: 138, color: { name: 'Navy', hex: '#28324a', family: 'blue' }, styles: ['classic', 'glam'], occasions: ['work', 'wedding', 'evening'], sellerId: 'adeyemi', material: 'Super 110s wool', sizes: MW, description: 'The trouser of the Navy Tailored Suit. Wear them together or apart.' },
  { id: 'stone-chino', name: 'Stone Chinos', category: 'bottoms', gender: 'men', art: 'trousers', garment: 'lower_body', price: 74, was: 92, color: { name: 'Stone', hex: '#d8c8ac', family: 'neutral' }, styles: ['classic', 'street', 'minimal'], occasions: ['casual', 'work', 'vacation', 'date'], sellerId: 'linen-lane', material: 'Stretch cotton twill', sizes: MW, description: 'Clean stone chinos with a tapered leg.' },
  { id: 'indigo-jeans', name: 'Indigo Slim Jeans', category: 'bottoms', gender: 'men', art: 'jeans', garment: 'lower_body', price: 85, color: { name: 'Indigo', hex: '#34496e', family: 'blue' }, styles: ['street', 'classic'], occasions: ['casual', 'date', 'vacation'], sellerId: 'linen-lane', material: 'Selvedge denim', sizes: MW, description: 'Deep indigo selvedge that fades to fit you.' },
  { id: 'black-jeans-m', name: 'Black Tapered Jeans', category: 'bottoms', gender: 'men', art: 'jeans', garment: 'lower_body', price: 79, color: { name: 'Black', hex: '#222024', family: 'black' }, styles: ['street', 'minimal'], occasions: ['casual', 'evening', 'date'], sellerId: 'linen-lane', material: 'Stretch denim', sizes: MW, description: 'Washed-black denim with a relaxed seat and tapered ankle.' },
  { id: 'sand-shorts', name: 'Sand Linen Shorts', category: 'bottoms', gender: 'men', art: 'shorts', garment: 'lower_body', price: 48, color: { name: 'Sand', hex: '#d9c5a3', family: 'neutral' }, styles: ['boho', 'minimal', 'street'], occasions: ['vacation', 'casual'], sellerId: 'linen-lane', material: '100% linen', sizes: MW, description: 'Drawstring linen shorts with a 7-inch inseam.' },

  // Menswear: outerwear
  { id: 'navy-suit-jacket', name: 'Navy Tailored Suit Jacket', category: 'outerwear', gender: 'men', art: 'blazer', garment: 'upper_body', price: 268, color: { name: 'Navy', hex: '#26304a', family: 'blue' }, styles: ['classic', 'glam'], occasions: ['work', 'wedding', 'evening'], sellerId: 'adeyemi', material: 'Super 110s wool', sizes: M, description: 'A two-button single-breasted jacket with soft shoulders and a half lining.' },
  { id: 'charcoal-blazer', name: 'Charcoal Wool Blazer', category: 'outerwear', gender: 'men', art: 'blazer', garment: 'upper_body', price: 238, color: { name: 'Charcoal', hex: '#38363a', family: 'black' }, styles: ['classic', 'minimal'], occasions: ['work', 'evening', 'date'], sellerId: 'northcote', material: 'Wool flannel', sizes: M, description: 'An unstructured flannel blazer that works over a knit or a shirt.' },
  { id: 'camel-overcoat', name: 'Camel Overcoat', category: 'outerwear', gender: 'men', art: 'trench', garment: 'upper_body', price: 320, color: { name: 'Camel', hex: '#bf9b6f', family: 'neutral' }, styles: ['classic', 'minimal'], occasions: ['work', 'casual', 'evening'], sellerId: 'northcote', material: 'Wool-cashmere', sizes: M, description: 'A knee-length camel overcoat. The last coat you’ll need.' },
  { id: 'black-bomber', name: 'Black Nylon Bomber', category: 'outerwear', gender: 'men', art: 'bomber', garment: 'upper_body', price: 145, was: 175, color: { name: 'Black', hex: '#1e1c20', family: 'black' }, styles: ['street', 'minimal'], occasions: ['casual', 'date', 'vacation'], sellerId: 'linen-lane', material: 'Recycled nylon', sizes: M, description: 'A matte bomber with ribbed trims and a quilted lining.' },
  { id: 'denim-jacket', name: 'Washed Denim Jacket', category: 'outerwear', gender: 'men', art: 'bomber', garment: 'upper_body', price: 112, was: 138, color: { name: 'Mid blue', hex: '#5d7aa3', family: 'blue' }, styles: ['street', 'boho'], occasions: ['casual', 'vacation'], sellerId: 'linen-lane', material: 'Rigid denim', sizes: M, description: 'A classic trucker jacket in a lived-in wash.' },

  // Menswear: shoes
  { id: 'espresso-loafer', name: 'Espresso Penny Loafer', category: 'shoes', gender: 'men', art: 'loafers', price: 148, color: { name: 'Espresso', hex: '#4a2a1d', family: 'neutral' }, styles: ['classic', 'minimal', 'glam', 'boho'], occasions: ['work', 'wedding', 'date', 'evening', 'vacation'], sellerId: 'adeyemi', material: 'Polished calf leather', sizes: MSH, description: 'Hand-lasted penny loafers in deep espresso. Wear with a kaftan or a suit.' },
  { id: 'black-oxford', name: 'Black Cap-toe Oxford', category: 'shoes', gender: 'men', art: 'oxford', price: 168, color: { name: 'Black', hex: '#1c1a1d', family: 'black' }, styles: ['classic', 'glam', 'minimal'], occasions: ['work', 'wedding', 'evening'], sellerId: 'northcote', material: 'Box calf, Goodyear welted', sizes: MSH, description: 'A cap-toe oxford for suits, ceremonies and big days.' },
  { id: 'suede-sneaker-m', name: 'Taupe Suede Sneaker', category: 'shoes', gender: 'men', art: 'sneakers', price: 98, color: { name: 'Taupe', hex: '#a89480', family: 'neutral' }, styles: ['street', 'minimal', 'boho'], occasions: ['casual', 'vacation', 'date'], sellerId: 'soleil-row', material: 'Suede', sizes: MSH, description: 'Low-profile suede sneakers on a gum sole.' },

  // Menswear: bags
  { id: 'espresso-briefcase', name: 'Espresso Leather Briefcase', category: 'bags', gender: 'men', art: 'briefcase', price: 245, color: { name: 'Espresso', hex: '#4b2c1f', family: 'neutral' }, styles: ['classic', 'minimal'], occasions: ['work'], sellerId: 'northcote', material: 'Full-grain leather', sizes: ['One size'], description: 'A slim briefcase with a padded laptop sleeve and brass hardware.' },
  // The Maison edit (luxury-inspired, original designs)
  { id: 'monogram-trench', name: 'Monogram Canvas Trench', category: 'outerwear', gender: 'women', art: 'trench', garment: 'upper_body', price: 890, color: { name: 'Cognac monogram', hex: '#8a5a36', family: 'neutral' }, pattern: 'monogram', accent: '#e3c48e', styles: ['classic', 'glam'], occasions: ['work', 'evening', 'casual'], sellerId: 'maison-lumiere', material: 'Coated cotton canvas with leather trims', sizes: S, description: 'Our star-and-flower monogram printed on supple coated canvas, cut as a belted trench with gold-tone buckles.' },
  { id: 'quilted-mini', name: 'Quilted Noir Mini Dress', category: 'dresses', gender: 'women', art: 'mini-dress', garment: 'full_body', price: 720, color: { name: 'Noir quilted', hex: '#1d1a1d', family: 'black' }, pattern: 'quilted', accent: '#8d7f74', styles: ['glam', 'classic'], occasions: ['evening', 'date'], sellerId: 'maison-lumiere', material: 'Quilted lambskin-effect satin', sizes: S, description: 'Diamond quilting stitched by hand on liquid satin. A little black dress with a couture finish.' },
  { id: 'baroque-slip', name: 'Baroque Silk Slip', category: 'dresses', gender: 'women', art: 'slip-dress', garment: 'full_body', price: 640, color: { name: 'Wine baroque', hex: '#5e1e30', family: 'red' }, pattern: 'baroque', accent: '#c9a96e', styles: ['glam', 'romantic'], occasions: ['evening', 'wedding', 'date'], sellerId: 'maison-lumiere', material: 'Silk twill, gold scroll print', sizes: S, description: 'Gold baroque scrolls on deep wine silk, bias cut to move like water.' },
  { id: 'houndstooth-blazer', name: 'Houndstooth Tailored Blazer', category: 'outerwear', gender: 'women', art: 'blazer', garment: 'upper_body', price: 760, color: { name: 'Ivory houndstooth', hex: '#efe6d8', family: 'white' }, pattern: 'houndstooth', accent: '#2a2124', styles: ['classic', 'minimal'], occasions: ['work', 'evening'], sellerId: 'maison-lumiere', material: 'Wool bouclé houndstooth', sizes: S, description: 'A sharply tailored blazer in graphic houndstooth, with a nipped waist and gold star buttons.' },
  { id: 'heritage-knit', name: 'Heritage Stripe Knit', category: 'tops', gender: 'women', art: 'knit', garment: 'upper_body', price: 480, color: { name: 'Cream heritage', hex: '#f1e7d8', family: 'white' }, pattern: 'heritage', accent: '#e6c98f', styles: ['classic', 'street'], occasions: ['casual', 'work'], sellerId: 'maison-lumiere', material: 'Cashmere and wool', sizes: S, description: 'Soft cashmere crossed by our wine-and-gold heritage stripe.' },
  { id: 'check-pleat', name: 'House Check Pleated Skirt', category: 'bottoms', gender: 'women', art: 'pleated-skirt', garment: 'lower_body', price: 520, color: { name: 'Camel house check', hex: '#c9a57a', family: 'neutral' }, pattern: 'check', accent: '#7a2840', styles: ['classic', 'romantic'], occasions: ['work', 'casual'], sellerId: 'maison-lumiere', material: 'Wool twill check', sizes: S, description: 'Knife pleats in the Empire Atelier house check: camel, espresso, ivory and a thread of wine.' },
  { id: 'monogram-tote', name: 'Monogram Weekender Tote', category: 'bags', gender: 'unisex', art: 'tote', price: 1250, color: { name: 'Espresso monogram', hex: '#4a2c1f', family: 'neutral' }, pattern: 'monogram', accent: '#d9b77e', styles: ['classic', 'glam', 'minimal'], occasions: ['work', 'vacation', 'casual'], sellerId: 'maison-lumiere', material: 'Monogram coated canvas, vachetta leather handles', sizes: ['One size'], description: 'The everyday icon: our monogram canvas on a roomy tote with leather handles that tan over time.' },
  { id: 'quilted-clutch', name: 'Quilted Chain Clutch', category: 'bags', gender: 'women', art: 'clutch', price: 980, color: { name: 'Noir quilted', hex: '#1f1c1f', family: 'black' }, pattern: 'quilted', accent: '#8d7f74', styles: ['glam', 'classic'], occasions: ['evening', 'wedding', 'date'], sellerId: 'maison-lumiere', material: 'Quilted leather, gold-tone chain', sizes: ['One size'], description: 'Diamond-quilted leather with a gold chain and our star clasp. Evening, solved.' },
  { id: 'monogram-bomber', name: 'Monogram Bomber Jacket', category: 'outerwear', gender: 'men', art: 'bomber', garment: 'upper_body', price: 1150, color: { name: 'Espresso monogram', hex: '#3f2619', family: 'neutral' }, pattern: 'monogram', accent: '#d9b77e', styles: ['street', 'glam'], occasions: ['casual', 'evening', 'date'], sellerId: 'maison-lumiere', material: 'Jacquard monogram, silk lining', sizes: M, description: 'A street-luxe bomber woven with our star monogram, finished with ribbed cuffs and a silk lining.' },
  { id: 'baroque-shirt', name: 'Baroque Silk Shirt', category: 'tops', gender: 'men', art: 'shirt', garment: 'upper_body', price: 590, color: { name: 'Noir and gold baroque', hex: '#1c1a1d', family: 'black' }, pattern: 'baroque', accent: '#c9a96e', styles: ['glam', 'boho'], occasions: ['evening', 'vacation', 'date'], sellerId: 'maison-lumiere', material: 'Silk twill', sizes: M, description: 'Gold scrolls on black silk. Wear it open over a tee, or buttoned for the party.' },
  { id: 'houndstooth-coat', name: 'Houndstooth Wool Overcoat', category: 'outerwear', gender: 'men', art: 'trench', garment: 'upper_body', price: 1380, color: { name: 'Grey houndstooth', hex: '#cfcac4', family: 'neutral' }, pattern: 'houndstooth', accent: '#2a2628', styles: ['classic', 'minimal'], occasions: ['work', 'evening'], sellerId: 'maison-lumiere', material: 'Italian wool houndstooth', sizes: M, description: 'A long, structured overcoat in classic houndstooth with horn buttons.' },
  { id: 'heritage-polo', name: 'Heritage Stripe Polo', category: 'tops', gender: 'men', art: 'polo', garment: 'upper_body', price: 420, color: { name: 'Navy heritage', hex: '#24304a', family: 'blue' }, pattern: 'heritage', accent: '#f1e7d8', styles: ['classic', 'street'], occasions: ['casual', 'work', 'vacation'], sellerId: 'maison-lumiere', material: 'Mercerised cotton piqué', sizes: M, description: 'Navy piqué with a wine-and-cream heritage stripe down the front.' },
  { id: 'check-trouser', name: 'House Check Trousers', category: 'bottoms', gender: 'men', art: 'trousers', garment: 'lower_body', price: 560, color: { name: 'Camel house check', hex: '#c4a077', family: 'neutral' }, pattern: 'check', accent: '#7a2840', styles: ['classic', 'street'], occasions: ['work', 'casual'], sellerId: 'maison-lumiere', material: 'Wool flannel check', sizes: MW, description: 'Pleated, straight-leg trousers in our house check. Pair with a rollneck or the heritage polo.' },
  { id: 'monogram-loafer', name: 'Monogram Horsebit Loafer', category: 'shoes', gender: 'men', art: 'loafers', price: 820, color: { name: 'Espresso monogram', hex: '#3f2619', family: 'neutral' }, pattern: 'monogram', accent: '#d9b77e', styles: ['classic', 'glam'], occasions: ['work', 'wedding', 'evening'], sellerId: 'maison-lumiere', material: 'Monogram canvas and calf leather', sizes: MSH, description: 'A sleek loafer with a gold-tone bit and our monogram canvas vamp.' },
  { id: 'quilted-heel', name: 'Quilted Slingback Heel', category: 'shoes', gender: 'women', art: 'heels', price: 690, color: { name: 'Ivory quilted', hex: '#efe5d6', family: 'white' }, pattern: 'quilted', accent: '#a68d74', styles: ['classic', 'glam', 'romantic'], occasions: ['wedding', 'work', 'evening'], sellerId: 'maison-lumiere', material: 'Quilted leather, gold heel cap', sizes: SH, description: 'Quilted ivory leather on a slender slingback with a gold-capped heel.' },
  // Maison edit: more houses' signatures (original designs): oversized streetwear, heritage stripe loafers, saddle-leather accessories
  { id: 'chunky-runner', name: 'Oversized Chunky Runner', category: 'shoes', gender: 'unisex', art: 'chunky-sneaker', price: 780, color: { name: 'Worn white', hex: '#e8e3da', family: 'white' }, styles: ['street', 'minimal'], occasions: ['casual', 'vacation', 'date'], sellerId: 'maison-lumiere', material: 'Distressed calf leather and mesh, sculpted rubber sole', sizes: SH, description: 'A deliberately oversized, lived-in runner with a sculpted triple sole. Street luxury at its loudest.' },
  { id: 'chunky-runner-noir', name: 'Oversized Chunky Runner, Noir', category: 'shoes', gender: 'unisex', art: 'chunky-sneaker', price: 780, color: { name: 'Noir', hex: '#242124', family: 'black' }, styles: ['street', 'minimal'], occasions: ['casual', 'evening'], sellerId: 'maison-lumiere', material: 'Calf leather and mesh, sculpted rubber sole', sizes: SH, description: 'The oversized runner in noir, with a sculpted triple sole and a worn-in finish.' },
  { id: 'oversized-hoodie', name: 'Oversized Faded Hoodie', category: 'tops', gender: 'unisex', art: 'hoodie', garment: 'upper_body', price: 640, color: { name: 'Faded black', hex: '#3a3739', family: 'black' }, styles: ['street'], occasions: ['casual'], sellerId: 'maison-lumiere', material: 'Heavy brushed cotton fleece, garment-dyed', sizes: M, description: 'Cut huge, then washed until it looks inherited. A drop-shoulder hoodie in heavy brushed fleece.' },
  { id: 'horsebit-loafer', name: 'Gilded Bit Loafer', category: 'shoes', gender: 'women', art: 'loafers', price: 740, color: { name: 'Black patent', hex: '#1b191c', family: 'black' }, styles: ['classic', 'glam'], occasions: ['work', 'evening', 'wedding'], sellerId: 'maison-lumiere', material: 'Patent calf leather, gold-tone hardware', sizes: SH, description: 'A glossy loafer with a gold-tone bit across the vamp. Tailoring, finished.' },
  { id: 'web-slide', name: 'Heritage Stripe Slide', category: 'shoes', gender: 'men', art: 'slide-band', price: 460, color: { name: 'Black and wine stripe', hex: '#1c191c', family: 'black' }, accent: '#8a2a3c', sole: '#141214', insole: '#262124', styles: ['street', 'classic', 'boho'], occasions: ['casual', 'vacation'], sellerId: 'maison-lumiere', material: 'Rubber and leather, woven heritage stripe', sizes: SH, description: 'A poolside slipper in our wine-and-green heritage stripe, with a cushioned leather footbed.' },
  { id: 'saddle-slide', name: 'Saddle Leather Slipper', category: 'shoes', gender: 'women', art: 'slide-notch', price: 520, color: { name: 'Saddle orange', hex: '#c8601e', family: 'red' }, accent: '#e3c48e', sole: '#e0cfae', insole: '#7a3a14', styles: ['minimal', 'classic', 'boho'], occasions: ['casual', 'vacation', 'date'], sellerId: 'maison-lumiere', material: 'Smooth calf leather, saddle-stitched', sizes: SH, description: 'A flat slipper in saddle orange calf leather, hand stitched with a single cut-out strap.' },
  { id: 'suede-slide-m', name: 'Taupe Suede Slipper', category: 'shoes', gender: 'men', art: 'slide-band', price: 430, color: { name: 'Taupe suede', hex: '#a08a74', family: 'neutral' }, accent: '#c9b79e', sole: '#3a3029', insole: '#6f5f50', styles: ['minimal', 'classic'], occasions: ['casual', 'vacation'], sellerId: 'maison-lumiere', material: 'Brushed suede, shearling-effect lining', sizes: MSH, description: 'A soft suede slip-on for the house, the terrace and the airport lounge.' },
  { id: 'saddle-bag', name: 'Saddle Orange Top-handle Bag', category: 'bags', gender: 'women', art: 'top-handle', price: 1890, color: { name: 'Saddle orange', hex: '#c8601e', family: 'red' }, accent: '#c9a96e', styles: ['classic', 'minimal', 'glam'], occasions: ['work', 'evening', 'wedding'], sellerId: 'maison-lumiere', material: 'Grained calf leather, palladium-tone clasp', sizes: ['One size'], description: 'A structured top-handle bag in saddle orange leather with a turn-lock clasp. Made to be passed down.' },
  { id: 'black-kelly', name: 'Noir Structured Top-handle', category: 'bags', gender: 'women', art: 'top-handle', price: 1690, color: { name: 'Noir', hex: '#1c191c', family: 'black' }, accent: '#c9a96e', styles: ['classic', 'glam', 'minimal'], occasions: ['work', 'evening'], sellerId: 'maison-lumiere', material: 'Box calf leather, gold-tone clasp', sizes: ['One size'], description: 'The structured top-handle in glossy box calf, crisp enough for the boardroom.' },
  { id: 'silk-carre', name: 'Hand-rolled Silk Carré', category: 'bags', gender: 'unisex', art: 'scarf', price: 390, color: { name: 'Orange and navy baroque', hex: '#d0701f', family: 'red' }, pattern: 'baroque', accent: '#1f2a4a', styles: ['classic', 'glam', 'boho'], occasions: ['work', 'date', 'vacation'], sellerId: 'maison-lumiere', material: 'Silk twill, hand-rolled edges', sizes: ['One size'], description: 'A square of silk twill printed with navy baroque scrolls on saddle orange, with hand-rolled edges. Knot it, tie it, frame it.' },
  { id: 'ivory-silk-carre', name: 'Ivory Silk Carré', category: 'bags', gender: 'unisex', art: 'scarf', price: 390, color: { name: 'Ivory and wine monogram', hex: '#f1e7d6', family: 'white' }, pattern: 'monogram', accent: '#7a2840', styles: ['classic', 'romantic'], occasions: ['work', 'wedding', 'date'], sellerId: 'maison-lumiere', material: 'Silk twill, hand-rolled edges', sizes: ['One size'], description: 'Our star monogram in wine on ivory silk twill.' },
  { id: 'leather-trench-m', name: 'Calf Leather Trench', category: 'outerwear', gender: 'men', art: 'trench', garment: 'upper_body', price: 2100, color: { name: 'Cognac', hex: '#8c4a24', family: 'neutral' }, styles: ['classic', 'street', 'glam'], occasions: ['evening', 'work', 'date'], sellerId: 'maison-lumiere', material: 'Buttery calf leather, silk lining', sizes: M, description: 'A long leather trench in cognac calf with a silk lining. It gets better every winter.' },
  { id: 'denim-oversize', name: 'Oversized Washed Denim Jacket', category: 'outerwear', gender: 'unisex', art: 'bomber', garment: 'upper_body', price: 590, color: { name: 'Washed indigo', hex: '#4f6a92', family: 'blue' }, styles: ['street', 'boho'], occasions: ['casual', 'vacation'], sellerId: 'maison-lumiere', material: 'Rigid denim, stone washed, contrast stitching', sizes: M, description: 'A boxy, oversized trucker in rigid stone-washed denim with golden contrast stitching.' },
  { id: 'tweed-jacket', name: 'Bouclé Tweed Jacket', category: 'outerwear', gender: 'women', art: 'blazer', garment: 'upper_body', price: 1480, color: { name: 'Blush bouclé', hex: '#e8c9c3', family: 'pink' }, accent: '#8d6a5a', pattern: 'houndstooth', styles: ['classic', 'romantic', 'glam'], occasions: ['work', 'wedding', 'date'], sellerId: 'maison-lumiere', material: 'Wool bouclé tweed with braided trim', sizes: S, description: 'A boxy tweed jacket with braided trim and gilt buttons. Soft, structured, eternal.' },
  { id: 'cashmere-rollneck-w', name: 'Cashmere Ribbed Rollneck', category: 'tops', gender: 'women', art: 'knit', garment: 'upper_body', price: 520, color: { name: 'Oat', hex: '#e0d1bb', family: 'neutral' }, styles: ['minimal', 'classic'], occasions: ['work', 'casual', 'date'], sellerId: 'maison-lumiere', material: 'Cashmere, fine rib knit', sizes: S, description: 'A fine rib-knit rollneck in oat cashmere. Weightless and warm.' },
  // Reference-inspired footwear, tops and denim (original designs)
  { id: 'cross-slide', name: 'Criss-cross Leather Slide', category: 'shoes', gender: 'men', art: 'slide-cross', price: 360, color: { name: 'Black', hex: '#1a171a', family: 'black' }, accent: '#c9a96e', sole: '#121012', insole: '#252023', styles: ['classic', 'minimal', 'glam'], occasions: ['casual', 'vacation', 'date'], sellerId: 'soleil-row', material: 'Smooth calf leather, padded leather footbed', sizes: MSH, description: 'Two broad straps cross over the foot on a contoured, padded footbed. Polished enough for dinner, easy enough for the beach.' },
  { id: 'band-slide-black', name: 'Wide Band Leather Slide', category: 'shoes', gender: 'men', art: 'slide-band', price: 340, color: { name: 'Black', hex: '#1c191c', family: 'black' }, accent: '#8a2a3c', sole: '#121012', insole: '#262124', styles: ['classic', 'street', 'minimal'], occasions: ['casual', 'vacation'], sellerId: 'soleil-row', material: 'Smooth calf leather, rubber sole', sizes: MSH, description: 'One wide band of glossy leather with a fine contrast stripe across the instep, on a flexible rubber sole.' },
  { id: 'twotone-slide', name: 'Cobalt and Ice Two-tone Slide', category: 'shoes', gender: 'men', art: 'slide-notch', price: 380, color: { name: 'Ice blue', hex: '#cfe0f1', family: 'blue' }, accent: '#1f4fd0', sole: '#15141a', insole: '#1f4fd0', styles: ['street', 'boho'], occasions: ['casual', 'vacation'], sellerId: 'soleil-row', material: 'Brushed suede and leather, rubber sole', sizes: MSH, description: 'Ice-blue brushed suede over a vivid cobalt footbed, with a cobalt leather strap and a gold stud.' },
  { id: 'notch-slide-black', name: 'Cut-out Leather Slide', category: 'shoes', gender: 'men', art: 'slide-notch', price: 420, color: { name: 'Black', hex: '#1a171a', family: 'black' }, accent: '#2a2428', sole: '#121012', insole: '#211c1f', styles: ['minimal', 'classic', 'street'], occasions: ['casual', 'vacation', 'date'], sellerId: 'maison-lumiere', material: 'Smooth calf leather, chunky moulded sole', sizes: MSH, description: 'A sculpted, arch-cut band in smooth black calf on a chunky moulded sole. Quiet, graphic and very comfortable.' },
  { id: 'thong-black', name: 'Padded Leather Thong Sandal', category: 'shoes', gender: 'unisex', art: 'thong', price: 480, color: { name: 'Black', hex: '#1b181b', family: 'black' }, sole: '#101010', insole: '#221e21', styles: ['minimal', 'street', 'classic'], occasions: ['casual', 'vacation'], sellerId: 'maison-lumiere', material: 'Padded smooth leather, thick moulded sole', sizes: SH, description: 'A softly padded thong strap on a thick, cushioned platform sole. Smooth leather, stitched edge.' },
  { id: 'thong-pink', name: 'Blush Leather Thong Sandal', category: 'shoes', gender: 'women', art: 'thong', price: 480, color: { name: 'Blush with espresso strap', hex: '#5a3a2a', family: 'neutral' }, pattern: 'baroque', accent: '#c9a96e', sole: '#161214', insole: '#f0b4c4', styles: ['romantic', 'glam', 'boho'], occasions: ['casual', 'vacation', 'date'], sellerId: 'maison-lumiere', material: 'Coated canvas strap, padded blush leather footbed', sizes: SH, description: 'A blush padded footbed with a coated-canvas strap in tonal baroque scrolls and gold, on a thick black sole.' },
  { id: 'thong-brown', name: 'Coated Canvas Thong Sandal', category: 'shoes', gender: 'women', art: 'thong', price: 460, color: { name: 'Brown canvas', hex: '#6a4328', family: 'neutral' }, pattern: 'check', accent: '#d9b77e', sole: '#141214', insole: '#241f21', styles: ['classic', 'boho', 'minimal'], occasions: ['casual', 'vacation'], sellerId: 'maison-lumiere', material: 'Coated canvas strap, padded leather footbed', sizes: SH, description: 'A house-check coated-canvas strap over a padded black footbed.' },
  { id: 'rope-slide-black', name: 'Rope-sole Leather Slide', category: 'shoes', gender: 'unisex', art: 'rope-slide', price: 450, color: { name: 'Black', hex: '#1b181b', family: 'black' }, sole: '#dcc79c', insole: '#1b1a24', styles: ['minimal', 'classic', 'boho'], occasions: ['casual', 'vacation', 'date'], sellerId: 'maison-lumiere', material: 'Smooth calf leather upper, hand-stitched jute rope sole', sizes: SH, description: 'A cut-out leather upper on a hand-stitched jute rope sole, with a leather heel patch. Cool underfoot all summer.' },
  { id: 'rope-slide-cobalt', name: 'Rope-sole Suede Slide', category: 'shoes', gender: 'unisex', art: 'rope-slide', price: 450, color: { name: 'Cobalt suede', hex: '#2f5fd4', family: 'blue' }, sole: '#dcc79c', insole: '#16224f', styles: ['boho', 'street', 'minimal'], occasions: ['casual', 'vacation'], sellerId: 'maison-lumiere', material: 'Brushed suede upper, hand-stitched jute rope sole', sizes: SH, description: 'The rope-sole slide in cobalt brushed suede, with a navy heel patch.' },
  { id: 'rib-tank-black', name: 'Ribbed Tank, Black with Grey Trim', category: 'tops', gender: 'women', art: 'tank', garment: 'upper_body', price: 54, color: { name: 'Black', hex: '#161416', family: 'black' }, accent: '#aeb1b5', styles: ['minimal', 'street', 'classic'], occasions: ['casual', 'vacation', 'date'], sellerId: 'linen-lane', material: 'Ribbed stretch cotton', sizes: S, description: 'A fitted ribbed cotton tank with a contrast grey binding at the neck and arms. Stretchy, soft, endlessly layerable.' },
  { id: 'rib-tank-cream', name: 'Ribbed Tank, Cream with Black Trim', category: 'tops', gender: 'women', art: 'tank', garment: 'upper_body', price: 54, color: { name: 'Cream', hex: '#f1ebdc', family: 'white' }, accent: '#161416', styles: ['minimal', 'classic', 'street'], occasions: ['casual', 'vacation', 'date'], sellerId: 'linen-lane', material: 'Ribbed stretch cotton', sizes: S, description: 'The ribbed tank in cream with a crisp black binding at the neck and arms.' },
  { id: 'waxed-flare', name: 'Waxed Flared Wide-leg Jeans', category: 'bottoms', gender: 'unisex', art: 'flare-jeans', garment: 'lower_body', price: 260, color: { name: 'Waxed black', hex: '#1c1b1f', family: 'black' }, styles: ['street'], occasions: ['casual', 'evening'], sellerId: 'maison-lumiere', material: 'Waxed rigid denim, crinkled, flared hem', sizes: MW, description: 'Wide through the thigh, flared at the hem and coated in a crinkled black wax. Stack them over boots or chunky runners.' },
  { id: 'waxed-flare-brown', name: 'Waxed Flared Jeans, Espresso', category: 'bottoms', gender: 'unisex', art: 'flare-jeans', garment: 'lower_body', price: 260, color: { name: 'Waxed espresso', hex: '#3b2a22', family: 'neutral' }, styles: ['street', 'classic'], occasions: ['casual', 'evening'], sellerId: 'maison-lumiere', material: 'Waxed rigid denim, crinkled, flared hem', sizes: MW, description: 'The waxed flare in a rich espresso brown.' },
  { id: 'canvas-backpack', name: 'Olive Canvas Backpack', category: 'bags', gender: 'men', art: 'backpack', price: 96, color: { name: 'Olive', hex: '#6f7356', family: 'green' }, styles: ['street', 'boho', 'minimal'], occasions: ['casual', 'vacation'], sellerId: 'linen-lane', material: 'Waxed canvas and leather', sizes: ['One size'], description: 'A roll-top backpack in waxed canvas for weekends away.' },
];

SELLERS.push(...HOUSES);
PRODUCTS.push(...HOUSE_PRODUCTS);

/** Pieces featured as New In, newest first. */
export const NEW_IN = ['vermeil-top-handle', 'malle-trunk-navy', 'aurelia-chrono', 'brut-biker', 'prisma-trench', 'giardino-loafer', 'thong-black', 'waxed-flare', 'rib-tank-black', 'rope-slide-cobalt', 'cross-slide', 'monogram-trench', 'chunky-runner', 'saddle-bag', 'monogram-bomber', 'oversized-hoodie', 'peony-midi', 'ivory-agbada', 'blush-blazer', 'navy-suit-jacket', 'gilded-mini', 'camel-overcoat', 'blush-heel', 'espresso-loafer', 'striped-shirt', 'wine-senator', 'blush-tote', 'espresso-briefcase', 'sage-jumpsuit', 'black-bomber'];

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id) ?? ALL_PRODUCTS.find((p) => p.id === id);
export const sellerById = (id: string) => SELLERS.find((s) => s.id === id) ?? ALL_SELLERS.find((s) => s.id === id);

/** The retailer page for a product, tagged so sellers can see the referral. */
export function retailerUrl(p: Product) {
  const seller = sellerById(p.sellerId)!;
  const url = new URL(p.url ?? `${seller.website}/products/${p.id}`);
  url.searchParams.set('utm_source', 'empire-atelier');
  url.searchParams.set('utm_medium', 'referral');
  return url.toString();
}

/** Demo sellers use reserved .example domains; real links replace them. */
export const isDemoLink = (url: string) => /\.example(\.com)?$/.test(new URL(url).hostname);

export let PRICE_MAX = Math.max(...PRODUCTS.map((p) => p.price));

/** Adds (or replaces) the shop owner's own products and store. Called by the app when it loads them. */
/** Everything the app ships with, kept aside while the owner's own products are the whole store. */
const BUILT_IN = { products: null as Product[] | null, sellers: null as Seller[] | null, newIn: null as string[] | null };
const ALL_PRODUCTS: Product[] = [];
const ALL_SELLERS: Seller[] = [];

/**
 * Puts the owner's products in the store. When there are any, they are the only products listed
 * (the built-in demo catalogue is set aside); with none, the demo catalogue is shown.
 */
export function registerShop(seller: Seller | null, products: Product[]) {
  if (!BUILT_IN.products) {
    BUILT_IN.products = PRODUCTS.filter((p) => !p.custom);
    BUILT_IN.sellers = SELLERS.filter((x) => x.id !== 'my-store');
    BUILT_IN.newIn = [...NEW_IN];
    ALL_PRODUCTS.push(...BUILT_IN.products);
    ALL_SELLERS.push(...BUILT_IN.sellers);
  }
  const mine = !!seller && products.length > 0;
  PRODUCTS.splice(0, PRODUCTS.length, ...(mine ? products : [...products, ...BUILT_IN.products]));
  SELLERS.splice(0, SELLERS.length, ...(mine ? [seller] : [...BUILT_IN.sellers!]));
  NEW_IN.splice(0, NEW_IN.length, ...(mine ? products.map((p) => p.id) : BUILT_IN.newIn!));
  ONLY_MINE = mine;
  PRICE_MAX = Math.max(...PRODUCTS.map((p) => p.price));
}

/** True when only the owner's own products are listed. */
export let ONLY_MINE = false;

/** A product to show as decoration: the named one when it is listed, else one of the listed products. */
export const showcase = (id: string, i = 0): Product => {
  const p = PRODUCTS.find((x) => x.id === id);
  return p ?? PRODUCTS[i % PRODUCTS.length];
};

export const DEPARTMENTS: { key: Department; label: string }[] = [
  { key: 'women', label: 'Women' },
  { key: 'men', label: 'Men' },
  { key: 'all', label: 'All' },
];

/** True when the piece belongs in the department being browsed. */
export const inDepartment = (p: Product, d: Department) => d === 'all' || p.gender === 'unisex' || p.gender === d;

/** The same cut in other colours (same artwork, category and department), the piece itself first. */
export const colourways = (p: Product) => [p, ...PRODUCTS.filter((o) => o.id !== p.id && (p.custom ? !!p.group && o.group === p.group : o.sellerId === p.sellerId && o.art === p.art && o.category === p.category && o.gender === p.gender))];

export const formatPrice = (n: number) => `$${n.toLocaleString('en-US')}`;

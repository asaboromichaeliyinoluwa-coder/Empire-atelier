/**
 * Demo catalog: participating sellers and their clothing. Prices are in US dollars.
 *
 * To go live, replace each seller's `website` and each product's `url` with real links, and set
 * `image` (catalog photo) and `tryOnImage` (product-only shot YouCam uses for try-on). Products
 * without photos are drawn from `art` (see garments.ts).
 */
import type { GarmentKind, Pattern } from './garments.ts';

export type Category = 'tops' | 'bottoms' | 'dresses' | 'sets' | 'outerwear' | 'shoes' | 'bags';
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
  styles: Style[];
  occasions: Occasion[];
  sellerId: string;
  material: string;
  sizes: string[];
  description: string;
  image?: string;
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
];

const S = ['XS', 'S', 'M', 'L', 'XL'];
const SH = ['36', '37', '38', '39', '40', '41'];
const M = ['S', 'M', 'L', 'XL', 'XXL'];
const MW = ['30', '32', '34', '36', '38'];
const MSH = ['40', '41', '42', '43', '44', '45', '46'];

export const PRODUCTS: Product[] = [
  // Dresses
  { id: 'peony-midi', name: 'Peony Wrap Midi', category: 'dresses', gender: 'women', art: 'midi-dress', garment: 'full_body', price: 168, color: { name: 'Rose floral', hex: '#c9667f', family: 'pink' }, pattern: 'floral', styles: ['romantic', 'boho'], occasions: ['date', 'wedding', 'vacation'], sellerId: 'maison-rose', material: 'Viscose georgette', sizes: S, description: 'A fluttering wrap midi printed with blush peonies, cinched at the waist and swinging below the knee.' },
  { id: 'blush-slip', name: 'Blush Satin Slip', category: 'dresses', gender: 'women', art: 'slip-dress', garment: 'full_body', price: 142, color: { name: 'Blush', hex: '#f0c9cf', family: 'pink' }, styles: ['glam', 'minimal', 'romantic'], occasions: ['date', 'evening'], sellerId: 'velvet-vine', material: 'Silk-feel satin', sizes: S, description: 'Bias-cut satin that skims the body, with fine adjustable straps and a cowl front.' },
  { id: 'empress-gown', name: 'Empress Velvet Gown', category: 'dresses', gender: 'women', art: 'gown', garment: 'full_body', price: 389, was: 460, color: { name: 'Wine', hex: '#7a2840', family: 'red' }, styles: ['glam', 'classic'], occasions: ['evening', 'wedding'], sellerId: 'velvet-vine', material: 'Stretch velvet', sizes: S, description: 'A floor-sweeping velvet gown with a sculpted bodice and a full skirt that moves beautifully.' },
  { id: 'ivory-column', name: 'Ivory Column Dress', category: 'dresses', gender: 'women', art: 'slip-dress', garment: 'full_body', price: 210, color: { name: 'Ivory', hex: '#f6eee3', family: 'white' }, styles: ['minimal', 'classic'], occasions: ['wedding', 'evening', 'work'], sellerId: 'atelier-noor', material: 'Heavy crepe', sizes: S, description: 'A clean column of ivory crepe, lined, with a softly scooped neck.' },
  { id: 'polka-mini', name: 'Polka Puff Mini', category: 'dresses', gender: 'women', art: 'mini-dress', garment: 'full_body', price: 96, color: { name: 'White dot', hex: '#fbf7f2', family: 'white' }, pattern: 'dots', styles: ['romantic', 'street'], occasions: ['casual', 'date', 'vacation'], sellerId: 'maison-rose', material: 'Cotton poplin', sizes: S, description: 'Puff sleeves and a flippy skirt in crisp polka-dot cotton.' },
  { id: 'gilded-mini', name: 'Gilded Party Mini', category: 'dresses', gender: 'women', art: 'mini-dress', garment: 'full_body', price: 178, color: { name: 'Champagne', hex: '#d2b47e', family: 'gold' }, styles: ['glam'], occasions: ['evening', 'date'], sellerId: 'velvet-vine', material: 'Metallic jacquard', sizes: S, description: 'A champagne jacquard mini that catches every light on the dance floor.' },
  { id: 'kente-maxi', name: 'Kente Sun Maxi', category: 'dresses', gender: 'women', art: 'gown', garment: 'full_body', price: 154, color: { name: 'Terracotta stripe', hex: '#c4724e', family: 'neutral' }, pattern: 'stripe', styles: ['boho'], occasions: ['vacation', 'wedding', 'casual'], sellerId: 'kora-studio', material: 'Hand-woven cotton', sizes: S, description: 'A sweeping maxi in hand-woven stripes, made for golden-hour celebrations.' },
  { id: 'sage-jumpsuit', name: 'Sage Linen Jumpsuit', category: 'dresses', gender: 'women', art: 'jumpsuit', garment: 'full_body', price: 124, color: { name: 'Sage', hex: '#9db09a', family: 'green' }, styles: ['minimal', 'boho'], occasions: ['casual', 'vacation', 'work'], sellerId: 'linen-lane', material: '100% linen', sizes: S, description: 'Wide-leg linen jumpsuit with a square neck and a relaxed, breezy fit.' },
  { id: 'noir-jumpsuit', name: 'Noir Tailored Jumpsuit', category: 'dresses', gender: 'women', art: 'jumpsuit', garment: 'full_body', price: 198, color: { name: 'Black', hex: '#1f1c1f', family: 'black' }, styles: ['classic', 'minimal', 'glam'], occasions: ['work', 'evening'], sellerId: 'atelier-noor', material: 'Stretch crepe', sizes: S, description: 'Sharp, sleek and easy: a tailored black jumpsuit that goes desk to dinner.' },

  // Tops
  { id: 'pink-cami', name: 'Petal Silk Cami', category: 'tops', gender: 'women', art: 'cami', garment: 'upper_body', price: 58, color: { name: 'Petal pink', hex: '#eba9b7', family: 'pink' }, styles: ['romantic', 'glam', 'minimal'], occasions: ['date', 'casual', 'evening'], sellerId: 'maison-rose', material: 'Washed silk', sizes: S, description: 'A barely-there silk cami with a soft V and fine straps.' },
  { id: 'striped-shirt', name: 'Riviera Striped Shirt', category: 'tops', gender: 'women', art: 'blouse', garment: 'upper_body', price: 72, color: { name: 'Ivory stripe', hex: '#f5efe6', family: 'white' }, pattern: 'stripe', styles: ['classic', 'minimal', 'street'], occasions: ['work', 'casual', 'vacation'], sellerId: 'linen-lane', material: 'Cotton-linen', sizes: S, description: 'A relaxed button-down in fine ivory stripes. Tuck it, knot it, or wear it open.' },
  { id: 'white-blouse', name: 'Essential White Blouse', category: 'tops', gender: 'women', art: 'blouse', garment: 'upper_body', price: 64, color: { name: 'White', hex: '#fbf8f3', family: 'white' }, styles: ['classic', 'minimal'], occasions: ['work', 'casual'], sellerId: 'linen-lane', material: 'Organic cotton', sizes: S, description: 'The perfect white shirt: crisp, softly oversized, with a deep cuff.' },
  { id: 'rose-blouse', name: 'Rosewater Blouse', category: 'tops', gender: 'women', art: 'blouse', garment: 'upper_body', price: 88, color: { name: 'Dusty rose', hex: '#d98c9e', family: 'pink' }, styles: ['romantic', 'classic'], occasions: ['work', 'date'], sellerId: 'maison-rose', material: 'Crepe de chine', sizes: S, description: 'A fluid crepe blouse in dusty rose with covered buttons.' },
  { id: 'camel-knit', name: 'Camel Cloud Knit', category: 'tops', gender: 'women', art: 'knit', garment: 'upper_body', price: 92, color: { name: 'Camel', hex: '#c9a37a', family: 'neutral' }, styles: ['minimal', 'classic', 'street'], occasions: ['casual', 'work'], sellerId: 'linen-lane', material: 'Merino-cashmere', sizes: S, description: 'A cloud-soft knit in warm camel with ribbed edges.' },
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
  { id: 'camel-trench', name: 'Camel Belted Trench', category: 'outerwear', gender: 'women', art: 'trench', garment: 'upper_body', price: 248, color: { name: 'Camel', hex: '#c8a77c', family: 'neutral' }, styles: ['classic', 'minimal'], occasions: ['work', 'casual'], sellerId: 'linen-lane', material: 'Water-repellent cotton gabardine', sizes: S, description: 'The forever trench: double-breasted, belted and storm-flapped.' },
  { id: 'blush-blazer', name: 'Blush Boyfriend Blazer', category: 'outerwear', gender: 'women', art: 'blazer', garment: 'upper_body', price: 168, color: { name: 'Blush', hex: '#e9b3bd', family: 'pink' }, styles: ['romantic', 'classic', 'street'], occasions: ['work', 'date', 'casual'], sellerId: 'maison-rose', material: 'Crepe', sizes: S, description: 'An easy, slouchy blazer in the softest blush.' },
  { id: 'black-blazer', name: 'Sculpted Black Blazer', category: 'outerwear', gender: 'women', art: 'blazer', garment: 'upper_body', price: 196, color: { name: 'Black', hex: '#1f1c1f', family: 'black' }, styles: ['classic', 'minimal', 'glam'], occasions: ['work', 'evening'], sellerId: 'atelier-noor', material: 'Wool crepe', sizes: S, description: 'Strong shoulders and a nipped waist. The jacket that does the work.' },
  { id: 'ivory-trench', name: 'Ivory Longline Coat', category: 'outerwear', gender: 'women', art: 'trench', garment: 'upper_body', price: 284, color: { name: 'Ivory', hex: '#f1e8db', family: 'white' }, styles: ['minimal', 'glam'], occasions: ['work', 'evening', 'wedding'], sellerId: 'velvet-vine', material: 'Wool-cashmere', sizes: S, description: 'A long ivory coat that turns any outfit into an entrance.' },

  // Shoes
  { id: 'nude-pump', name: 'Nude Pointed Pump', category: 'shoes', gender: 'women', art: 'heels', price: 128, color: { name: 'Nude', hex: '#dcb79a', family: 'neutral' }, styles: ['classic', 'minimal', 'glam', 'romantic'], occasions: ['work', 'wedding', 'evening', 'date'], sellerId: 'soleil-row', material: 'Nappa leather', sizes: SH, description: 'An 85 mm pointed pump in a skin-tone nude that lengthens the leg.' },
  { id: 'gold-heel', name: 'Gold Evening Heel', category: 'shoes', gender: 'women', art: 'heels', price: 156, color: { name: 'Gold', hex: '#c9a96e', family: 'gold' }, styles: ['glam'], occasions: ['evening', 'wedding', 'date'], sellerId: 'soleil-row', material: 'Metallic leather', sizes: SH, description: 'Metallic gold leather on a slim stiletto.' },
  { id: 'blush-heel', name: 'Blush Satin Heel', category: 'shoes', gender: 'women', art: 'heels', price: 118, color: { name: 'Blush', hex: '#eab4be', family: 'pink' }, styles: ['romantic', 'glam'], occasions: ['wedding', 'date', 'evening'], sellerId: 'maison-rose', material: 'Satin', sizes: SH, description: 'Blush satin pumps, made for dancing at weddings.' },
  { id: 'white-sneaker', name: 'Court White Sneaker', category: 'shoes', gender: 'unisex', art: 'sneakers', price: 89, color: { name: 'White', hex: '#f8f5f0', family: 'white' }, styles: ['street', 'minimal', 'boho'], occasions: ['casual', 'vacation', 'work'], sellerId: 'soleil-row', material: 'Leather', sizes: SH, description: 'Clean leather court sneakers that go with everything.' },
  { id: 'blush-sneaker', name: 'Rose Suede Sneaker', category: 'shoes', gender: 'women', art: 'sneakers', price: 95, color: { name: 'Rose', hex: '#e7a7b4', family: 'pink' }, styles: ['street', 'romantic'], occasions: ['casual', 'vacation'], sellerId: 'soleil-row', material: 'Suede', sizes: SH, description: 'Soft rose suede on a cushioned sole.' },

  // Bags
  { id: 'camel-tote', name: 'Camel Leather Tote', category: 'bags', gender: 'women', art: 'tote', price: 189, color: { name: 'Camel', hex: '#d0aa7c', family: 'neutral' }, styles: ['classic', 'minimal', 'street', 'boho'], occasions: ['work', 'casual', 'vacation'], sellerId: 'soleil-row', material: 'Vegetable-tanned leather', sizes: ['One size'], description: 'Fits a laptop and a life. Ages to a rich patina.' },
  { id: 'blush-tote', name: 'Blush Mini Tote', category: 'bags', gender: 'women', art: 'tote', price: 132, color: { name: 'Blush', hex: '#f0bfc7', family: 'pink' }, styles: ['romantic', 'street'], occasions: ['casual', 'date', 'vacation'], sellerId: 'maison-rose', material: 'Pebbled leather', sizes: ['One size'], description: 'A sweet blush mini tote with a detachable strap.' },
  { id: 'gold-clutch', name: 'Champagne Clutch', category: 'bags', gender: 'women', art: 'clutch', price: 98, color: { name: 'Champagne', hex: '#cfb17e', family: 'gold' }, styles: ['glam', 'classic', 'romantic'], occasions: ['evening', 'wedding', 'date'], sellerId: 'velvet-vine', material: 'Satin with gold clasp', sizes: ['One size'], description: 'A champagne satin envelope clutch with a gold clasp.' },
  { id: 'black-clutch', name: 'Noir Envelope Clutch', category: 'bags', gender: 'women', art: 'clutch', price: 84, color: { name: 'Black', hex: '#221f22', family: 'black' }, styles: ['minimal', 'glam', 'classic'], occasions: ['evening', 'work', 'date'], sellerId: 'atelier-noor', material: 'Leather', sizes: ['One size'], description: 'Sleek black leather clutch, sized for the essentials.' },
  // Menswear: kaftans and sets
  { id: 'ivory-agbada', name: 'Ivory Embroidered Agbada', category: 'sets', gender: 'men', art: 'agbada', garment: 'full_body', price: 340, color: { name: 'Ivory', hex: '#f2eadc', family: 'white' }, styles: ['classic', 'glam'], occasions: ['wedding', 'evening'], sellerId: 'adeyemi', material: 'Cotton damask, hand embroidery', sizes: M, description: 'A three-piece agbada with tonal embroidery at the neck. Made for the groom’s side of the aisle.' },
  { id: 'navy-senator', name: 'Midnight Senator Kaftan', category: 'sets', gender: 'men', art: 'kaftan', garment: 'full_body', price: 175, color: { name: 'Navy', hex: '#26324a', family: 'blue' }, styles: ['classic', 'minimal'], occasions: ['work', 'wedding', 'evening'], sellerId: 'adeyemi', material: 'Cashmere-feel wool blend', sizes: M, description: 'A long senator top with matching trousers, clean placket and piped pocket.' },
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
  { id: 'stone-chino', name: 'Stone Chinos', category: 'bottoms', gender: 'men', art: 'trousers', garment: 'lower_body', price: 74, color: { name: 'Stone', hex: '#d8c8ac', family: 'neutral' }, styles: ['classic', 'street', 'minimal'], occasions: ['casual', 'work', 'vacation', 'date'], sellerId: 'linen-lane', material: 'Stretch cotton twill', sizes: MW, description: 'Clean stone chinos with a tapered leg.' },
  { id: 'indigo-jeans', name: 'Indigo Slim Jeans', category: 'bottoms', gender: 'men', art: 'jeans', garment: 'lower_body', price: 85, color: { name: 'Indigo', hex: '#34496e', family: 'blue' }, styles: ['street', 'classic'], occasions: ['casual', 'date', 'vacation'], sellerId: 'linen-lane', material: 'Selvedge denim', sizes: MW, description: 'Deep indigo selvedge that fades to fit you.' },
  { id: 'black-jeans-m', name: 'Black Tapered Jeans', category: 'bottoms', gender: 'men', art: 'jeans', garment: 'lower_body', price: 79, color: { name: 'Black', hex: '#222024', family: 'black' }, styles: ['street', 'minimal'], occasions: ['casual', 'evening', 'date'], sellerId: 'linen-lane', material: 'Stretch denim', sizes: MW, description: 'Washed-black denim with a relaxed seat and tapered ankle.' },
  { id: 'sand-shorts', name: 'Sand Linen Shorts', category: 'bottoms', gender: 'men', art: 'shorts', garment: 'lower_body', price: 48, color: { name: 'Sand', hex: '#d9c5a3', family: 'neutral' }, styles: ['boho', 'minimal', 'street'], occasions: ['vacation', 'casual'], sellerId: 'linen-lane', material: '100% linen', sizes: MW, description: 'Drawstring linen shorts with a 7-inch inseam.' },

  // Menswear: outerwear
  { id: 'navy-suit-jacket', name: 'Navy Tailored Suit Jacket', category: 'outerwear', gender: 'men', art: 'blazer', garment: 'upper_body', price: 268, color: { name: 'Navy', hex: '#26304a', family: 'blue' }, styles: ['classic', 'glam'], occasions: ['work', 'wedding', 'evening'], sellerId: 'adeyemi', material: 'Super 110s wool', sizes: M, description: 'A two-button single-breasted jacket with soft shoulders and a half lining.' },
  { id: 'charcoal-blazer', name: 'Charcoal Wool Blazer', category: 'outerwear', gender: 'men', art: 'blazer', garment: 'upper_body', price: 238, color: { name: 'Charcoal', hex: '#38363a', family: 'black' }, styles: ['classic', 'minimal'], occasions: ['work', 'evening', 'date'], sellerId: 'northcote', material: 'Wool flannel', sizes: M, description: 'An unstructured flannel blazer that works over a knit or a shirt.' },
  { id: 'camel-overcoat', name: 'Camel Overcoat', category: 'outerwear', gender: 'men', art: 'trench', garment: 'upper_body', price: 320, color: { name: 'Camel', hex: '#bf9b6f', family: 'neutral' }, styles: ['classic', 'minimal'], occasions: ['work', 'casual', 'evening'], sellerId: 'northcote', material: 'Wool-cashmere', sizes: M, description: 'A knee-length camel overcoat. The last coat you’ll need.' },
  { id: 'black-bomber', name: 'Black Nylon Bomber', category: 'outerwear', gender: 'men', art: 'bomber', garment: 'upper_body', price: 145, color: { name: 'Black', hex: '#1e1c20', family: 'black' }, styles: ['street', 'minimal'], occasions: ['casual', 'date', 'vacation'], sellerId: 'linen-lane', material: 'Recycled nylon', sizes: M, description: 'A matte bomber with ribbed trims and a quilted lining.' },
  { id: 'denim-jacket', name: 'Washed Denim Jacket', category: 'outerwear', gender: 'men', art: 'bomber', garment: 'upper_body', price: 112, color: { name: 'Mid blue', hex: '#5d7aa3', family: 'blue' }, styles: ['street', 'boho'], occasions: ['casual', 'vacation'], sellerId: 'linen-lane', material: 'Rigid denim', sizes: M, description: 'A classic trucker jacket in a lived-in wash.' },

  // Menswear: shoes
  { id: 'espresso-loafer', name: 'Espresso Penny Loafer', category: 'shoes', gender: 'men', art: 'loafers', price: 148, color: { name: 'Espresso', hex: '#4a2a1d', family: 'neutral' }, styles: ['classic', 'minimal', 'glam', 'boho'], occasions: ['work', 'wedding', 'date', 'evening', 'vacation'], sellerId: 'adeyemi', material: 'Polished calf leather', sizes: MSH, description: 'Hand-lasted penny loafers in deep espresso. Wear with a kaftan or a suit.' },
  { id: 'black-oxford', name: 'Black Cap-toe Oxford', category: 'shoes', gender: 'men', art: 'oxford', price: 168, color: { name: 'Black', hex: '#1c1a1d', family: 'black' }, styles: ['classic', 'glam', 'minimal'], occasions: ['work', 'wedding', 'evening'], sellerId: 'northcote', material: 'Box calf, Goodyear welted', sizes: MSH, description: 'A cap-toe oxford for suits, ceremonies and big days.' },
  { id: 'suede-sneaker-m', name: 'Taupe Suede Sneaker', category: 'shoes', gender: 'men', art: 'sneakers', price: 98, color: { name: 'Taupe', hex: '#a89480', family: 'neutral' }, styles: ['street', 'minimal', 'boho'], occasions: ['casual', 'vacation', 'date'], sellerId: 'soleil-row', material: 'Suede', sizes: MSH, description: 'Low-profile suede sneakers on a gum sole.' },

  // Menswear: bags
  { id: 'espresso-briefcase', name: 'Espresso Leather Briefcase', category: 'bags', gender: 'men', art: 'briefcase', price: 245, color: { name: 'Espresso', hex: '#4b2c1f', family: 'neutral' }, styles: ['classic', 'minimal'], occasions: ['work'], sellerId: 'northcote', material: 'Full-grain leather', sizes: ['One size'], description: 'A slim briefcase with a padded laptop sleeve and brass hardware.' },
  { id: 'canvas-backpack', name: 'Olive Canvas Backpack', category: 'bags', gender: 'men', art: 'backpack', price: 96, color: { name: 'Olive', hex: '#6f7356', family: 'green' }, styles: ['street', 'boho', 'minimal'], occasions: ['casual', 'vacation'], sellerId: 'linen-lane', material: 'Waxed canvas and leather', sizes: ['One size'], description: 'A roll-top backpack in waxed canvas for weekends away.' },
];

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id);
export const sellerById = (id: string) => SELLERS.find((s) => s.id === id);

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

export const PRICE_MAX = Math.max(...PRODUCTS.map((p) => p.price));

export const DEPARTMENTS: { key: Department; label: string }[] = [
  { key: 'women', label: 'Women' },
  { key: 'men', label: 'Men' },
  { key: 'all', label: 'All' },
];

/** True when the piece belongs in the department being browsed. */
export const inDepartment = (p: Product, d: Department) => d === 'all' || p.gender === 'unisex' || p.gender === d;

export const formatPrice = (n: number) => `$${n.toLocaleString('en-US')}`;

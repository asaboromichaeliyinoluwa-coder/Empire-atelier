/**
 * The luxury houses: six original, fictional labels whose look is inspired by the great fashion
 * houses (leather goods, monogram and baroque prints, nylon, travel canvas, garden florals). Every
 * name, product and illustration here is original to Empire Atelier. No logos, names or trademarked
 * patterns of the real houses are used, and nothing is affiliated with or endorsed by them.
 */
import type { Category, Gender, Garment, Occasion, Product, Seller, Style } from './catalog.ts';
import type { GarmentKind, Pattern } from './garments.ts';

export const HOUSE_NOTE =
  'Original Empire Atelier designs, created in-house as studio renders and illustrations (not photographs) and inspired by the look of luxury houses. Not affiliated with or endorsed by Gucci, Balenciaga, Hermès, Versace, Louis Vuitton, Prada, Goyard or any other brand.';

export const HOUSES: (Seller & { vibe: string; palette: string[] })[] = [
  {
    id: 'atelier-vermeil', name: 'Atelier Vermeil', city: 'Paris', rating: 4.9, reviews: 1912, since: 1994,
    delivery: '2–5 days worldwide, signed-for', returns: 'Free returns within 30 days',
    about: 'Saddle-stitched leather goods in sunset orange, tan and black, with silk twill scarves and quiet watches.',
    website: 'https://atelier-vermeil.example.com',
    vibe: 'Saddle leather & silk twill', palette: ['#c1602a', '#7a4a2c', '#1b181b'],
  },
  {
    id: 'casa-aurelia', name: 'Casa Aurelia', city: 'Milan', rating: 4.8, reviews: 1430, since: 1989,
    delivery: '2–5 days worldwide', returns: 'Free returns within 30 days',
    about: 'Baroque gold, black silk and sculpted jewellery, made for evenings that are meant to be remembered.',
    website: 'https://casa-aurelia.example.com',
    vibe: 'Baroque gold & black silk', palette: ['#d6b25e', '#1c1b1f', '#8e2a44'],
  },
  {
    id: 'noir-brut', name: 'Noir Brut', city: 'Berlin', rating: 4.7, reviews: 2210, since: 2015,
    delivery: '3–6 days worldwide', returns: 'Free returns within 30 days',
    about: 'Oversized, washed and deliberately rough: waxed outerwear, heavy fleece, baggy denim and chunky sneakers.',
    website: 'https://noir-brut.example.com',
    vibe: 'Oversized street couture', palette: ['#2a2a2c', '#6a6d72', '#e7e4de'],
  },
  {
    id: 'studio-prisma', name: 'Studio Prisma', city: 'Milan', rating: 4.8, reviews: 1166, since: 2003,
    delivery: '2–5 days worldwide', returns: 'Free returns within 30 days',
    about: 'Technical nylon, brushed leather and precise geometry. Minimal pieces with an industrial edge.',
    website: 'https://studio-prisma.example.com',
    vibe: 'Technical nylon & clean lines', palette: ['#1b1d22', '#6b7c5a', '#d9d3c0'],
  },
  {
    id: 'malle-voyage', name: 'Malle & Voyage', city: 'Paris', rating: 4.9, reviews: 988, since: 1921,
    delivery: '3–7 days worldwide, hand-delivered gift box', returns: 'Free returns within 30 days',
    about: 'Travel goods made like trunks: coated chevron canvas, hand-painted edges and brass corners.',
    website: 'https://malle-voyage.example.com',
    vibe: 'Chevron canvas & trunks', palette: ['#243a63', '#2f5d46', '#6a2230'],
  },
  {
    id: 'giardino', name: 'Giardino', city: 'Florence', rating: 4.8, reviews: 1745, since: 1975,
    delivery: '2–5 days worldwide', returns: 'Free returns within 30 days',
    about: 'Garden greens, striped webbing and silk florals. Playful Italian heritage with polished loafers.',
    website: 'https://giardino.example.com',
    vibe: 'Garden greens & striped webbing', palette: ['#1f4d3a', '#9b1c2e', '#e7dcc4'],
  },
];

export const HOUSE_IDS = ['maison-lumiere', ...HOUSES.map((h) => h.id)];

const XS = ['XS', 'S', 'M', 'L', 'XL'];
const MS = ['S', 'M', 'L', 'XL', 'XXL'];
const SHOE_W = ['36', '37', '38', '39', '40', '41'];
const SHOE_M = ['40', '41', '42', '43', '44', '45'];
const SHOE_U = ['38', '39', '40', '41', '42', '43', '44'];
const ONE = ['One size'];

type Extra = { was?: number; pattern?: Pattern; accent?: string; sole?: string; insole?: string; garment?: Garment };
type Fam = Product['color']['family'];

const make = (
  sellerId: string, id: string, name: string, category: Category, gender: Gender, art: GarmentKind, price: number,
  color: [string, string, Fam], material: string, sizes: string[], styles: Style[], occasions: Occasion[], description: string, extra: Extra = {},
): Product => ({ id, name, category, gender, art, price, color: { name: color[0], hex: color[1], family: color[2] }, material, sizes, styles, occasions, sellerId, description, ...extra });

const V = 'atelier-vermeil', A = 'casa-aurelia', N = 'noir-brut', P = 'studio-prisma', Mv = 'malle-voyage', G = 'giardino';
const up: Garment = 'upper_body', low: Garment = 'lower_body', full: Garment = 'full_body';

export const HOUSE_PRODUCTS: Product[] = [
  // Atelier Vermeil: saddle leather, silk twill, quiet watches
  make(V, 'vermeil-saddle-tote', 'Saddle Tote, Sunset', 'bags', 'women', 'tote', 2450, ['Sunset orange', '#c1602a', 'red'], 'Box calf leather, palladium hardware', ONE, ['classic', 'minimal'], ['work', 'casual', 'vacation'], 'A structured, hand-stitched tote in glowing box calf. Saddle seams, a magnetic closure and edges painted by hand.', { accent: '#cfd2d6' }),
  make(V, 'vermeil-saddle-tote-black', 'Saddle Tote, Black', 'bags', 'women', 'tote', 2450, ['Black', '#1c1a1c', 'black'], 'Box calf leather, palladium hardware', ONE, ['classic', 'minimal'], ['work', 'evening'], 'The same hand-stitched tote in deep black calf, with palladium hardware that catches the light.', { accent: '#cfd2d6' }),
  make(V, 'vermeil-saddle-tote-tan', 'Saddle Tote, Tan', 'bags', 'women', 'tote', 2450, ['Tan', '#a4683a', 'neutral'], 'Box calf leather, brass hardware', ONE, ['classic', 'boho'], ['work', 'casual', 'vacation'], 'Warm tan calf that deepens with wear, finished with brass hardware.', { accent: '#c9a96e' }),
  make(V, 'vermeil-top-handle', 'Top-handle Bag, Sunset', 'bags', 'women', 'top-handle', 3200, ['Sunset orange', '#c1602a', 'red'], 'Box calf leather, gold-plated hardware', ONE, ['classic', 'glam'], ['evening', 'work', 'date'], 'A rounded top-handle bag with a turn-lock and a detachable strap. Carried by hand or worn across the body.', { accent: '#d9b77e' }),
  make(V, 'vermeil-top-handle-black', 'Top-handle Bag, Black', 'bags', 'women', 'top-handle', 3200, ['Black', '#1c1a1c', 'black'], 'Box calf leather, gold-plated hardware', ONE, ['classic', 'glam', 'minimal'], ['evening', 'work', 'date'], 'The turn-lock top-handle in polished black calf.', { accent: '#d9b77e' }),
  make(V, 'vermeil-reversible-belt', 'Reversible Leather Belt, Black', 'accessories', 'unisex', 'belt', 640, ['Black / tan', '#1c1a1c', 'black'], 'Reversible calfskin, gold-plated buckle', ['85', '90', '95', '100', '105'], ['classic', 'minimal'], ['work', 'casual', 'evening'], 'One strap, two looks: black on one side, tan on the other, with a rotating gold-plated buckle.', { accent: '#d9b77e' }),
  make(V, 'vermeil-reversible-belt-brown', 'Reversible Leather Belt, Brown', 'accessories', 'unisex', 'belt', 640, ['Brown / sand', '#5a3622', 'neutral'], 'Reversible calfskin, palladium buckle', ['85', '90', '95', '100', '105'], ['classic'], ['work', 'casual'], 'Dark brown on one side and sand on the other, with a palladium buckle.', { accent: '#cfd2d6' }),
  make(V, 'vermeil-silk-scarf', 'Silk Twill Carré', 'accessories', 'unisex', 'scarf', 420, ['Sunset heritage', '#c1602a', 'red'], 'Hand-rolled silk twill', ONE, ['classic', 'glam', 'boho'], ['work', 'date', 'vacation'], 'A 90 cm silk twill square with a hand-rolled hem, printed with a heritage stripe in sunset, wine and gold.', { pattern: 'heritage', accent: '#f1e3bf' }),
  make(V, 'vermeil-loafer', 'Saddle Loafer, Espresso', 'shoes', 'men', 'loafers', 890, ['Espresso', '#3a2418', 'neutral'], 'Polished calf leather, leather sole', SHOE_M, ['classic'], ['work', 'wedding', 'evening'], 'A hand-lasted loafer with a stitched saddle strap and a leather sole that moulds to your foot.', { sole: '#2a1a12', insole: '#6b4a34' }),
  make(V, 'vermeil-sandal', 'Leather Slide, Tan', 'shoes', 'women', 'slides', 620, ['Tan', '#b27744', 'neutral'], 'Vegetable-tanned leather', SHOE_W, ['minimal', 'classic'], ['casual', 'vacation'], 'A clean, wide-strap slide in vegetable-tanned leather with a cushioned insole.', { sole: '#d8c3a0', insole: '#e2cfae' }),
  make(V, 'vermeil-watch', 'Quiet Watch, Steel & Calf', 'accessories', 'unisex', 'watch', 4800, ['Brown strap', '#5a3622', 'neutral'], 'Calfskin strap, steel case', ['36 mm', '40 mm', '42 mm'], ['classic', 'minimal'], ['work', 'evening', 'wedding'], 'A slim, self-winding watch with a cream dial, applied hour markers and a hand-stitched calfskin strap.', { accent: '#cfd2d6', insole: '#f4efe6' }),
  make(V, 'vermeil-watch-black', 'Quiet Watch, Gold & Black', 'accessories', 'unisex', 'watch', 5200, ['Black strap', '#1c1a1c', 'black'], 'Calfskin strap, gold case', ['36 mm', '40 mm', '42 mm'], ['classic', 'glam'], ['evening', 'wedding', 'work'], 'The same slim movement in a yellow-gold case with a black dial and black alligator-grain strap.', { accent: '#d9b77e', insole: '#1b181b' }),
  make(V, 'vermeil-pendant', 'Aquamarine Pendant, Silver', 'accessories', 'women', 'pendant', 680, ['Silver', '#cfd3d8', 'white'], 'Sterling silver, aquamarine', ONE, ['minimal', 'romantic', 'classic'], ['date', 'work', 'wedding'], 'A fine sterling-silver medallion holding a cut aquamarine, on a 46 cm chain.', { accent: '#8fc7da' }),

  // Casa Aurelia: baroque gold, black silk, jewellery
  make(A, 'aurelia-baroque-shirt', 'Baroque Silk Shirt', 'tops', 'men', 'shirt', 780, ['Black / gold', '#1c1b1f', 'black'], 'Silk satin', MS, ['glam', 'street'], ['evening', 'date'], 'A slick silk-satin shirt with gold baroque scrolls, a spread collar and a relaxed, open fit.', { pattern: 'baroque', accent: '#d9b77e', garment: up }),
  make(A, 'aurelia-gold-mini', 'Gilded Baroque Mini', 'dresses', 'women', 'mini-dress', 1450, ['Black / gold', '#1c1b1f', 'black'], 'Silk satin', XS, ['glam'], ['evening', 'date'], 'A sculpted satin mini with a gold baroque print and a structured, corseted bodice.', { pattern: 'baroque', accent: '#d9b77e', garment: full }),
  make(A, 'aurelia-medallion', 'Garnet Medallion Necklace', 'accessories', 'unisex', 'pendant', 540, ['Gold', '#d6b25e', 'gold'], 'Gold-plated brass, garnet crystal', ONE, ['glam', 'classic'], ['evening', 'date', 'wedding'], 'A heavy medallion with a faceted garnet-red crystal, hung on a polished chain.', { accent: '#9b1c2e' }),
  make(A, 'aurelia-cuff', 'Baroque Cuff', 'accessories', 'women', 'bangle', 390, ['Gold', '#d6b25e', 'gold'], 'Gold-plated brass', ['S', 'M', 'L'], ['glam', 'boho'], ['evening', 'wedding'], 'A wide cuff in polished gold with a crown stone and engraved scroll work.', { accent: '#f1e3bf' }),
  make(A, 'aurelia-signet', 'Crest Signet Ring', 'accessories', 'unisex', 'ring', 320, ['Gold', '#d6b25e', 'gold'], 'Gold-plated brass, onyx', ['50', '52', '54', '56', '58', '60', '62'], ['classic', 'glam', 'street'], ['evening', 'casual'], 'A chunky signet ring set with a black onyx face, made to be worn on the little finger.', { accent: '#1b181b' }),
  make(A, 'aurelia-chrono', 'Chronograph, Steel', 'accessories', 'men', 'watch', 5600, ['Steel', '#c7cbd1', 'white'], 'Stainless steel bracelet and case', ['40 mm', '42 mm', '44 mm'], ['classic', 'glam'], ['work', 'evening', 'wedding'], 'A bracelet chronograph with a midnight-blue dial, sapphire glass and 100 m water resistance.', { accent: '#c7cbd1', insole: '#14233b' }),
  make(A, 'aurelia-shades', 'Sculpted Acetate Shades', 'accessories', 'unisex', 'sunglasses', 410, ['Black / gold', '#1b181b', 'black'], 'Acetate frame, gold-plated hinges', ONE, ['glam', 'street'], ['casual', 'vacation', 'date'], 'Bold, wide-set acetate frames with graduated smoke lenses and gold hinges.', { accent: '#d9b77e', insole: '#2a2f3a' }),
  make(A, 'aurelia-clutch', 'Baroque Evening Clutch', 'bags', 'women', 'clutch', 880, ['Black / gold', '#1c1b1f', 'black'], 'Silk satin, gold-plated clasp', ONE, ['glam', 'classic'], ['evening', 'wedding'], 'A satin envelope clutch printed with gold baroque scrolls and a chain strap that tucks inside.', { pattern: 'baroque', accent: '#d9b77e' }),
  make(A, 'aurelia-platform', 'Gold Leather Sandal', 'shoes', 'women', 'heels', 760, ['Gold', '#cfa95e', 'gold'], 'Metallic calf leather', SHOE_W, ['glam'], ['evening', 'wedding', 'date'], 'A slim heel in liquid-gold leather with an ankle strap and a padded footbed.', { sole: '#1b181b', insole: '#d9c9a8' }),

  // Noir Brut: oversized street couture
  make(N, 'brut-bomber', 'Distressed Waxed Bomber', 'outerwear', 'unisex', 'bomber', 1150, ['Waxed charcoal', '#2a2a2c', 'black'], 'Distressed waxed cotton', MS, ['street'], ['casual', 'evening'], 'An oversized waxed bomber with a cracked, worn-in finish, drop shoulders and a heavy zip.', { garment: up }),
  make(N, 'brut-hoodie', 'Heavyweight Hoodie, Washed', 'tops', 'unisex', 'hoodie', 890, ['Washed grey', '#6a6d72', 'neutral'], 'Heavy brushed cotton fleece', MS, ['street'], ['casual'], 'A 600 gsm fleece hoodie, garment-dyed and sun-faded, cut huge through the body.', { garment: up }),
  make(N, 'brut-biker', 'Washed Leather Biker', 'outerwear', 'unisex', 'biker', 2150, ['Black', '#1b1a1c', 'black'], 'Washed lambskin leather', MS, ['street', 'classic', 'glam'], ['evening', 'casual', 'date'], 'A cropped biker in washed lambskin with an asymmetric zip, notched lapels and a belted hem.', { garment: up }),
  make(N, 'brut-runner', 'Chunky Runner, Bone', 'shoes', 'unisex', 'chunky-sneaker', 1090, ['Bone', '#e7e4de', 'white'], 'Leather and mesh', SHOE_U, ['street'], ['casual', 'vacation'], 'A deliberately oversized runner on a stacked sole, layered in distressed leather and mesh.', { sole: '#cfc9bf', insole: '#f1ede5' }),
  make(N, 'brut-runner-black', 'Chunky Runner, Black', 'shoes', 'unisex', 'chunky-sneaker', 1090, ['Black', '#1b1a1c', 'black'], 'Leather and mesh', SHOE_U, ['street'], ['casual', 'evening'], 'The oversized runner in all black, with a chunky tonal sole.', { sole: '#2a2a2c', insole: '#3a3a3c' }),
  make(N, 'brut-baggy-denim', 'Baggy Washed Denim', 'bottoms', 'unisex', 'jeans', 980, ['Smoke blue', '#4a5568', 'blue'], 'Rigid washed denim', ['28', '30', '32', '34', '36'], ['street'], ['casual'], 'Extra-wide, extra-long denim with a low rise, stacked at the hem and washed to a smoky blue.', { garment: low }),
  make(N, 'brut-wallet', 'Zip Wallet, Black', 'accessories', 'unisex', 'wallet', 420, ['Black', '#1b1a1c', 'black'], 'Grained calf leather', ONE, ['street', 'minimal'], ['casual', 'work'], 'A compact zip wallet in grained calf with eight card slots and a coin pocket.', { accent: '#8c8f94' }),
  make(N, 'brut-shades', 'Slim Wrap Shades', 'accessories', 'unisex', 'sunglasses', 480, ['Black', '#16151a', 'black'], 'Acetate frame', ONE, ['street', 'minimal'], ['casual', 'vacation'], 'A slim, wrap-style acetate frame with dark mirrored lenses.', { accent: '#8c8f94', insole: '#1d2229' }),

  // Studio Prisma: technical nylon, brushed leather, clean lines
  make(P, 'prisma-backpack', 'Nylon Backpack, Black', 'bags', 'unisex', 'backpack', 1350, ['Black', '#1b1d22', 'black'], 'Technical nylon, brushed leather trim', ONE, ['minimal', 'street'], ['work', 'casual', 'vacation'], 'A water-repellent nylon backpack with a padded laptop sleeve and a brushed-leather top handle.', { accent: '#aeb1b5' }),
  make(P, 'prisma-backpack-green', 'Nylon Backpack, Moss', 'bags', 'unisex', 'backpack', 1350, ['Moss', '#6b7c5a', 'green'], 'Technical nylon, brushed leather trim', ONE, ['minimal', 'street'], ['work', 'casual', 'vacation'], 'The same technical nylon backpack in a muted moss green.', { accent: '#d9d3c0' }),
  make(P, 'prisma-crossbody', 'Nylon Crossbody, Black', 'bags', 'unisex', 'crossbody', 980, ['Black', '#1b1d22', 'black'], 'Technical nylon', ONE, ['minimal', 'street'], ['casual', 'work'], 'A zipped nylon crossbody sized for the essentials, with an adjustable webbing strap.', { accent: '#aeb1b5', sole: '#2a2c33' }),
  make(P, 'prisma-crossbody-green', 'Nylon Crossbody, Moss', 'bags', 'unisex', 'crossbody', 980, ['Moss', '#6b7c5a', 'green'], 'Technical nylon', ONE, ['minimal', 'street'], ['casual', 'vacation'], 'The nylon crossbody in moss green with silver hardware.', { accent: '#cfd2d6', sole: '#3f4a36' }),
  make(P, 'prisma-trench', 'Nylon Gabardine Trench', 'outerwear', 'unisex', 'trench', 2200, ['Black', '#1b1d22', 'black'], 'Technical nylon gabardine', MS, ['minimal', 'street', 'classic'], ['work', 'casual', 'evening'], 'A clean, waterproof trench with taped seams, a hidden placket and a precise, boxy shoulder.', { garment: up }),
  make(P, 'prisma-loafer', 'Brushed Leather Loafer', 'shoes', 'unisex', 'loafers', 1050, ['Black', '#1a191b', 'black'], 'Brushed calf leather, rubber sole', SHOE_U, ['minimal', 'classic', 'street'], ['work', 'evening', 'casual'], 'A sleek loafer in brushed calf with a thick lug sole and a hidden elastic gusset.', { sole: '#2a292b', insole: '#3a383b' }),
  make(P, 'prisma-poplin', 'Poplin Shirt, White', 'tops', 'men', 'shirt', 720, ['White', '#fbfaf7', 'white'], 'Cotton poplin', MS, ['minimal', 'classic'], ['work', 'casual'], 'A crisp, square-cut poplin shirt with a concealed placket and a boxy, cropped body.', { garment: up }),
  make(P, 'prisma-slip', 'Satin Column Dress', 'dresses', 'women', 'slip-dress', 1680, ['Stone', '#d9d3c0', 'neutral'], 'Heavy satin', XS, ['minimal', 'glam'], ['evening', 'date', 'work'], 'A bias-cut satin column with a straight neckline, fine straps and a clean, ankle-length hem.', { garment: full }),
  make(P, 'prisma-cardholder', 'Saffiano Cardholder', 'accessories', 'unisex', 'wallet', 320, ['Black', '#1b1d22', 'black'], 'Saffiano-grain leather', ONE, ['minimal', 'classic'], ['work', 'casual'], 'A slim cardholder in cross-hatch leather that resists scratches and water.', { accent: '#aeb1b5' }),

  // Malle & Voyage: chevron canvas and travel
  make(Mv, 'malle-trunk-navy', 'Steamer Trunk, Navy', 'bags', 'unisex', 'trunk', 4900, ['Navy', '#243a63', 'blue'], 'Coated chevron canvas with saddle trim', ONE, ['classic'], ['vacation'], 'A hard-sided steamer trunk in coated chevron canvas, with hand-painted edges, brass corners and two locks.', { pattern: 'chevron', accent: '#d9b77e', sole: '#6b4a34' }),
  make(Mv, 'malle-trunk-green', 'Steamer Trunk, Forest', 'bags', 'unisex', 'trunk', 4900, ['Forest', '#2f5d46', 'green'], 'Coated chevron canvas with saddle trim', ONE, ['classic'], ['vacation'], 'The steamer trunk in forest green, with tan-painted edges.', { pattern: 'chevron', accent: '#d9b77e', sole: '#6b4a34' }),
  make(Mv, 'malle-trunk-wine', 'Steamer Trunk, Burgundy', 'bags', 'unisex', 'trunk', 4900, ['Burgundy', '#6a2230', 'red'], 'Coated chevron canvas with saddle trim', ONE, ['classic', 'glam'], ['vacation'], 'The steamer trunk in deep burgundy with gold-painted edges.', { pattern: 'chevron', accent: '#d9b77e', sole: '#6b4a34' }),
  make(Mv, 'malle-weekender-navy', 'Weekender Duffel, Navy', 'bags', 'unisex', 'duffel', 2150, ['Navy', '#243a63', 'blue'], 'Coated chevron canvas with saddle trim', ONE, ['classic', 'street'], ['vacation', 'work'], 'A soft-sided weekender in chevron canvas, with rolled handles, a shoulder strap and an interior shoe pocket.', { pattern: 'chevron', accent: '#d9b77e', sole: '#6b4a34' }),
  make(Mv, 'malle-weekender-green', 'Weekender Duffel, Forest', 'bags', 'unisex', 'duffel', 2150, ['Forest', '#2f5d46', 'green'], 'Coated chevron canvas with saddle trim', ONE, ['classic', 'street'], ['vacation', 'work'], 'The weekender duffel in forest green.', { pattern: 'chevron', accent: '#d9b77e', sole: '#6b4a34' }),
  make(Mv, 'malle-weekender-black', 'Weekender Duffel, Black', 'bags', 'unisex', 'duffel', 2150, ['Black', '#1f1f22', 'black'], 'Coated chevron canvas with saddle trim', ONE, ['classic', 'minimal'], ['vacation', 'work'], 'The weekender duffel in black with grey-painted edges.', { pattern: 'chevron', accent: '#aeb1b5', sole: '#2a2a2c' }),
  make(Mv, 'malle-tote', 'Voyage Tote, Navy', 'bags', 'women', 'tote', 1450, ['Navy', '#243a63', 'blue'], 'Coated chevron canvas with saddle trim', ONE, ['classic', 'minimal'], ['work', 'vacation', 'casual'], 'A roomy reversible tote in chevron canvas with a removable pouch.', { pattern: 'chevron', accent: '#d9b77e' }),
  make(Mv, 'malle-cardholder', 'Chevron Cardholder', 'accessories', 'unisex', 'wallet', 390, ['Navy', '#243a63', 'blue'], 'Coated chevron canvas with saddle trim', ONE, ['classic'], ['work', 'casual'], 'A pocket-sized cardholder in chevron canvas with a leather-lined interior.', { pattern: 'chevron', accent: '#d9b77e' }),
  make(Mv, 'malle-travel-blazer', 'Travel Blazer, Charcoal', 'outerwear', 'men', 'blazer', 1250, ['Charcoal', '#3b3d42', 'black'], 'Crease-resistant wool', MS, ['classic', 'minimal'], ['work', 'evening', 'wedding'], 'An unstructured blazer in crease-resistant wool that survives a long-haul and still looks pressed.', { garment: up }),
  make(Mv, 'malle-oxford', 'Patent Oxford, Black', 'shoes', 'men', 'oxford', 780, ['Black patent', '#141315', 'black'], 'Patent calf leather, leather sole', SHOE_M, ['classic'], ['wedding', 'evening', 'work'], 'A formal cap-toe oxford in mirror-polished patent leather with a Goodyear-welted leather sole.', { sole: '#1b181b', insole: '#4a3a30' }),

  // Giardino: garden greens, striped webbing, silk florals
  make(G, 'giardino-loafer', 'Garden Loafer, Green', 'shoes', 'men', 'loafers', 920, ['Garden green', '#1f4d3a', 'green'], 'Polished calf leather, leather sole', SHOE_M, ['classic', 'street'], ['work', 'casual', 'evening'], 'A polished loafer in deep green calf with a gold bit and a contrast red lining.', { accent: '#d9b77e', sole: '#2a1a12', insole: '#9b1c2e' }),
  make(G, 'giardino-web-belt', 'Striped Web Belt', 'accessories', 'unisex', 'belt', 520, ['Green / red', '#1f4d3a', 'green'], 'Cotton webbing, gold-plated buckle', ['85', '90', '95', '100', '105'], ['classic', 'street', 'boho'], ['casual', 'vacation', 'work'], 'A woven web belt in garden green with a red centre stripe and a gold-plated double buckle.', { pattern: 'stripe', accent: '#9b1c2e' }),
  make(G, 'giardino-floral-midi', 'Silk Garden Midi', 'dresses', 'women', 'midi-dress', 1950, ['Garden green', '#2f5a45', 'green'], 'Silk georgette', XS, ['romantic', 'boho', 'classic'], ['date', 'wedding', 'vacation'], 'A fluid silk midi printed with a hand-painted garden, with a tie neck and a swinging skirt.', { pattern: 'floral', accent: '#e8a0b0', garment: full }),
  make(G, 'giardino-tweed-jacket', 'Bouclé Tweed Jacket', 'outerwear', 'women', 'blazer', 2350, ['Cream / green', '#e7dcc4', 'white'], 'Wool bouclé tweed', XS, ['classic', 'glam'], ['work', 'evening', 'wedding'], 'A boxy tweed jacket woven with green and gold threads, trimmed in braid with gilt buttons.', { pattern: 'houndstooth', accent: '#1f4d3a', garment: up }),
  make(G, 'giardino-top-handle', 'Garden Top-handle Bag', 'bags', 'women', 'top-handle', 2600, ['Garden green', '#1f4d3a', 'green'], 'Polished calf leather, gold-plated hardware', ONE, ['classic', 'glam'], ['evening', 'work', 'date'], 'A structured top-handle in garden green calf, with a red-and-green web strap.', { accent: '#d9b77e' }),
  make(G, 'giardino-knit', 'Garden Stripe Knit', 'tops', 'unisex', 'knit', 890, ['Cream / green', '#efe6d0', 'white'], 'Merino wool knit', MS, ['classic', 'street', 'boho'], ['casual', 'work', 'vacation'], 'A soft merino sweater with a green and red heritage stripe at the chest.', { pattern: 'heritage', accent: '#1f4d3a', garment: up }),
  make(G, 'giardino-slide', 'Web-strap Slide', 'shoes', 'women', 'slide-band', 560, ['Garden green', '#1f4d3a', 'green'], 'Leather', SHOE_W, ['classic', 'street', 'minimal'], ['casual', 'vacation'], 'A leather slide in garden green, with two red web stripes across the strap.', { accent: '#9b1c2e', sole: '#e2d6bb', insole: '#e7dcc4' }),
];

/** Short specification lines by product type: a sense of size and make. Demo values for illustrated products. */
export function specsFor(p: Product): string[] {
  const lines: string[] = [`Material: ${p.material}`];
  if (p.custom) return [...lines, `Sizes: ${p.sizes.join(', ')}`];
  const by: Partial<Record<GarmentKind, string>> = {
    tote: 'Approx. 34 × 28 × 14 cm · fits a 13" laptop',
    'top-handle': 'Approx. 25 × 19 × 12 cm · detachable strap',
    crossbody: 'Approx. 22 × 16 × 7 cm · adjustable strap',
    backpack: 'Approx. 42 × 30 × 14 cm · padded laptop sleeve',
    duffel: 'Approx. 50 × 28 × 24 cm · shoulder strap',
    trunk: 'Approx. 55 × 38 × 22 cm · two locks, brass corners',
    briefcase: 'Approx. 40 × 30 × 8 cm · two compartments',
    clutch: 'Approx. 26 × 15 × 3 cm · chain tucks inside',
    wallet: 'Approx. 11 × 8.5 cm · card slots and a note pocket',
    watch: 'Sapphire glass · water-resistant to 50 m · automatic movement',
    belt: 'Width 3.5 cm · five holes',
    pendant: 'Pendant 2.4 cm · chain 46 cm with a lobster clasp',
    bangle: 'Inner diameter 6 cm · hand-polished finish',
    ring: 'Band width 4 mm · hand-polished finish',
    sunglasses: 'Lens width 54 mm · UV400 protection · case included',
    scarf: '90 × 90 cm · hand-rolled edges',
  };
  const kind = by[p.art];
  if (kind) lines.push(kind);
  else if (p.category === 'shoes') lines.push('Leather-lined · cushioned insole · true to size');
  else lines.push('Relaxed fit · see the size chart · model not shown');
  if (!p.image) lines.push('Original Empire Atelier render, not a photograph');
  return lines;
}

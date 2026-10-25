/**
 * Outfit suggestions: builds complete looks (a dress, or a top and bottom, plus shoes, a bag and
 * sometimes a layer) from the catalog, scored against the shopper's style preferences, kept
 * within their budget and colour-checked so the pieces go together.
 */
import {
  COLORS, inDepartment, OCCASIONS, PRODUCTS, STYLES,
  type ColorFamily, type Department, type Occasion, type Product, type Style,
} from './catalog.ts';

export type Preferences = {
  /** Womenswear, menswear or both. */
  department: Department;
  styles: Style[];
  colors: ColorFamily[];
  occasions: Occasion[];
  /** Price range per item, in dollars. */
  budget: [number, number];
};

export type Outfit = {
  id: string;
  name: string;
  itemIds: string[];
  occasion: Occasion;
  gender: 'women' | 'men';
  total: number;
  reasons: string[];
  curated?: boolean;
};

const NEUTRAL: ColorFamily[] = ['neutral', 'white', 'black', 'gold'];
const CLASHES: [ColorFamily, ColorFamily][] = [['red', 'green'], ['red', 'blue'], ['green', 'blue']];

/** True when every chromatic colour in the look sits well with the others. */
export function colorsWork(items: Product[]) {
  const chroma = [...new Set(items.map((p) => p.color.family).filter((f) => !NEUTRAL.includes(f)))];
  if (chroma.length > 2) return false;
  return !CLASHES.some(([a, b]) => chroma.includes(a) && chroma.includes(b));
}

export function scoreProduct(p: Product, prefs: Preferences, occasion?: Occasion) {
  let s = 0;
  s += p.styles.filter((x) => prefs.styles.includes(x)).length * 3;
  if (prefs.colors.includes(p.color.family)) s += 3;
  s += p.occasions.filter((x) => prefs.occasions.includes(x)).length;
  if (occasion && p.occasions.includes(occasion)) s += 2;
  return s;
}

export const inBudget = (p: Product, prefs: Preferences) => p.price >= prefs.budget[0] && p.price <= prefs.budget[1];

const label = <T extends string>(list: { key: T; label: string }[], k: T) => list.find((x) => x.key === k)?.label ?? k;

const NAMES: Record<Occasion, string[]> = {
  work: ['Boardroom', 'Nine to Five', 'Corner Office'],
  casual: ['Off Duty', 'Sunday Stroll', 'Brunch Club'],
  date: ['Date Night', 'Candlelight', 'First Look'],
  evening: ['After Dark', 'Velvet Hour', 'Gala'],
  wedding: ['Wedding Guest', 'Garden Vows', 'Toast of the Party'],
  vacation: ['Getaway', 'Riviera', 'Golden Hour'],
};

function nameFor(base: Product, occasion: Occasion, i: number) {
  const tone = base.name.split(' ')[0];
  const names = NAMES[occasion];
  return `${tone} ${names[i % names.length]}`;
}

/**
 * Suggests up to `limit` looks. With an occasion, every piece must suit it; otherwise each look
 * takes the occasion its pieces share best with the shopper's favourites.
 */
export function suggestOutfits(prefs: Preferences, opts: { occasion?: Occasion; maxTotal?: number; limit?: number; include?: string } = {}): Outfit[] {
  const { limit = 8 } = opts;
  const occasions = opts.occasion ? [opts.occasion] : prefs.occasions.length ? prefs.occasions : OCCASIONS.map((o) => o.key);
  const included = opts.include ? PRODUCTS.find((p) => p.id === opts.include) : undefined;
  // Looks are never mixed across departments; "all" builds women's and men's looks side by side.
  const genders = (['women', 'men'] as const).filter(
    (g) => inDepartment({ gender: g } as Product, prefs.department ?? 'all') && (!included || included.gender === 'unisex' || included.gender === g),
  );
  const results: (Outfit & { score: number })[] = [];

  for (const gender of genders)
  for (const occasion of occasions) {
    const pool = PRODUCTS.filter((p) => (p.gender === gender || p.gender === 'unisex') && p.occasions.includes(occasion) && (inBudget(p, prefs) || p.id === opts.include));
    const by = (c: Product['category']) =>
      pool.filter((p) => p.category === c).sort((a, b) => scoreProduct(b, prefs, occasion) - scoreProduct(a, prefs, occasion));
    const dresses = [...by('dresses'), ...by('sets')], tops = by('tops'), bottoms = by('bottoms');
    const outer = by('outerwear'), shoes = by('shoes');
    // Menswear often goes without a bag (evenings, weddings), so a bag is optional when none suits.
    const bags: (Product | undefined)[] = by('bags').length ? by('bags') : gender === 'men' ? [undefined] : [];
    if (!shoes.length || !bags.length) continue;

    const bases: Product[][] = [...dresses.map((d) => [d])];
    for (const t of tops) for (const b of bottoms) bases.push([t, b]);

    for (const base of bases) {
      const included = !opts.include || base.some((p) => p.id === opts.include);
      // Tailoring is part of a man's evening and wedding look, so jackets layer there too.
      const layering = occasion === 'work' || occasion === 'casual' || (gender === 'men' && base[0].category !== 'sets');
      const layers: (Product | undefined)[] = [undefined, ...(layering ? outer : [])];
      let best: { items: Product[]; score: number } | undefined;
      for (const layer of layers) {
        for (const shoe of shoes) {
          for (const bag of bags) {
            const items = [...base, ...(layer ? [layer] : []), shoe, ...(bag ? [bag] : [])];
            if (!included && !items.some((p) => p.id === opts.include)) continue;
            const total = items.reduce((s, p) => s + p.price, 0);
            if (opts.maxTotal && total > opts.maxTotal) continue;
            if (!colorsWork(items)) continue;
            const shared = STYLES.filter((st) => items.filter((p) => p.styles.includes(st.key)).length >= items.length - 1).length;
            const score = items.reduce((s, p) => s + scoreProduct(p, prefs, occasion), 0) / items.length + shared * 1.5;
            if (!best || score > best.score) best = { items, score };
          }
        }
      }
      if (!best) continue;
      const items = best.items;
      const total = items.reduce((s, p) => s + p.price, 0);
      const styleHits = prefs.styles.filter((st) => items.filter((p) => p.styles.includes(st)).length >= Math.ceil(items.length / 2));
      const colorHits = prefs.colors.filter((c) => items.some((p) => p.color.family === c));
      const reasons = [
        styleHits.length ? `Your ${styleHits.map((s) => label(STYLES, s)).join(' & ')} style` : `${label(STYLES, items[0].styles[0])} mood`,
        colorHits.length ? `${colorHits.map((c) => label(COLORS, c)).join(', ')}` : 'Colours that go together',
        label(OCCASIONS, occasion),
      ];
      results.push({
        id: `${occasion}:${items.map((p) => p.id).join('+')}`,
        name: '',
        itemIds: items.map((p) => p.id),
        occasion,
        gender,
        total,
        reasons,
        score: best.score,
      });
    }
  }

  // Best first, with variety: a piece can anchor at most one look, and shoes/bags repeat sparingly.
  results.sort((a, b) => b.score - a.score || a.total - b.total);
  const picked: (typeof results)[number][] = [];
  const used = new Map<string, number>();
  // Keys are product ids (times used) and `occasion:id` (already anchors a look for that occasion).
  for (const r of results) {
    const [first, second] = r.itemIds;
    const baseIds = PRODUCTS.find((p) => p.id === second)?.category === 'bottoms' ? [first, second] : [first];
    if (baseIds.some((id) => used.has(`${r.occasion}:${id}`) || (used.get(id) ?? 0) >= 2)) continue;
    if (r.itemIds.filter((id) => (used.get(id) ?? 0) >= 3).length > 1) continue;
    r.itemIds.forEach((id) => used.set(id, (used.get(id) ?? 0) + 1));
    baseIds.forEach((id) => used.set(`${r.occasion}:${id}`, 1));
    picked.push(r);
    if (picked.length >= limit) break;
  }
  return picked.map(({ score: _score, ...o }, i) => ({ ...o, name: nameFor(PRODUCTS.find((p) => p.id === o.itemIds[0])!, o.occasion, i) }));
}

/** Hand-picked looks from the Empire Atelier editors. */
export const EDITORS_LOOKS: Outfit[] = ([
  { id: 'ed:garden', name: 'Lagos Garden Wedding', itemIds: ['peony-midi', 'blush-heel', 'gold-clutch'], occasion: 'wedding', reasons: ['Romantic', 'Florals and blush', 'Daytime weddings'] },
  { id: 'ed:boardroom', name: 'Boardroom Blush', itemIds: ['rose-blouse', 'tailored-trouser', 'blush-blazer', 'nude-pump', 'camel-tote'], occasion: 'work', reasons: ['Classic tailoring', 'Soft pink with oat', 'Office to after-work'] },
  { id: 'ed:lisbon', name: 'Weekend in Lisbon', itemIds: ['striped-shirt', 'blue-jeans', 'white-sneaker', 'camel-tote'], occasion: 'vacation', reasons: ['Easy and polished', 'Denim and stripes', 'City breaks'] },
  { id: 'ed:velvet', name: 'Velvet Hour', itemIds: ['empress-gown', 'gold-heel', 'gold-clutch'], occasion: 'evening', reasons: ['Glamour', 'Wine and gold', 'Black-tie'] },
  { id: 'ed:goldrush', name: 'Gold Rush', itemIds: ['gilded-mini', 'gold-heel', 'black-clutch'], occasion: 'evening', reasons: ['Party-ready', 'Champagne shine', 'Celebrations'] },
  { id: 'ed:brunch', name: 'Pink Brunch Club', itemIds: ['blush-knit', 'ivory-skirt', 'blush-sneaker', 'blush-tote'], occasion: 'casual', reasons: ['Soft and sweet', 'Blush and ivory', 'Weekend plans'] },
  { id: 'ed:owambe', name: 'Lagos Owambe', itemIds: ['ivory-agbada', 'espresso-loafer'], occasion: 'wedding', reasons: ['Native glamour', 'Ivory and espresso', 'Weddings and celebrations'] },
  { id: 'ed:monday', name: 'Monday Boardroom', itemIds: ['oxford-white', 'navy-suit-trouser', 'navy-suit-jacket', 'black-oxford', 'espresso-briefcase'], occasion: 'work', reasons: ['Sharp tailoring', 'Navy and white', 'Big meetings'] },
  { id: 'ed:offduty', name: 'Off-Duty Weekend', itemIds: ['white-tee', 'indigo-jeans', 'black-bomber', 'white-sneaker', 'canvas-backpack'], occasion: 'casual', reasons: ['Easy street style', 'Denim and black', 'Weekend plans'] },
  { id: 'ed:resort', name: 'Resort Linen', itemIds: ['sand-linen-shirt', 'sand-shorts', 'espresso-loafer'], occasion: 'vacation', reasons: ['Relaxed', 'Sand and espresso', 'Beach and city breaks'] },
  { id: 'ed:dinner', name: 'Dinner in Burgundy', itemIds: ['wine-senator', 'espresso-loafer'], occasion: 'date', reasons: ['Bold and refined', 'Burgundy and brown', 'Evenings out'] },
] satisfies Omit<Outfit, 'total' | 'gender'>[]).map((o) => ({
  ...o,
  curated: true,
  gender: PRODUCTS.find((p) => p.id === o.itemIds[0])?.gender === 'men' ? 'men' : 'women',
  total: o.itemIds.reduce((s, id) => s + (PRODUCTS.find((p) => p.id === id)?.price ?? 0), 0),
}));

/** Editors' looks in the shopper's department. */
export const editorsLooks = (d: Department) => EDITORS_LOOKS.filter((o) => d === 'all' || o.gender === d);

/**
 * The AI stylist's prompt, and the rule-based stylist used when no Claude key is configured
 * (and in the hosted preview), so the chat always answers. Shared by the server and the browser.
 */
import {
  COLORS, formatPrice, OCCASIONS, PRODUCTS, productById, STYLES,
  type ColorFamily, type Department, type Occasion, type Style,
} from './catalog.ts';
import { suggestOutfits, type Preferences } from './outfits.ts';

export type ChatTurn = { role: 'user' | 'assistant'; text: string };

export type StylistContext = {
  name?: string;
  prefs: Preferences;
  favorites: string[];
  /** Saved look names with their pieces. */
  looks: { name: string; itemIds: string[] }[];
  /** Upcoming planner days, e.g. "Mon 27 Oct: Client pitch (work)". */
  plan: string[];
};

const catalogText = PRODUCTS.map(
  (p) =>
    `- [[${p.id}]] ${p.name}: ${p.gender === 'unisex' ? 'unisex' : p.gender === 'men' ? "men's" : "women's"} ${p.category}, ${formatPrice(p.price)}, ${p.color.name}, ${p.styles.join('/')}; for ${p.occasions.join(', ')}. ${p.description}`,
).join('\n');

export const SYSTEM = `You are the personal stylist inside Empire Atelier, a fashion app for men's and women's clothing with virtual try-on.
Speak like a warm, confident atelier stylist: specific, practical, never pushy. Keep replies under 130 words unless asked for more.
Only recommend pieces from the catalogue below. Write a piece's id in double brackets, e.g. [[oxford-white]], each time you recommend it, so the app can show it as a card the client can try on and buy. Suggest complete outfits (top and bottom, or a dress/kaftan set, plus shoes, and a bag or layer where it helps) and keep within any budget the client gives; state the outfit total.
Never mix women's and men's pieces in one outfit unless the client asks. Use the client's department, styles, colours and budget when known. If they ask about something outside fashion, steer back kindly.
Prices are in US dollars.

Catalogue:
${catalogText}`;

const label = <T extends string>(list: { key: T; label: string }[], k: T) => list.find((x) => x.key === k)?.label ?? k;

export function contextNote(ctx: StylistContext) {
  const { prefs } = ctx;
  const parts: string[] = [];
  if (ctx.name) parts.push(`Client name: ${ctx.name}.`);
  parts.push(`Shopping: ${prefs.department === 'all' ? "women's and men's" : prefs.department === 'men' ? "menswear" : 'womenswear'}.`);
  if (prefs.styles.length) parts.push(`Styles: ${prefs.styles.map((s) => label(STYLES, s)).join(', ')}.`);
  if (prefs.colors.length) parts.push(`Colours: ${prefs.colors.map((c) => label(COLORS, c)).join(', ')}.`);
  if (prefs.occasions.length) parts.push(`Dresses for: ${prefs.occasions.map((o) => label(OCCASIONS, o)).join(', ')}.`);
  parts.push(`Budget per piece: ${formatPrice(prefs.budget[0])} to ${formatPrice(prefs.budget[1])}.`);
  const favs = ctx.favorites.map((id) => productById(id)?.name).filter(Boolean);
  if (favs.length) parts.push(`Favourite pieces: ${favs.join(', ')}.`);
  if (ctx.looks.length) parts.push(`Saved looks: ${ctx.looks.slice(0, 5).map((l) => `${l.name} (${l.itemIds.join(', ')})`).join('; ')}.`);
  if (ctx.plan.length) parts.push(`Coming up in the planner: ${ctx.plan.join('; ')}.`);
  return parts.join(' ');
}

const OCCASION_WORDS: [RegExp, Occasion][] = [
  [/wedding|owambe|ceremony|engagement|bride|groom|reception/, 'wedding'],
  [/office|work|meeting|interview|pitch|conference|boardroom|presentation/, 'work'],
  [/date|dinner|anniversary|romantic/, 'date'],
  [/party|gala|evening|night out|club|birthday|cocktail|concert/, 'evening'],
  [/vacation|holiday|beach|trip|travel|resort|getaway/, 'vacation'],
  [/casual|weekend|brunch|errand|everyday|hangout|church|chill/, 'casual'],
];
const COLOR_WORDS: [RegExp, ColorFamily][] = [
  [/pink|blush|rose/, 'pink'], [/neutral|beige|camel|brown|\btan\b|sand|nude|espresso|earth/, 'neutral'], [/white|ivory|cream/, 'white'],
  [/black|charcoal/, 'black'], [/red|wine|burgundy/, 'red'], [/blue|navy|denim|indigo/, 'blue'], [/green|sage|olive/, 'green'], [/gold|metallic/, 'gold'],
];
const STYLE_WORDS: [RegExp, Style][] = [
  [/romantic|feminine|soft/, 'romantic'], [/minimal|clean|simple/, 'minimal'], [/classic|timeless|tailored|formal|smart/, 'classic'],
  [/glam|sparkle|shine|luxur/, 'glam'], [/boho|native|traditional|kaftan|agbada|print/, 'boho'], [/street|sneaker|urban|relaxed/, 'street'],
];

/** Finds the department a message asks about, if any. */
export function departmentInText(m: string): Department | undefined {
  if (/\b(men|man|male|guy|groom|husband|boyfriend|him|his|gentleman|menswear|agbada|senator)\b/.test(m)) return 'men';
  if (/\b(women|woman|female|lady|ladies|bride|wife|girlfriend|her|she|womenswear|gown|skirt)\b/.test(m)) return 'women';
  return undefined;
}

/** Rule-based stylist: reads occasion, budget, colours and style from the message and builds looks. */
export function offlineStylist(message: string, ctx: StylistContext): string {
  const m = message.toLowerCase();
  const occasion = OCCASION_WORDS.find(([re]) => re.test(m))?.[1];
  const colors = COLOR_WORDS.filter(([re]) => re.test(m)).map(([, c]) => c);
  const styles = STYLE_WORDS.filter(([re]) => re.test(m)).map(([, s]) => s);
  const money = /(?:under|below|less than|max(?:imum)?|budget(?: of| is)?|within|up to)\s*(?:\$|₦|n)?\s*([\d,]{2,7})/.exec(m) ?? /\$\s*([\d,]{2,7})/.exec(m);
  const maxTotal = money ? Number(money[1].replace(/,/g, '')) : undefined;
  const department = departmentInText(m) ?? ctx.prefs.department;
  const mentioned = PRODUCTS.find((p) => m.includes(p.name.toLowerCase()) || m.includes(p.id));

  const prefs: Preferences = {
    ...ctx.prefs,
    department,
    styles: styles.length ? styles : ctx.prefs.styles,
    colors: colors.length ? colors : ctx.prefs.colors,
  };
  let looks = suggestOutfits(prefs, { occasion, maxTotal, limit: 3, include: mentioned?.id });
  if (!looks.length && maxTotal) looks = suggestOutfits({ ...prefs, budget: [0, 10_000] }, { occasion, maxTotal, limit: 3 });
  if (!looks.length) looks = suggestOutfits({ ...prefs, colors: [], styles: [] }, { occasion, limit: 3 });

  const hello = ctx.name ? `${ctx.name}, ` : '';
  if (!looks.length) {
    return `${hello}I couldn't build a complete look inside those limits. Try a slightly higher budget, or tell me the occasion (work, a wedding, date night, a trip) and I'll put something together.`;
  }
  const look = looks[0];
  const why = [
    occasion ? `for ${label(OCCASIONS, occasion).toLowerCase()}` : `for ${label(OCCASIONS, look.occasion).toLowerCase()}`,
    colors.length ? `in ${colors.map((c) => label(COLORS, c).toLowerCase()).join(' and ')}` : '',
    maxTotal ? `under ${formatPrice(maxTotal)}` : '',
  ].filter(Boolean).join(' ');
  const lead = mentioned ? `here's how I'd style the ${mentioned.name} ${why}:` : `here's the look I'd put you in ${why}:`;
  const intro = hello ? `${hello}${lead}` : lead[0].toUpperCase() + lead.slice(1);
  const pieces = look.itemIds.map((id) => `[[${id}]]`).join(' + ');
  // The alternative is named, not linked, so the cards and "Try the look on" stay one outfit.
  const alt = looks[1] ? `\n\nWant a different mood? I'd also love ${looks[1].itemIds.map((id) => productById(id)!.name).join(' with ')} (${formatPrice(looks[1].total)}). Just ask.` : '';
  return `${intro}\n\n${pieces}\n\nThe whole outfit comes to ${formatPrice(look.total)} and the colours are checked to work together. Tap **Try the look on** to see it on your photo.${alt}`;
}

/** Product ids in a stylist reply, in order, without repeats. */
export const idsInReply = (text: string) => [...new Set([...text.matchAll(/\[\[([a-z0-9-]+)\]\]/g)].map((m) => m[1]).filter((id) => productById(id)))];

/** Rebuilds a context sent by the browser, keeping only known values. */
export function cleanContext(x: any): StylistContext {
  const strs = (v: unknown, max: number) => (Array.isArray(v) ? v.filter((s) => typeof s === 'string').slice(0, max).map((s: string) => s.slice(0, 120)) : []);
  const pick = <T extends string>(v: unknown, keys: T[]) => strs(v, 20).filter((s): s is T => keys.includes(s as T));
  const p = x?.prefs ?? {};
  const budget: [number, number] = Array.isArray(p.budget) && p.budget.every((n: unknown) => typeof n === 'number') ? [p.budget[0], p.budget[1]] : [0, 10_000];
  return {
    name: typeof x?.name === 'string' ? x.name.slice(0, 40) : undefined,
    prefs: {
      department: p.department === 'men' || p.department === 'women' ? p.department : 'all',
      styles: pick(p.styles, STYLES.map((s) => s.key)),
      colors: pick(p.colors, COLORS.map((c) => c.key)),
      occasions: pick(p.occasions, OCCASIONS.map((o) => o.key)),
      budget,
    },
    favorites: strs(x?.favorites, 30).filter((id) => productById(id)),
    looks: (Array.isArray(x?.looks) ? x.looks : []).slice(0, 8).map((l: any) => ({ name: String(l?.name ?? '').slice(0, 60), itemIds: strs(l?.itemIds, 8) })),
    plan: strs(x?.plan, 14),
  };
}

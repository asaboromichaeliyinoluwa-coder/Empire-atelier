/**
 * Smart outfit planner: a week of looks, one per day, matched to what's on that day, inside the
 * shopper's budget and without wearing the same main piece twice in a week.
 */
import { productById, type Occasion } from '../shared/catalog.ts';
import { suggestOutfits, type Outfit, type Preferences } from '../shared/outfits.ts';
import type { PlanDay } from './store.tsx';

const pad = (n: number) => String(n).padStart(2, '0');
export const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromKey = (k: string) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** Monday of the week containing `d`, `offset` weeks later. */
export function weekStart(d: Date, offset = 0) {
  const s = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  s.setDate(s.getDate() - ((s.getDay() + 6) % 7) + offset * 7);
  return s;
}

export const weekDays = (start: Date) =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

/** What a day usually holds when the shopper hasn't said: weekdays at work, weekends off duty. */
export const defaultOccasion = (d: Date): Occasion => (d.getDay() === 0 || d.getDay() === 6 ? 'casual' : 'work');

/** The main pieces of a look (dress or set, or top and bottom); these shouldn't repeat in a week. */
const mainPieces = (itemIds: string[]) =>
  itemIds.filter((id) => ['dresses', 'sets', 'tops', 'bottoms'].includes(productById(id)?.category ?? ''));

/**
 * Picks a look for each day. Days that already have a look keep it (`keep`), and every new look
 * avoids main pieces already worn that week. `skip` passes over the first n candidates, for "swap".
 */
export function planLooks(
  prefs: Preferences,
  days: { key: string; occasion: Occasion; current?: PlanDay; skip?: number }[],
  opts: { keep?: boolean; maxTotal?: number } = {},
): Record<string, Outfit | undefined> {
  const worn = new Set<string>();
  if (opts.keep) days.forEach((d) => d.current?.itemIds && mainPieces(d.current.itemIds).forEach((id) => worn.add(id)));
  const cache = new Map<Occasion, Outfit[]>();
  const out: Record<string, Outfit | undefined> = {};
  for (const d of days) {
    if (opts.keep && d.current?.itemIds?.length) continue;
    if (!cache.has(d.occasion)) cache.set(d.occasion, suggestOutfits(prefs, { occasion: d.occasion, maxTotal: opts.maxTotal, limit: 24 }));
    const options = cache.get(d.occasion)!;
    const fresh = options.filter((o) => !mainPieces(o.itemIds).some((id) => worn.has(id)));
    const pool = fresh.length ? fresh : options;
    const pick = pool.length ? pool[(d.skip ?? 0) % pool.length] : undefined;
    if (pick) mainPieces(pick.itemIds).forEach((id) => worn.add(id));
    out[d.key] = pick;
  }
  return out;
}

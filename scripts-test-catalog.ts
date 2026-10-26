/** Catalogue checks: `npm test`. Fails when a product is malformed or a drawing breaks. */
import { CATEGORIES, PRODUCTS, SELLERS, NEW_IN } from './src/shared/catalog.ts';
import { finishFor, garmentSvg } from './src/shared/garments.ts';
import { HOUSES, specsFor } from './src/shared/luxury.ts';

const errors: string[] = [];
const check = (ok: boolean, msg: string) => { if (!ok) errors.push(msg); };

const ids = new Set<string>();
for (const p of PRODUCTS) {
  check(!ids.has(p.id), `duplicate product id ${p.id}`);
  ids.add(p.id);
  check(!!SELLERS.find((s) => s.id === p.sellerId), `${p.id}: unknown seller ${p.sellerId}`);
  check(!!CATEGORIES.find((c) => c.key === p.category), `${p.id}: unknown category ${p.category}`);
  check(p.sizes.length > 0 && p.price > 0 && p.description.length > 30, `${p.id}: missing size, price or description`);
  check(!p.was || p.was > p.price, `${p.id}: sale price must be below the original`);
  check(/^#[0-9a-f]{6}$/i.test(p.color.hex), `${p.id}: colour must be a #rrggbb hex`);
  for (const view of ['front', 'detail', 'back', 'swatch'] as const) {
    const svg = garmentSvg(p.art, p.color.hex, p.pattern, p.accent, finishFor(p.material), { sole: p.sole, insole: p.insole, view });
    check(svg.startsWith('<svg') && !svg.includes('undefined') && !svg.includes('NaN'), `${p.id}: ${view} drawing is broken`);
  }
  check(specsFor(p).length >= 2, `${p.id}: no specifications`);
}
for (const id of NEW_IN) check(ids.has(id), `New in lists a missing product: ${id}`);
for (const h of HOUSES) check(PRODUCTS.filter((p) => p.sellerId === h.id).length >= 4, `${h.name} has fewer than 4 products`);
for (const c of CATEGORIES) check(PRODUCTS.some((p) => p.category === c.key), `category ${c.label} is empty`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`ok: ${PRODUCTS.length} products, ${SELLERS.length} sellers, ${HOUSES.length} luxury houses, 4 views each`);

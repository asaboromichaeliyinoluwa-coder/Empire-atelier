import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { IconClose, IconFilter } from '../components/icons.tsx';
import { Empty, PriceRange, ProductCard } from '../components/ui.tsx';
import { useApp } from '../lib/store.tsx';
import { DepartmentSwitch } from '../components/Layout.tsx';
import {
  CATEGORIES, inDepartment, MAISON_ID, MAISON_NOTE, NEW_IN, PRICE_MAX, PRODUCTS, SELLERS, STYLES,
  type Category, type ColorFamily, type Occasion, type Style,
} from '../shared/catalog.ts';
import { HOUSES, HOUSE_IDS } from '../shared/luxury.ts';
import { scoreProduct } from '../shared/outfits.ts';
import { BudgetCards, CategoryCards, ColourCards, OccasionCards } from '../components/Options.tsx';

type Sort = 'match' | 'low' | 'high' | 'sale' | 'new' | 'az';
const PRESETS = [50, 100, 150, 250];

function toggle<T>(list: T[], v: T) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

/** Header links (New in, Shoes, Sale, search…) change the query; each one starts a fresh set of filters. */
export default function ShopRoute() {
  const [params] = useSearchParams();
  return <Shop key={params.toString()} />;
}

function Shop() {
  const { prefs, styled, setPrefs } = useApp();
  const [params, setParams] = useSearchParams();
  const initialMax = Number(params.get('max')) || prefs.budget[1];
  const [price, setPrice] = useState<[number, number]>([params.get('max') ? 0 : prefs.budget[0], Math.min(initialMax, PRICE_MAX)]);
  const [cats, setCats] = useState<Category[]>(params.get('category') ? [params.get('category') as Category] : []);
  const [styles, setStyles] = useState<Style[]>([]);
  const [colors, setColors] = useState<ColorFamily[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [sellers, setSellers] = useState<string[]>(params.has('luxury') ? HOUSE_IDS : params.get('seller') ? [params.get('seller')!] : []);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 350); return () => clearTimeout(t); }, []);
  const [tryOnOnly, setTryOnOnly] = useState(false);
  const [sort, setSort] = useState<Sort>(styled ? 'match' : params.has('luxury') ? 'new' : 'low');
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [newIn, setNewIn] = useState(params.has('new'));
  const [saleOnly, setSaleOnly] = useState(params.has('sale'));
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = PRODUCTS.filter(
      (p) =>
        inDepartment(p, prefs.department) &&
        p.price >= price[0] && p.price <= price[1] &&
        (!cats.length || cats.includes(p.category)) &&
        (!styles.length || p.styles.some((s) => styles.includes(s))) &&
        (!colors.length || colors.includes(p.color.family)) &&
        (!occasions.length || p.occasions.some((o) => occasions.includes(o))) &&
        (!sellers.length || sellers.includes(p.sellerId)) &&
        (!tryOnOnly || !!p.garment) &&
        (!newIn || NEW_IN.includes(p.id)) &&
        (!saleOnly || !!p.was) &&
        (!q || `${p.name} ${p.color.name} ${p.material} ${p.category} ${p.gender}`.toLowerCase().includes(q)),
    );
    const by: Record<Sort, (a: (typeof list)[number], b: (typeof list)[number]) => number> = {
      match: (a, b) => scoreProduct(b, prefs) - scoreProduct(a, prefs) || a.price - b.price,
      low: (a, b) => a.price - b.price,
      high: (a, b) => b.price - a.price,
      sale: (a, b) => Number(!!b.was) - Number(!!a.was) || a.price - b.price,
      new: (a, b) => (NEW_IN.indexOf(a.id) + 1 || 999) - (NEW_IN.indexOf(b.id) + 1 || 999) || a.price - b.price,
      az: (a, b) => a.name.localeCompare(b.name),
    };
    const cmp = newIn && sort === 'low' ? (a: (typeof list)[number], b: (typeof list)[number]) => NEW_IN.indexOf(a.id) - NEW_IN.indexOf(b.id) : by[sort];
    // the owner's own real products come first, then the chosen order
    return list.sort((a, b) => Number(!!b.custom) - Number(!!a.custom) || cmp(a, b));
  }, [price, cats, styles, colors, occasions, sellers, tryOnOnly, newIn, saleOnly, sort, query, prefs]);

  const styleList = STYLES.filter((st) => prefs.department !== 'men' || !st.women);
  const activeCount = cats.length + styles.length + colors.length + occasions.length + sellers.length + Number(tryOnOnly) + Number(newIn) + Number(saleOnly) + Number(price[0] > 0 || price[1] < PRICE_MAX);
  const clear = () => {
    setCats([]); setStyles([]); setColors([]); setOccasions([]); setSellers([]); setTryOnOnly(false); setNewIn(false); setSaleOnly(false); setQuery(''); setPrice([0, PRICE_MAX]);
    setParams({});
  };

  const catLabel = cats.length === 1 ? CATEGORIES.find((c) => c.key === cats[0])?.label : undefined;
  const luxuryOnly = sellers.length > 1 && sellers.every((x) => HOUSE_IDS.includes(x));
  const sellerName = sellers.length === 1 ? SELLERS.find((x) => x.id === sellers[0])?.name : undefined;
  const title = luxuryOnly && !cats.length ? 'The luxury houses' : sellerName && !cats.length ? sellerName : saleOnly ? 'Sale' : newIn ? 'New in' : catLabel ?? (query && params.get('q') ? `Results for “${query}”` : 'Shop the atelier');

  const filters = (
    <div className="filters stack gap-24">
      <div className="row between">
        <h2 className="h3">Filter</h2>
        <div className="row gap-8">
          {activeCount > 0 && <button className="link small" onClick={clear}>Clear all</button>}
          <button className="icon-btn only-mobile" onClick={() => setOpen(false)} aria-label="Close filters"><IconClose size={18} /></button>
        </div>
      </div>

      <fieldset>
        <legend>Department</legend>
        <DepartmentSwitch />
      </fieldset>

      <fieldset>
        <legend>Budget per piece</legend>
        <PriceRange value={price} max={PRICE_MAX} onChange={setPrice} />
        <BudgetCards compact options={PRESETS} value={price[0] === 0 && PRESETS.includes(price[1]) ? price[1] : -1} onChange={(m) => setPrice([0, m])} count={(m) => PRODUCTS.filter((p) => p.price <= m && inDepartment(p, prefs.department)).length} />
        {(price[0] !== prefs.budget[0] || price[1] !== prefs.budget[1]) && (
          <button className="link small" onClick={() => setPrefs({ budget: price })}>Save as my budget</button>
        )}
      </fieldset>

      <fieldset>
        <legend>Category</legend>
        <CategoryCards value={cats} department={prefs.department} onToggle={(c) => setCats(toggle(cats, c))} />
      </fieldset>

      <fieldset>
        <legend>Colour</legend>
        <ColourCards compact value={colors} department={prefs.department} onToggle={(c) => setColors(toggle(colors, c))} />
      </fieldset>

      <fieldset>
        <legend>Style</legend>
        <div className="chips">
          {styleList.map((s) => (
            <button key={s.key} className={`chip ${styles.includes(s.key) ? 'on' : ''}`} onClick={() => setStyles(toggle(styles, s.key))}>{s.label}</button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Occasion</legend>
        <OccasionCards compact value={occasions} department={prefs.department} onToggle={(o) => o && setOccasions(toggle(occasions, o))} />
      </fieldset>

      {SELLERS.some((x) => HOUSE_IDS.includes(x.id)) && <fieldset>
        <legend>Luxury house</legend>
        <div className="house-list">
          {[...HOUSES, SELLERS.find((x) => x.id === MAISON_ID)!].filter(Boolean).map((h) => {
            const vibe = (h as { vibe?: string }).vibe ?? 'Monogram canvas & baroque silk';
            return (
              <button key={h.id} type="button" className={`house ${sellers.includes(h.id) ? 'on' : ''}`} aria-pressed={sellers.includes(h.id)} onClick={() => setSellers(toggle(sellers, h.id))}>
                <b>{h.name}</b><small>{vibe}</small>
              </button>
            );
          })}
        </div>
      </fieldset>}

      <fieldset>
        <legend>Boutique</legend>
        <div className="chips">
          {SELLERS.filter((s) => !HOUSE_IDS.includes(s.id)).map((s) => (
            <button key={s.id} className={`chip ${sellers.includes(s.id) ? 'on' : ''}`} onClick={() => setSellers(toggle(sellers, s.id))}>{s.name}</button>
          ))}
        </div>
      </fieldset>

      <label className="switch">
        <input type="checkbox" checked={newIn} onChange={(e) => setNewIn(e.target.checked)} />
        <span /> New in
      </label>
      <label className="switch">
        <input type="checkbox" checked={saleOnly} onChange={(e) => setSaleOnly(e.target.checked)} />
        <span /> On sale
      </label>
      <label className="switch">
        <input type="checkbox" checked={tryOnOnly} onChange={(e) => setTryOnOnly(e.target.checked)} />
        <span /> Virtual try-on available
      </label>
    </div>
  );

  return (
    <div className="container stack gap-24">
      <div className="page-head">
        <span className="eyebrow">The collection · {prefs.department === 'all' ? 'Women & men' : prefs.department === 'men' ? 'Menswear' : 'Womenswear'}</span>
        <h1 className="h1">{title}</h1>
        {sellers.some((x) => HOUSE_IDS.includes(x)) && <p className="maison-note small">{MAISON_NOTE}</p>}
      </div>

      <div className="shop">
        <aside className={`panel filter-panel ${open ? 'open' : ''}`}>{filters}</aside>
        <div className="stack gap-16">
          <div className="toolbar panel">
            <input className="search" placeholder="Search bags, watches, loafers, silk…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search" />
            <button className="btn ghost small only-mobile" onClick={() => setOpen(true)}>
              <IconFilter size={16} /> Filters{activeCount ? ` (${activeCount})` : ''}
            </button>
            <label className="sort">
              <span className="small muted">Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="match">Best for my style</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
                <option value="sale">On sale first</option>
                <option value="new">Newest</option>
                <option value="az">Name A to Z</option>
              </select>
            </label>
          </div>
          <div className="small muted" aria-live="polite">{loading ? 'Loading the collection…' : `${results.length} ${results.length === 1 ? 'piece' : 'pieces'}`}</div>
          {loading ? (
            <div className="product-grid" aria-busy="true">
              {Array.from({ length: 6 }, (_, i) => <div key={i} className="pcard-skel"><span /><i /><i /></div>)}
            </div>
          ) : results.length ? (
            <div className="product-grid">
              {results.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          ) : (
            <Empty title="Nothing matches those filters">
              <p className="small muted">Try a higher budget or fewer filters.</p>
              <button className="btn ghost small" onClick={clear}>Clear filters</button>
            </Empty>
          )}
        </div>
      </div>
    </div>
  );
}

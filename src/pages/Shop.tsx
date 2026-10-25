import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { IconClose, IconFilter } from '../components/icons.tsx';
import { Empty, PriceRange, ProductCard } from '../components/ui.tsx';
import { useApp } from '../lib/store.tsx';
import { DepartmentSwitch } from '../components/Layout.tsx';
import {
  CATEGORIES, COLORS, inDepartment, OCCASIONS, PRICE_MAX, PRODUCTS, SELLERS, STYLES,
  type Category, type ColorFamily, type Occasion, type Style,
} from '../shared/catalog.ts';
import { scoreProduct } from '../shared/outfits.ts';

type Sort = 'match' | 'low' | 'high' | 'sale';
const PRESETS = [50, 100, 150, 250];

function toggle<T>(list: T[], v: T) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

export default function Shop() {
  const { prefs, styled, setPrefs } = useApp();
  const [params, setParams] = useSearchParams();
  const initialMax = Number(params.get('max')) || prefs.budget[1];
  const [price, setPrice] = useState<[number, number]>([params.get('max') ? 0 : prefs.budget[0], Math.min(initialMax, PRICE_MAX)]);
  const [cats, setCats] = useState<Category[]>(params.get('category') ? [params.get('category') as Category] : []);
  const [styles, setStyles] = useState<Style[]>([]);
  const [colors, setColors] = useState<ColorFamily[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [sellers, setSellers] = useState<string[]>(params.get('seller') ? [params.get('seller')!] : []);
  const [tryOnOnly, setTryOnOnly] = useState(false);
  const [sort, setSort] = useState<Sort>(styled ? 'match' : 'low');
  const [query, setQuery] = useState('');
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
        (!q || `${p.name} ${p.color.name} ${p.material} ${p.category} ${p.gender}`.toLowerCase().includes(q)),
    );
    const by: Record<Sort, (a: (typeof list)[number], b: (typeof list)[number]) => number> = {
      match: (a, b) => scoreProduct(b, prefs) - scoreProduct(a, prefs) || a.price - b.price,
      low: (a, b) => a.price - b.price,
      high: (a, b) => b.price - a.price,
      sale: (a, b) => Number(!!b.was) - Number(!!a.was) || a.price - b.price,
    };
    return list.sort(by[sort]);
  }, [price, cats, styles, colors, occasions, sellers, tryOnOnly, sort, query, prefs]);

  const categories = CATEGORIES.filter((c) => PRODUCTS.some((p) => p.category === c.key && inDepartment(p, prefs.department)));
  const styleList = STYLES.filter((st) => prefs.department !== 'men' || !st.women);
  const activeCount = cats.length + styles.length + colors.length + occasions.length + sellers.length + Number(tryOnOnly) + Number(price[0] > 0 || price[1] < PRICE_MAX);
  const clear = () => {
    setCats([]); setStyles([]); setColors([]); setOccasions([]); setSellers([]); setTryOnOnly(false); setPrice([0, PRICE_MAX]);
    setParams({});
  };

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
        <div className="chips">
          {PRESETS.map((m) => (
            <button key={m} className={`chip ${price[0] === 0 && price[1] === m ? 'on' : ''}`} onClick={() => setPrice([0, m])}>Under ${m}</button>
          ))}
        </div>
        {(price[0] !== prefs.budget[0] || price[1] !== prefs.budget[1]) && (
          <button className="link small" onClick={() => setPrefs({ budget: price })}>Save as my budget</button>
        )}
      </fieldset>

      <fieldset>
        <legend>Category</legend>
        <div className="chips">
          {categories.map((c) => (
            <button key={c.key} className={`chip ${cats.includes(c.key) ? 'on' : ''}`} onClick={() => setCats(toggle(cats, c.key))}>{c.label}</button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Colour</legend>
        <div className="swatches">
          {COLORS.map((c) => (
            <button key={c.key} className={`swatch ${colors.includes(c.key) ? 'on' : ''}`} style={{ ['--sw' as string]: c.swatch }} onClick={() => setColors(toggle(colors, c.key))} aria-pressed={colors.includes(c.key)} title={c.label}>
              <span />
              <small>{c.label.split(' ')[0]}</small>
            </button>
          ))}
        </div>
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
        <div className="chips">
          {OCCASIONS.map((o) => (
            <button key={o.key} className={`chip ${occasions.includes(o.key) ? 'on' : ''}`} onClick={() => setOccasions(toggle(occasions, o.key))}>{o.label}</button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Seller</legend>
        <div className="chips">
          {SELLERS.map((s) => (
            <button key={s.id} className={`chip ${sellers.includes(s.id) ? 'on' : ''}`} onClick={() => setSellers(toggle(sellers, s.id))}>{s.name}</button>
          ))}
        </div>
      </fieldset>

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
        <h1 className="h1">Shop the atelier</h1>
      </div>

      <div className="shop">
        <aside className={`panel filter-panel ${open ? 'open' : ''}`}>{filters}</aside>
        <div className="stack gap-16">
          <div className="toolbar panel">
            <input className="search" placeholder="Search agbada, blazer, satin, linen…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search" />
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
              </select>
            </label>
          </div>
          <div className="small muted">{results.length} {results.length === 1 ? 'piece' : 'pieces'}</div>
          {results.length ? (
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

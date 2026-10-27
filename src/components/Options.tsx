import { motion } from 'framer-motion';

import { productArt } from '../lib/art.ts';
import {
  CATEGORIES, COLORS, inDepartment, OCCASIONS, PRODUCTS, productById,
  type Category, type ColorFamily, type Department, type Occasion,
} from '../shared/catalog.ts';
import { IconCheck } from './icons.tsx';

/**
 * Designed option cards: every choice in the app (department, occasion, budget, colour, category,
 * style) shown as a card with a picture, a title and a line of help, instead of a bare word.
 */
export function OptionCard({
  on, onClick, title, sub, visual, multi = true, className = '', compact,
}: {
  on: boolean; onClick: () => void; title: string; sub?: string; visual?: React.ReactNode;
  multi?: boolean; className?: string; compact?: boolean;
}) {
  return (
    <motion.button
      type="button"
      className={`ocard ${on ? 'on' : ''} ${compact ? 'compact' : ''} ${className}`}
      onClick={onClick}
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={on}
      whileTap={{ scale: 0.97 }}
      layout="position"
    >
      {visual && <span className="ocard-visual">{visual}</span>}
      <span className="ocard-text">
        <b>{title}</b>
        {sub && <small>{sub}</small>}
      </span>
      <span className="ocard-check" aria-hidden>{on && <IconCheck size={12} />}</span>
    </motion.button>
  );
}

const Art = ({ ids }: { ids: string[] }) => (
  <span className={`ocard-art n${ids.length}`}>
    {ids.map((id) => {
      const p = productById(id);
      return p ? <img key={id} src={p.image ?? productArt(p)} alt="" draggable={false} /> : null;
    })}
  </span>
);

const pick = (d: Department, women: string, men: string) => (d === 'men' ? [men] : d === 'women' ? [women] : [women, men]);

/* ---------- Department ---------- */

const DEPT = {
  women: { title: 'Women', sub: 'Dresses, tailoring, heels and bags', art: ['blush-slip'] },
  men: { title: 'Men', sub: 'Agbada, suiting, kaftans and loafers', art: ['navy-suit-jacket'] },
  all: { title: 'Both', sub: 'Everything in the atelier', art: ['blush-slip', 'navy-suit-jacket'] },
} as const;

export function DepartmentCards({ value, onChange, compact }: { value: Department; onChange: (d: Department) => void; compact?: boolean }) {
  return (
    <div className={`ocards ${compact ? 'row3' : 'cols3'}`} role="radiogroup" aria-label="Department">
      {(['women', 'men', 'all'] as const).map((k) => (
        <OptionCard key={k} multi={false} compact={compact} on={value === k} onClick={() => onChange(k)} title={DEPT[k].title} sub={compact ? undefined : DEPT[k].sub} visual={<Art ids={[...DEPT[k].art]} />} />
      ))}
    </div>
  );
}

/* ---------- Occasion ---------- */

const OCC: Record<Occasion, { sub: string; women: string; men: string }> = {
  work: { sub: 'Office, meetings, interviews', women: 'black-blazer', men: 'navy-suit-jacket' },
  casual: { sub: 'Weekends and errands', women: 'blue-jeans', men: 'white-tee' },
  date: { sub: 'Dinners and evenings for two', women: 'blush-slip', men: 'wine-senator' },
  evening: { sub: 'Parties and black-tie', women: 'gilded-mini', men: 'baroque-shirt' },
  wedding: { sub: 'Owambe, church and garden', women: 'peony-midi', men: 'ivory-agbada' },
  vacation: { sub: 'Beach and city breaks', women: 'kente-maxi', men: 'sand-linen-shirt' },
};

export function OccasionCards({
  value, onToggle, department, any, compact,
}: { value: Occasion[]; onToggle: (o: Occasion | undefined) => void; department: Department; any?: string; compact?: boolean }) {
  return (
    <div className={`ocards ${compact ? 'cols-auto-sm' : 'cols-auto'}`}>
      {any && <OptionCard compact={compact} multi={false} on={!value.length} onClick={() => onToggle(undefined)} title={any} sub={compact ? undefined : 'No preference'} visual={<span className="ocard-glyph">✦</span>} />}
      {OCCASIONS.map((o) => (
        <OptionCard key={o.key} compact={compact} on={value.includes(o.key)} onClick={() => onToggle(o.key)} title={o.label} sub={compact ? undefined : OCC[o.key].sub} visual={<Art ids={pick(department, OCC[o.key].women, OCC[o.key].men).slice(0, compact ? 1 : 2)} />} />
      ))}
    </div>
  );
}

/* ---------- Budget ---------- */

const TIERS = ['Everyday', 'Considered', 'Special', 'Investment', 'Luxe', 'Couture'];

/** Budget presets as tiered cards. 0 means no limit. */
export function BudgetCards({
  options, value, onChange, count, label = 'Under', compact,
}: { options: number[]; value: number; onChange: (n: number) => void; count?: (n: number) => number; label?: string; compact?: boolean }) {
  return (
    <div className={`ocards ${compact ? 'cols-auto-xs' : 'cols-auto-sm'}`} role="radiogroup">
      {options.map((n) => {
        const i = options.filter(Boolean).indexOf(n);
        return (
        <OptionCard
          key={n}
          multi={false}
          compact
          className="budget-card"
          on={value === n}
          onClick={() => onChange(n)}
          title={n ? `${label} $${n.toLocaleString('en-US')}` : 'Any budget'}
          sub={n ? `${TIERS[Math.min(i, TIERS.length - 1)]}${count ? ` · ${count(n)} pieces` : ''}` : 'Show everything'}
          visual={<span className="ocard-glyph tier">{n ? '$'.repeat(Math.min(i + 1, 4)) : '∞'}</span>}
        />
        );
      })}
    </div>
  );
}

/* ---------- Colour ---------- */

export function ColourCards({ value, onToggle, department, compact }: { value: ColorFamily[]; onToggle: (c: ColorFamily) => void; department: Department; compact?: boolean }) {
  return (
    <div className={`ocards ${compact ? 'cols2' : 'cols-auto-sm'}`}>
      {COLORS.map((c) => {
        const n = PRODUCTS.filter((p) => p.color.family === c.key && inDepartment(p, department)).length;
        return (
          <OptionCard key={c.key} compact on={value.includes(c.key)} onClick={() => onToggle(c.key)} title={c.label} sub={`${n} pieces`} visual={<span className="ocard-swatch" style={{ background: c.swatch }} />} />
        );
      })}
    </div>
  );
}

/* ---------- Category ---------- */

const CAT_ART: Record<Category, { women: string; men: string }> = {
  dresses: { women: 'peony-midi', men: 'peony-midi' },
  sets: { women: 'ivory-agbada', men: 'ivory-agbada' },
  tops: { women: 'white-blouse', men: 'oxford-white' },
  bottoms: { women: 'tailored-trouser', men: 'stone-chino' },
  outerwear: { women: 'camel-trench', men: 'camel-overcoat' },
  shoes: { women: 'nude-pump', men: 'espresso-loafer' },
  bags: { women: 'vermeil-top-handle', men: 'malle-weekender-navy' },
    accessories: { women: 'vermeil-watch', men: 'aurelia-chrono' },
  caps: { women: 'vermeil-watch', men: 'aurelia-chrono' },
  belts: { women: 'vermeil-watch', men: 'aurelia-chrono' },
  glasses: { women: 'vermeil-watch', men: 'aurelia-chrono' },
};

export function CategoryCards({ value, onToggle, department }: { value: Category[]; onToggle: (c: Category) => void; department: Department }) {
  const cats = CATEGORIES.filter((c) => PRODUCTS.some((p) => p.category === c.key && inDepartment(p, department)));
  return (
    <div className="ocards cols2">
      {cats.map((c) => {
        const n = PRODUCTS.filter((p) => p.category === c.key && inDepartment(p, department)).length;
        return <OptionCard key={c.key} compact on={value.includes(c.key)} onClick={() => onToggle(c.key)} title={c.label} sub={`${n} pieces`} visual={<Art ids={[CAT_ART[c.key][department === 'men' ? 'men' : 'women']]} />} />;
      })}
    </div>
  );
}

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { DepartmentSwitch } from '../components/Layout.tsx';
import { IconArrow, IconBag, IconCalendar, IconChat, IconExternal, IconFile, IconHanger, IconHeart, IconSparkle, IconUser, IconWand } from '../components/icons.tsx';
import { LookCard, ProductCard, money } from '../components/ui.tsx';
import { useApp } from '../lib/store.tsx';
import { inDepartment, PRODUCTS, SELLERS } from '../shared/catalog.ts';
import { editorsLooks, suggestOutfits } from '../shared/outfits.ts';

/** Each feature, and the shopping problem it solves. */
const FEATURES = [
  { to: '/try-on', Icon: IconSparkle, title: 'Virtual try-on', text: 'See clothes on your own photo, photo-real, not 3D.', solves: 'Uncertainty when shopping online' },
  { to: '/changer', Icon: IconWand, title: 'AI clothes changer', text: 'Swap your whole outfit in one tap, or try any garment photo.', solves: 'Imagining a new look' },
  { to: '/style', Icon: IconUser, title: 'Style preferences', text: 'Tell us your styles, colours and occasions.', solves: 'Irrelevant fashion choices' },
  { to: '/outfits', Icon: IconHanger, title: 'Outfit suggestions', text: 'Complete looks, put together for you.', solves: 'Difficulty choosing what to wear' },
  { to: '/shop?max=100', Icon: () => <span className="feature-dollar">$</span>, title: 'Budget filter', text: 'Only see what fits your price range.', solves: 'Difficulty finding affordable options' },
  { to: '/shop', Icon: IconBag, title: 'Product catalog', text: 'Clothing with full seller details.', solves: 'Difficulty discovering products' },
  { to: '/saved', Icon: IconHeart, title: 'Saved looks', text: 'Come back to the outfits you loved.', solves: 'Losing track of choices' },
  { to: '/sellers', Icon: IconExternal, title: 'Retailer links', text: 'Buy straight from participating sellers.', solves: 'Not knowing where to buy' },
  { to: '/planner', Icon: IconCalendar, title: 'Smart outfit planner', text: 'A week of looks, matched to what’s on each day.', solves: 'Morning outfit stress' },
  { to: '/stylist', Icon: IconChat, title: 'AI stylist chat', text: 'Ask for any occasion and budget. Get real pieces back.', solves: 'No one to ask for advice' },
  { to: '/report', Icon: IconFile, title: 'Style report', text: 'Download your profile, plan and shopping list as a PDF.', solves: 'Keeping it all in one place' },
];

const BUDGETS = [50, 100, 150, 250];

export default function Home() {
  const { name, prefs, styled, setPrefs } = useApp();
  const d = prefs.department;
  const looks = useMemo(() => {
    if (styled) return suggestOutfits(prefs, { limit: 3 });
    const ed = editorsLooks(d);
    // Both departments: alternate women's and men's editors' looks.
    return d === 'all' ? [ed[0], ed.find((o) => o.gender === 'men')!, ed[1]] : ed.slice(0, 3);
  }, [prefs, styled, d]);
  const fresh = PRODUCTS.filter((p) => ['peony-midi', 'ivory-agbada', 'blush-blazer', 'navy-suit-jacket', 'gilded-mini', 'camel-overcoat', 'blush-heel', 'espresso-loafer', 'striped-shirt', 'wine-senator', 'blush-tote', 'espresso-briefcase'].includes(p.id) && inDepartment(p, d));

  return (
    <div className="container stack gap-48">
      <section className="hero panel">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="hero-copy">
          <span className="eyebrow">{name ? `Welcome back, ${name}` : 'Menswear & womenswear · Virtual fitting room'}</span>
          <h1 className="display">
            Dress for the life <em>you’re building.</em>
          </h1>
          <p className="lead">
            Try clothes on your own photo, change your outfit in a tap, plan the week ahead with your AI stylist, and buy
            straight from the boutiques that make them.
          </p>
          <div className="row gap-12 wrap">
            <Link to="/try-on" className="btn primary"><IconSparkle size={16} /> Start a try-on</Link>
            <Link to={styled ? '/outfits' : '/style'} className="btn ghost">
              {styled ? 'See my outfits' : 'Find my style'} <IconArrow size={16} />
            </Link>
          </div>
          <div className="dept-cards">
            <Link to="/shop" onClick={() => setPrefs({ department: 'women' })} className="dept-card">
              <span className="eyebrow">Shop</span><b>Women</b>
            </Link>
            <Link to="/shop" onClick={() => setPrefs({ department: 'men' })} className="dept-card dark">
              <span className="eyebrow">Shop</span><b>Men</b>
            </Link>
          </div>
        </motion.div>
        <motion.div className="hero-art" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.1 }}>
          <div className="arch">
            <HeroFigure />
          </div>
          <div className="hero-chip"><IconSparkle size={14} className="gold" /> Powered by YouCam AI try-on</div>
        </motion.div>
      </section>

      <section className="stack gap-20">
        <div className="section-head">
          <div>
            <span className="eyebrow">Made for the way you shop</span>
            <h2 className="h2">Everything in one atelier</h2>
          </div>
        </div>
        <div className="features">
          {FEATURES.map(({ to, Icon, title, text, solves }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link to={to} className="feature panel">
                <span className="feature-icon"><Icon size={20} /></span>
                <b>{title}</b>
                <span className="small">{text}</span>
                <span className="solves">Solves: {solves}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="stack gap-20">
        <div className="section-head">
          <div>
            <span className="eyebrow">{styled ? 'Picked for your style' : 'From our editors'}</span>
            <h2 className="h2">Outfits to try</h2>
          </div>
          <Link to="/outfits" className="link">All outfits <IconArrow size={14} /></Link>
        </div>
        <DepartmentSwitch />
        <div className="look-grid">
          {looks.filter(Boolean).map((o, i) => <LookCard key={o.id} outfit={o} index={i} />)}
        </div>
        {!styled && (
          <Link to="/style" className="banner panel">
            <span><b>Make these yours.</b> Answer four quick questions and every suggestion fits your style, colours and budget.</span>
            <IconArrow size={18} />
          </Link>
        )}
      </section>

      <section className="stack gap-20">
        <div className="section-head">
          <div>
            <span className="eyebrow">Shop by budget</span>
            <h2 className="h2">Beautiful at every price</h2>
          </div>
        </div>
        <div className="budget-tiles">
          {BUDGETS.map((b) => (
            <Link key={b} to={`/shop?max=${b}`} className="budget-tile panel">
              <span className="small muted">Under</span>
              <span className="display-sm">{money(b)}</span>
              <span className="small">{PRODUCTS.filter((p) => p.price <= b && inDepartment(p, d)).length} pieces</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="stack gap-20">
        <div className="section-head">
          <div>
            <span className="eyebrow">New this week</span>
            <h2 className="h2">Fresh in the atelier</h2>
          </div>
          <Link to="/shop" className="link">Shop all <IconArrow size={14} /></Link>
        </div>
        <div className="product-scroller">
          {fresh.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      <section className="stack gap-20">
        <div className="section-head">
          <div>
            <span className="eyebrow">Participating sellers</span>
            <h2 className="h2">Boutiques you’ll love</h2>
          </div>
          <Link to="/sellers" className="link">All sellers <IconArrow size={14} /></Link>
        </div>
        <div className="seller-strip">
          {SELLERS.map((s) => (
            <Link key={s.id} to={`/sellers/${s.id}`} className="seller-pill panel">
              <b>{s.name}</b>
              <span className="small muted">{s.city}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Dress form and suit form, for womenswear and menswear. */
function HeroFigure() {
  return (
    <svg viewBox="0 0 200 300" className="hero-figure" aria-hidden>
      <defs>
        <linearGradient id="hf-dress" x1="0" x2="1">
          <stop offset="0" stopColor="#fffeff" />
          <stop offset=".55" stopColor="#ecdbc7" />
          <stop offset="1" stopColor="#c9ab88" />
        </linearGradient>
        <linearGradient id="hf-gold" x1="0" x2="1">
          <stop offset="0" stopColor="#ecdbc7" />
          <stop offset="1" stopColor="#b0906f" />
        </linearGradient>
      </defs>
      {/* Suit form (behind, right) */}
      <g transform="translate(46 18) scale(.8)">
        <path d="M100 262v26M78 290h44" stroke="url(#hf-gold)" strokeWidth="4" strokeLinecap="round" />
        <path d="M100 14a10 10 0 1 1 0 .1" fill="url(#hf-gold)" />
        <path d="M66 40 Q100 50 134 40 L150 60 Q150 150 146 196 L54 196 Q50 150 50 60 Z" fill="#26304a" />
        <path d="M86 42 L100 116 L114 42" fill="#fffeff" />
        <path d="M86 42 L78 76 L100 116 M114 42 L122 76 L100 116" stroke="#ecdbc7" strokeWidth="2" fill="none" />
        <path d="M54 196 L146 196 L140 262 L60 262 Z" fill="#1f2638" />
        <path d="M100 196 L100 262" stroke="#ecdbc7" strokeOpacity=".35" />
      </g>
      {/* Dress form (front, left) */}
      <g transform="translate(-28 22) scale(.86)">
        <path d="M100 262v26M78 290h44" stroke="url(#hf-gold)" strokeWidth="4" strokeLinecap="round" />
        <path d="M100 14a10 10 0 1 1 0 .1" fill="url(#hf-gold)" />
        <path d="M96 24h8v10h-8z" fill="url(#hf-gold)" />
        <path d="M70 40 Q100 52 130 40 L138 84 Q132 104 124 116 Q162 196 176 262 Q100 276 24 262 Q38 196 76 116 Q68 104 62 84 Z" fill="url(#hf-dress)" />
        <path d="M76 116 Q100 124 124 116" stroke="#321b13" strokeWidth="3" fill="none" />
        <path d="M90 126 Q80 196 66 266 M110 126 Q120 196 134 266" stroke="#321b13" strokeOpacity=".25" fill="none" />
        <path d="M82 46 Q100 70 118 46" stroke="#321b13" strokeOpacity=".3" fill="none" />
      </g>
    </svg>
  );
}

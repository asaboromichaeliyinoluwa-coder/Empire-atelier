import { motion } from 'framer-motion';
import { useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  IconArrow, IconBag, IconCalendar, IconChat, IconChevron, IconExternal, IconFile, IconHanger, IconHeart, IconSparkle, IconStore,
  IconCheck, IconTag, IconUser, IconWand, Star,
} from '../components/icons.tsx';
import { Collage, GarmentImage, money, ProductCard } from '../components/ui.tsx';
import { useAuth } from '../lib/auth.tsx';
import { useApp } from '../lib/store.tsx';
import { HOUSES } from '../shared/luxury.ts';
import { CATEGORIES, inDepartment, MAISON_NOTE, NEW_IN, PRODUCTS, productById, showcase, SELLERS, type Category, type Department } from '../shared/catalog.ts';
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
/** The piece pictured on each feature card. */
const FEATURE_ART = ['blush-blazer', 'camel-trench', 'peony-midi', 'ivory-agbada', 'white-tee', 'monogram-tote', 'blush-heel', 'espresso-briefcase', 'navy-suit-jacket', 'baroque-slip', 'heritage-knit'];
const MAISON_PICKS = ['vermeil-top-handle', 'malle-trunk-navy', 'aurelia-chrono', 'brut-biker', 'prisma-trench', 'giardino-loafer', 'monogram-trench', 'saddle-bag', 'chunky-runner', 'oversized-hoodie', 'horsebit-loafer', 'saddle-slide', 'silk-carre', 'tweed-jacket', 'leather-trench-m', 'denim-oversize', 'suede-slide-m', 'quilted-clutch', 'baroque-slip', 'monogram-bomber'];

/** The piece that pictures each category, per department. */
const CATEGORY_ART: Record<Category, Record<Exclude<Department, 'all'>, string>> = {
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

/** A row that scrolls sideways, with arrow buttons on wide screens. */
function useScroller() {
  const ref = useRef<HTMLDivElement>(null);
  const by = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' });
  const arrows = (
    <span className="arrows">
      <button className="round-btn" onClick={() => by(-1)} aria-label="Scroll back"><IconChevron left size={16} /></button>
      <button className="round-btn" onClick={() => by(1)} aria-label="Scroll on"><IconChevron size={16} /></button>
    </span>
  );
  return { ref, arrows };
}

function SectionHead({ title, sub, to, label = 'View all', arrows }: { title: string; sub?: string; to?: string; label?: string; arrows?: React.ReactNode }) {
  return (
    <div className="shop-head">
      <div>
        <h2 className="shop-title">{title}</h2>
        {sub && <p className="small muted">{sub}</p>}
      </div>
      <div className="row gap-12">
        {to && <Link to={to} className="link small">{label}</Link>}
        {arrows}
      </div>
    </div>
  );
}

export default function Home() {
  const { name, prefs, styled, setPrefs } = useApp();
  const navigate = useNavigate();
  const d = prefs.department;
  const artDept = d === 'men' ? 'men' : 'women';
  const { user } = useAuth();
  const arrivals = useScroller();
  const maison = useScroller();
  const collections = useScroller();

  const realItems = PRODUCTS.filter((p) => p.custom && inDepartment(p, d)).slice(0, 8);
  const fresh = NEW_IN.map((id) => PRODUCTS.find((p) => p.id === id)).filter((p) => p && inDepartment(p, d)) as NonNullable<ReturnType<typeof productById>>[];
  const maisonItems = MAISON_PICKS.map((id) => PRODUCTS.find((p) => p.id === id)).filter((p) => p && inDepartment(p, d)) as NonNullable<ReturnType<typeof productById>>[];
  const looks = useMemo(() => {
    const ed = editorsLooks(d);
    const picked = styled ? [...suggestOutfits(prefs, { limit: 2 }), ...ed] : ed;
    if (d !== 'all' || styled) return picked.slice(0, 8);
    // Both departments: alternate women's and men's editors' looks.
    const w = ed.filter((o) => o.gender === 'women'), m = ed.filter((o) => o.gender === 'men');
    return w.flatMap((o, i) => (m[i] ? [o, m[i]] : [o])).slice(0, 8);
  }, [prefs, styled, d]);
  const categories = CATEGORIES.filter((c) => PRODUCTS.some((p) => p.category === c.key && inDepartment(p, d)));
  const otherDept = d === 'men' ? ('women' as const) : ('men' as const);

  return (
    <div className="home stack">
      {/* ---------- Hero ---------- */}
      <section className="hero-wide">
        <div className="container hero-inner">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="hero-copy">
            <span className="eyebrow">{user || name ? `Welcome back, ${(user?.name || name).split(' ')[0]}` : 'Menswear & womenswear · Virtual fitting room'}</span>
            <h1 className="hero-title">
              Dress for the life <strong>you’re building</strong>
            </h1>
            <p className="hero-lead">
              Timeless pieces from independent boutiques. Try them on your own photo, let your AI stylist
              put the look together, and buy straight from the people who make them.
            </p>
            <div className="row gap-12 wrap">
              <Link to="/shop?new=1" className="btn primary pill">Shop new in</Link>
              <Link to="/try-on" className="btn outline pill"><IconSparkle size={15} /> Start a try-on</Link>
            </div>
          </motion.div>
          <motion.div className="hero-scene" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.1 }}>
            <LeafShadow />
            <div className="scene-arch" />
                        <div className="hero-photo" role="img" aria-label="Empire Glamour collection" style={{ backgroundImage: 'url(/real/hero-mannequins.png)' }} />
            <div className="plaque">
              <Star size={34} />
              <b>Empire Glamour</b>
              <small>Dress for the life you’re building</small>
            </div>
            <div className="hero-chip"><IconSparkle size={14} /> Powered by YouCam AI try-on</div>
          </motion.div>
        </div>
      </section>

      <div className="container">
        <div className="trust panel">
          <Link to="/try-on"><IconSparkle size={22} /><span><b>Virtual try-on</b><small>On every wearable piece</small></span></Link>
          <Link to="/sellers"><IconStore size={22} /><span><b>Buy direct</b><small>{SELLERS.length === 1 ? 'Straight from our own studio' : `From ${SELLERS.length} independent boutiques`}</small></span></Link>
          <Link to="/shop?max=100"><IconTag size={22} /><span><b>Budget filter</b><small>Only see what you can spend</small></span></Link>
          <Link to="/stylist"><IconChat size={22} /><span><b>AI stylist</b><small>Ask for any occasion, any time</small></span></Link>
        </div>
      </div>

      <div className="container stack home-sections">
        {/* ---------- Real products ---------- */}
        {realItems.length > 0 && (
          <section className="stack gap-20">
            <SectionHead title="Our products" to="/shop" />
            <div className="product-grid">
              {realItems.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </section>
        )}

        {/* ---------- Shop by category ---------- */}
        <section className="stack gap-20">
          <SectionHead title="Shop by category" to="/shop" />
          <div className="circles">
            {categories.map((c, i) => {
              const p = PRODUCTS.find((x) => x.category === c.key && inDepartment(x, d)) ?? showcase(CATEGORY_ART[c.key][artDept]);
              return (
                <motion.div key={c.key} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                  <Link to={`/shop?category=${c.key}`} className="circle">
                    <span className="disc"><GarmentImage product={p} /></span>
                    <span>{c.label}</span>
                  </Link>
                </motion.div>
              );
            })}
            {d !== 'all' && (
              <Link to="/shop" className="circle" onClick={(e) => { e.preventDefault(); setPrefs({ department: otherDept }); navigate('/shop'); }}>
                <span className="disc"><GarmentImage product={showcase(otherDept === 'men' ? 'navy-suit-jacket' : 'blush-slip', 1)} /></span>
                <span>{otherDept === 'men' ? 'Men' : 'Women'}</span>
              </Link>
            )}
            {d === 'all' && (
              <Link to="/shop" className="circle" onClick={(e) => { e.preventDefault(); setPrefs({ department: 'men' }); navigate('/shop'); }}>
                <span className="disc"><GarmentImage product={showcase('navy-suit-jacket', 0)} /></span>
                <span>Men</span>
              </Link>
            )}
            <Link to="/shop?sale=1" className="circle">
              <span className="disc sale-disc">Sale</span>
              <span>Sale</span>
            </Link>
          </div>
        </section>

        {/* ---------- New arrivals ---------- */}
        <section className="stack gap-20">
          <SectionHead title="New arrivals" sub="Fresh styles. Just in." to="/shop?new=1" arrows={arrivals.arrows} />
          <div className="product-scroller" ref={arrivals.ref}>
            {fresh.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>

        {/* ---------- Promo trio ---------- */}
        <section className="promos">
          <Link to="/try-on" className="promo dark">
            <span className="promo-copy">
              <span className="promo-kicker">See it on you first</span>
              <b>Virtual try-on</b>
              <small>Upload one photo and try any piece, photo-real, not 3D.</small>
              <span className="promo-btn">Start a try-on</span>
            </span>
            <span className="promo-art arch-art"><GarmentImage product={showcase('blush-blazer', 2)} /></span>
          </Link>
          <Link to="/changer" className="promo cream">
            <span className="promo-copy">
              <span className="promo-kicker">New season</span>
              <b>New look</b>
              <small>Swap your whole outfit in one tap with the AI clothes changer.</small>
              <span className="promo-btn">Change my outfit</span>
            </span>
            <span className="promo-art stack-art">
              <GarmentImage product={showcase('camel-trench', 3)} />
              <GarmentImage product={showcase('navy-senator', 4)} />
            </span>
          </Link>
          <Link to="/planner" className="promo linen">
            <span className="promo-copy">
              <span className="promo-kicker">Smart outfit planner</span>
              <b>Plan your week</b>
              <small>A look for every day, matched to what’s on.</small>
              <span className="promo-btn">Open the planner</span>
            </span>
            <span className="promo-art week-art" aria-hidden>
              {['Mon', 'Wed', 'Fri'].map((day, i) => (
                <span key={day} className="mini-day">
                  <small>{day}</small>
                  <GarmentImage product={showcase(['white-blouse', 'wine-senator', 'gilded-mini'][i], 5 + i)} />
                </span>
              ))}
            </span>
          </Link>
        </section>

        {/* ---------- The Maison edit ---------- */}
        <section className="maison">
          <div className="maison-intro">
            <span className="eyebrow light">The Maison edit</span>
            <h2 className="maison-title">Luxury, <em>reimagined</em></h2>
            <p>Monogram canvas, saddle leather, oversized streetwear, silk carrés and heritage stripes. Original designs drawn in the spirit of the great fashion houses, in real leather, suede, silk, wool and denim finishes.</p>
            <Link to="/shop?luxury=1" className="btn pill light-btn">Shop the luxury houses</Link>
            <small className="maison-fine">{MAISON_NOTE}</small>
          </div>
          <div className="maison-shelf">
            <div className="row between"><span className="small light-muted">{maisonItems.length} pieces</span>{maison.arrows}</div>
            <div className="product-scroller dark-cards" ref={maison.ref}>
              {maisonItems.map((p, i) => <ProductCard key={p!.id} product={p!} index={i} />)}
            </div>
          </div>
        </section>

        {/* ---------- The houses ---------- */}
        <section className="stack gap-20">
          <SectionHead title="The luxury houses" sub="Six original labels, each with its own materials and mood." to="/shop?luxury=1" />
          <div className="house-grid">
            {HOUSES.map((h) => {
              const picks = PRODUCTS.filter((p) => p.sellerId === h.id && inDepartment(p, d)).slice(0, 3);
              return (
                <Link key={h.id} to={`/shop?seller=${h.id}`} className="house-card">
                  <span className="house-art">{picks.map((p) => <GarmentImage key={p.id} product={p} />)}</span>
                  <span className="house-swatches">{h.palette.map((c) => <i key={c} style={{ background: c }} />)}</span>
                  <b>{h.name}</b>
                  <small>{h.vibe} · {h.city}</small>
                </Link>
              );
            })}
          </div>
          <small className="muted">{MAISON_NOTE}</small>
        </section>

        {/* ---------- Explore collections ---------- */}
        <section className="stack gap-20">
          <SectionHead title="Explore collections" sub={styled ? 'Picked for your style, plus our editors’ favourites.' : 'Hand-picked looks for every occasion.'} to="/outfits" arrows={collections.arrows} />
          <div className="collection-row" ref={collections.ref}>
            {looks.map((o) => (
              <Link key={o.id} to={`/look?items=${o.itemIds.join(',')}&name=${encodeURIComponent(o.name)}&occasion=${o.occasion}`} className="collection">
                <Collage itemIds={o.itemIds} />
                <span className="collection-copy">
                  <b>{o.name}</b>
                  <small>{o.reasons.slice(0, 2).join(' · ')} · {money(o.total)}</small>
                  <span className="promo-btn light">Shop the look</span>
                </span>
              </Link>
            ))}
          </div>
          {!styled && (
            <Link to="/style" className="banner panel">
              <span><b>Make these yours.</b> Answer four quick questions and every suggestion fits your style, colours and budget.</span>
              <IconArrow size={18} />
            </Link>
          )}
        </section>

        {/* ---------- Budget ---------- */}
        <section className="stack gap-20">
          <SectionHead title="Shop by budget" sub="Beautiful at every price." />
          <div className="budget-tiles">
            {BUDGETS.map((b) => (
              <Link key={b} to={`/shop?max=${b}`} className="budget-tile">
                <span className="small muted">Under</span>
                <span className="display-sm">{money(b)}</span>
                <span className="small">{PRODUCTS.filter((p) => p.price <= b && inDepartment(p, d)).length} pieces <IconArrow size={13} /></span>
              </Link>
            ))}
          </div>
        </section>

        {/* ---------- Every feature ---------- */}
        <section className="stack gap-20">
          <SectionHead title="Everything in one atelier" sub="Made for the way you shop." />
          <div className="fcards">
            {FEATURES.map(({ to, Icon, title, text, solves }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: (i % 4) * 0.06, duration: 0.5 }}>
                <Link to={to} className={`fcard theme-${i % 6}`}>
                  <span className="fcard-visual">
                    <span className="fcard-num">{String(i + 1).padStart(2, '0')}</span>
                    <GarmentImage product={showcase(FEATURE_ART[i], 8 + i)} />
                    <span className="fcard-icon"><Icon size={20} /></span>
                  </span>
                  <span className="fcard-body">
                    <b>{title}</b>
                    <span className="small">{text}</span>
                    <span className="solves-pill"><IconCheck size={12} /> Solves: {solves}</span>
                    <span className="fcard-go">Open <IconArrow size={13} /></span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ---------- Membership ---------- */}
        {!user && (
          <section className="join">
            <span className="join-star"><Star size={40} /></span>
            <div className="grow stack gap-8">
              <h2 className="h2">Join the atelier. It’s free.</h2>
              <p className="small">Create an account and your favourites, saved looks, bag and outfit planner follow you to every device, with a dashboard that keeps it all in one place.</p>
            </div>
            <Link to="/account" className="btn primary pill">Create my account</Link>
          </section>
        )}

        {/* ---------- Sellers ---------- */}
        <section className="stack gap-20">
          <SectionHead title="Boutiques you’ll love" sub="Participating sellers. Buy direct, tagged so they know you came from us." to="/sellers" label="All sellers" />
          <div className="seller-strip">
            {SELLERS.map((s) => (
              <Link key={s.id} to={`/sellers/${s.id}`} className="seller-pill">
                <b>{s.name}</b>
                <span className="small muted">{s.city}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/** Soft palm-leaf shadow falling across the hero, as in a sunlit studio. */
function LeafShadow() {
  return (
    <svg className="leaf-shadow" viewBox="0 0 200 260" aria-hidden>
      <g fill="currentColor">
        <path d="M190 10 C120 60 80 130 40 250 L46 252 C88 136 126 70 194 16Z" />
        {Array.from({ length: 11 }, (_, i) => {
          const t = i / 10;
          const x = 186 - t * 140, y = 20 + t * 225;
          return <path key={i} d={`M${x} ${y} q-${50 - t * 18} ${6 + t * 10} -${74 - t * 30} ${-20 + t * 30} q${30} ${18} ${74 - t * 30} ${24 - t * 14}Z`} />;
        })}
      </g>
    </svg>
  );
}

/** Dress form and suit form, for womenswear and menswear. */
export function HeroFigure() {
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

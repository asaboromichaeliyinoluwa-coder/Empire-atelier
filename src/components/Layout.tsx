import { AnimatePresence, motion } from 'framer-motion';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useOutlet } from 'react-router-dom';

import { useAuth } from '../lib/auth.tsx';
import { SignIn } from '../pages/Account.tsx';
import { useCatalogVersion } from '../lib/shop.tsx';
import { useApp } from '../lib/store.tsx';
import { HOUSE_IDS } from '../shared/luxury.ts';
import { DEPARTMENTS, PRODUCTS, type Department } from '../shared/catalog.ts';
import { ChatBubble } from './ChatBubble.tsx';
import { InstallPrompt } from './InstallPrompt.tsx';
import {
  IconBag, IconCalendar, IconChat, IconFile, IconHanger, IconHeart, IconHome, IconLeaf, IconSearch, IconShield,
  IconSparkle, IconUser, IconWand, Star,
} from './icons.tsx';

/** Storefront navigation. Women and Men also switch the department every page browses. */
const SHOP_NAV: { label: string; to: string; dept?: Department; sale?: true }[] = [
  { label: 'New in', to: '/shop?new=1' },
  { label: 'Women', to: '/shop', dept: 'women' },
  { label: 'Men', to: '/shop', dept: 'men' },
  { label: 'Tops', to: '/shop?category=tops' },
  { label: 'Bottoms', to: '/shop?category=bottoms' },
  { label: 'Dresses', to: '/shop?category=dresses' },
  { label: 'Sets', to: '/shop?category=sets' },
  { label: 'Shoes', to: '/shop?category=shoes' },
    { label: 'Bags', to: '/shop?category=bags' },
  { label: 'Watches & jewellery', to: '/shop?category=accessories' },
    { label: 'Caps & beanies', to: '/shop?category=caps' },
  { label: 'Belts', to: '/shop?category=belts' },
  { label: 'Glasses', to: '/shop?category=glasses' },
  { label: 'Luxury houses', to: '/shop?luxury=1' },
  { label: 'Sale', to: '/shop?sale=1', sale: true },
];

/** A nav link is shown only when it would lead to something in the store. */
const navListed = (n: (typeof SHOP_NAV)[number]) => {
  const q = new URLSearchParams(n.to.split('?')[1] ?? '');
  const cat = q.get('category');
  if (cat) return PRODUCTS.some((p) => p.category === cat);
  if (q.has('luxury')) return PRODUCTS.some((p) => HOUSE_IDS.includes(p.sellerId));
  if (q.has('sale')) return PRODUCTS.some((p) => !!p.was);
  return true;
};

/** The AI atelier tools, one click away on every page. */
const TOOLS = [
  { to: '/try-on', label: 'Virtual try-on', Icon: IconSparkle },
    { to: '/changer', label: 'Clothes changer', Icon: IconWand },
  { to: '/outfits', label: 'Outfits', Icon: IconHanger },
  { to: '/planner', label: 'Outfit planner', Icon: IconCalendar },
  { to: '/stylist', label: 'AI stylist', Icon: IconChat },
  { to: '/report', label: 'Style report', Icon: IconFile },
];

const TABS = [
  { to: '/', label: 'Home', Icon: IconHome },
  { to: '/shop', label: 'Shop', Icon: IconBag },
  { to: '/try-on', label: 'Try on', Icon: IconSparkle },
  { to: '/stylist', label: 'Stylist', Icon: IconChat },
  { to: '/planner', label: 'Planner', Icon: IconCalendar },
];

const VALUES = [
  { Icon: IconSparkle, title: 'Try before you buy', text: 'Photo-real try-on on your own photo' },
  { Icon: IconLeaf, title: 'Independent boutiques', text: 'Buy direct from the people who make it' },
  { Icon: IconShield, title: 'Styled around you', text: 'Your colours, your budget, your week' },
];

/** Women / Men / All switch, shared by every page through the shopper's preferences. */
export function DepartmentSwitch({ className = '' }: { className?: string }) {
  const { prefs, setPrefs } = useApp();
  return (
    <div className={`dept ${className}`} role="radiogroup" aria-label="Department">
      {DEPARTMENTS.map((d) => (
        <button key={d.key} role="radio" aria-checked={prefs.department === d.key} className={prefs.department === d.key ? 'on' : ''} onClick={() => setPrefs({ department: d.key })}>
          {d.label}
        </button>
      ))}
    </div>
  );
}

export function Brand({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`brand ${className}`} aria-label="EMPIRE GLAMOUR home">
      <Star size={30} className="mark" />
      <span className="wordmark">
        <span>Empire</span>
                <small>Glamour</small>
      </span>
    </Link>
  );
}

function SearchBox({ onDone }: { onDone?: () => void }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  return (
    <form
      className="header-search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        navigate(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : '/shop');
        setQ('');
        onDone?.();
      }}
    >
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search bags, watches, silk…" aria-label="Search the atelier" />
      <button aria-label="Search"><IconSearch size={17} /></button>
    </form>
  );
}

export function Layout() {
  const location = useLocation();
  const outlet = useOutlet();
  const catalogVersion = useCatalogVersion();
  const navigate = useNavigate();
  const { background, favorites, looks, bag, prefs, setPrefs } = useApp();
  const savedCount = favorites.length + looks.length;
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, ready } = useAuth();
  const gated = ready && !user;
  const wasGated = useRef(false);
  useEffect(() => {
    if (gated) wasGated.current = true;
    else if (user && wasGated.current) { wasGated.current = false; navigate('/account'); }
  }, [gated, user, navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setSearchOpen(false);
  }, [location.pathname]);

  const here = location.pathname + location.search;
  const isActive = (n: (typeof SHOP_NAV)[number]) =>
    n.dept ? location.pathname === '/shop' && !location.search && prefs.department === n.dept : here === n.to;

  const shopLinks = (
    <>
      {SHOP_NAV.filter(navListed).map((n) => (
        <Link
          key={n.label}
          to={n.to}
          className={`${isActive(n) ? 'active' : ''} ${n.sale ? 'sale' : ''}`}
          onClick={(e) => {
            if (!n.dept) return;
            e.preventDefault();
            setPrefs({ department: n.dept });
            navigate(n.to);
          }}
        >
          {n.label}
        </Link>
      ))}
    </>
  );

  return (
    <div className={gated ? "app is-gated" : "app"} data-bg={background}>
      <div className="backdrop" aria-hidden />

      <div className="promo-bar">
        <span className="promo-spacer only-wide" />
        <span className="promo-text">
          Free virtual try-on on every piece <i aria-hidden>|</i> <span className="only-wide-inline">Buy direct from independent boutiques</span>
        </span>
        <span className="promo-links only-wide">
          <Link to="/sellers">Boutiques</Link>
          <span aria-hidden>·</span>
          <Link to="/account">{user ? `Hi, ${user.name.split(' ')[0]}` : 'Sign in'}</Link>
        </span>
      </div>

      <header className="topbar">
        <Brand />
        <nav className="shopnav only-wide" aria-label="Shop">{shopLinks}</nav>
        <div className="header-tools">
          <span className="only-wide"><SearchBox /></span>
          <button className="icon-btn only-narrow" onClick={() => setSearchOpen((o) => !o)} aria-label="Search" aria-expanded={searchOpen}>
            <IconSearch size={20} />
          </button>
          <NavLink to="/account" className={`icon-btn ${user ? 'signed-in' : ''}`} aria-label={user ? `My atelier (${user.name})` : 'Sign in or create an account'} title={user ? user.name : 'Sign in'}>
            {user ? <span className="avatar-mini">{(user.name || user.email).slice(0, 1).toUpperCase()}</span> : <IconUser size={20} />}
          </NavLink>
          <NavLink to="/saved" className="icon-btn" aria-label={`Favourites${savedCount ? ` (${savedCount})` : ''}`}>
            <IconHeart size={20} />
            {savedCount > 0 && <span className="dot-count">{savedCount}</span>}
          </NavLink>
          <NavLink to="/bag" className="icon-btn" aria-label={`Bag${bag.length ? ` (${bag.length})` : ''}`}>
            <IconBag size={20} />
            {bag.length > 0 && <span className="dot-count dark">{bag.length}</span>}
          </NavLink>
        </div>
      </header>
      {searchOpen && (
        <div className="mobile-search only-narrow">
          <SearchBox onDone={() => setSearchOpen(false)} />
        </div>
      )}

      <nav className="shopnav scroll only-narrow" aria-label="Shop">{shopLinks}</nav>
      <div className="atelier-bar">
        <nav className="tools" aria-label="AI atelier">
          {TOOLS.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
              <Icon size={15} /> {label}
            </NavLink>
          ))}
        </nav>
        <DepartmentSwitch className="small-dept" />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          className={`page ${location.pathname === '/' ? 'home-page' : ''}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {gated ? (
            <div className="gate">
              <div className="gate-head">
                <span className="eyebrow">Step 1</span>
                <h1>Sign in to enter your atelier</h1>
                <p>Create a free account or sign in to enter the shop, your dashboard, favourites and bag.</p>
              </div>
              <SignIn />
            </div>
          ) : (
            <Fragment key={catalogVersion}>{outlet}</Fragment>
          )}
        </motion.main>
      </AnimatePresence>

      <footer className="site-footer">
        <div className="values">
          {VALUES.map(({ Icon, title, text }) => (
            <div key={title} className="value">
              <Icon size={24} />
              <span><b>{title}</b><small>{text}</small></span>
            </div>
          ))}
        </div>
        <div className="footer-main">
          <div className="footer-brand stack gap-12">
            <Brand className="light" />
            <p className="small">Dress for the life you’re building. Menswear and womenswear from independent boutiques, tried on before you buy.</p>
          </div>
          <nav aria-label="Shop">
            <b>Shop</b>
            <Link to="/shop?new=1">New in</Link>
            <Link to="/shop" onClick={() => setPrefs({ department: 'women' })}>Women</Link>
            <Link to="/shop" onClick={() => setPrefs({ department: 'men' })}>Men</Link>
            <Link to="/shop?sale=1">Sale</Link>
            <Link to="/sellers">Participating sellers</Link>
          </nav>
          <nav aria-label="AI atelier">
            <b>AI atelier</b>
            {TOOLS.map(({ to, label }) => <Link key={to} to={to}>{label}</Link>)}
          </nav>
          <nav aria-label="You">
            <b>You</b>
            <Link to="/account">{user ? 'My atelier dashboard' : 'Sign in / create account'}</Link>
            <Link to="/style">My style</Link>
            <Link to="/admin">My products (shop owner)</Link>
            <Link to="/saved">Favourites & saved looks</Link>
            <Link to="/bag">Shopping bag</Link>
            <Link to="/report">Style report (PDF)</Link>
          </nav>
        </div>
        <div className="footer-base">
          <span>© {new Date().getFullYear()} Empire Glamour</span>
          <span>Virtual try-on and clothes changer powered by YouCam AI · Stylist powered by Claude</span>
        </div>
      </footer>

      <InstallPrompt />
      {location.pathname !== '/stylist' && <ChatBubble />}

      <nav className="tabbar" aria-label="Main">
        {TABS.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
            {({ isActive }) => (
              <>
                {isActive && <motion.span layoutId="tabdot" className="dot" />}
                <Icon size={21} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

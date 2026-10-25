import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { Link, NavLink, useLocation, useOutlet } from 'react-router-dom';

import { useApp } from '../lib/store.tsx';
import { DEPARTMENTS } from '../shared/catalog.ts';
import { InstallPrompt } from './InstallPrompt.tsx';
import { IconBag, IconCalendar, IconChat, IconHeart, IconHome, IconSparkle, IconUser, Star } from './icons.tsx';

const NAV = [
  { to: '/shop', label: 'Shop' },
  { to: '/outfits', label: 'Outfits' },
  { to: '/try-on', label: 'Try on' },
  { to: '/changer', label: 'Clothes changer' },
  { to: '/planner', label: 'Planner' },
  { to: '/stylist', label: 'Stylist' },
  { to: '/saved', label: 'Saved' },
];

const TABS = [
  { to: '/', label: 'Home', Icon: IconHome },
  { to: '/shop', label: 'Shop', Icon: IconBag },
  { to: '/try-on', label: 'Try on', Icon: IconSparkle },
  { to: '/stylist', label: 'Stylist', Icon: IconChat },
  { to: '/planner', label: 'Planner', Icon: IconCalendar },
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

export function Layout() {
  const location = useLocation();
  const outlet = useOutlet();
  const { background, favorites, looks } = useApp();
  const savedCount = favorites.length + looks.length;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="app" data-bg={background}>
      <div className="backdrop" aria-hidden />
      <header className="topbar">
        <Link to="/" className="brand" aria-label="Empire Atelier home">
          <Star size={30} className="mark" />
          <span>
            Empire <em>Atelier</em>
          </span>
        </Link>
        <DepartmentSwitch className="only-wide" />
        <nav className="topnav" aria-label="Main">
          {NAV.map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {label}
              {to === '/saved' && savedCount > 0 && <span className="count">{savedCount}</span>}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/saved" className="icon-btn profile-btn only-narrow" aria-label="Saved">
          <IconHeart size={19} />
          {savedCount > 0 && <span className="dot-count">{savedCount}</span>}
        </NavLink>
        <NavLink to="/style" className="icon-btn profile-btn" aria-label="My style">
          <IconUser size={20} />
        </NavLink>
      </header>
      <div className="dept-bar only-narrow">
        <DepartmentSwitch />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          className="page"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {outlet}
        </motion.main>
      </AnimatePresence>

      <footer className="footer">
        <div className="pattern-band" style={{ width: 'min(100%, 320px)' }} aria-hidden />
        <nav className="footer-links" aria-label="More">
          <Link to="/outfits">Outfits</Link>
          <Link to="/changer">Clothes changer</Link>
          <Link to="/report">Style report (PDF)</Link>
          <Link to="/sellers">Participating sellers</Link>
          <Link to="/style">My style</Link>
        </nav>
        <span>Virtual try-on and clothes changer powered by YouCam AI · Stylist powered by Claude</span>
      </footer>

      <InstallPrompt />

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

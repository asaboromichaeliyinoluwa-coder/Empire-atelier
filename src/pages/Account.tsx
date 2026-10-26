import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  IconBag, IconCalendar, IconChat, IconCheck, IconFile, IconHeart, IconHanger, IconMail, IconPhone, IconSparkle, IconUser, IconWand, Star,
} from '../components/icons.tsx';
import { Collage, Dialog, GarmentImage, ProductCard, money } from '../components/ui.tsx';
import { useAuth } from '../lib/auth.tsx';
import { dateKey, weekDays, weekStart } from '../lib/planner.ts';
import { useApp } from '../lib/store.tsx';
import { COLORS, inDepartment, OCCASIONS, PRODUCTS, productById, showcase, STYLES, type Product } from '../shared/catalog.ts';
import { scoreProduct } from '../shared/outfits.ts';

export default function Account() {
  const { user, ready } = useAuth();
  if (!ready && !user) return <div className="loading"><div className="spinner" /></div>;
  return user ? <Dashboard /> : <SignIn />;
}

/* ---------- Sign in / create account ---------- */

const PERKS = [
  { Icon: IconHeart, text: 'Favourites and saved looks on every device' },
  { Icon: IconCalendar, text: 'Your outfit planner, wherever you are' },
  { Icon: IconBag, text: 'A shopping bag that waits for you' },
  { Icon: IconChat, text: 'A stylist that remembers your style' },
];

type Method = 'email' | 'phone';

/** Google's own sign-in button (Google Identity Services), drawn into a div. */
function GoogleButton({ clientId, onCredential, onError }: { clientId: string; onCredential: (c: string) => void; onError: (m: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const cb = useRef(onCredential);
  cb.current = onCredential;
  useEffect(() => {
    let dead = false;
    const draw = () => {
      const g = (window as unknown as { google?: { accounts: { id: { initialize: (o: object) => void; renderButton: (el: HTMLElement, o: object) => void } } } }).google;
      if (dead || !g || !box.current) return;
      g.accounts.id.initialize({ client_id: clientId, callback: (r: { credential: string }) => cb.current(r.credential), ux_mode: 'popup' });
      g.accounts.id.renderButton(box.current, { theme: 'outline', size: 'large', shape: 'pill', text: 'continue_with', width: Math.min(box.current.clientWidth || 320, 400), logo_alignment: 'center' });
    };
    if ((window as unknown as { google?: unknown }).google) draw();
    else {
      let tag = document.getElementById('gsi-client') as HTMLScriptElement | null;
      if (!tag) {
        tag = document.createElement('script');
        tag.id = 'gsi-client';
        tag.src = 'https://accounts.google.com/gsi/client';
        tag.async = true;
        tag.onerror = () => onError('Google sign-in couldn’t load. Check your connection and try again.');
        document.head.appendChild(tag);
      }
      tag.addEventListener('load', draw);
    }
    return () => { dead = true; };
  }, [clientId, onError]);
  return <div ref={box} className="google-box" aria-label="Continue with Google" />;
}

export function SignIn() {
  const { signUp, logIn, googleSignIn, phoneStart, phoneVerify, providers, mode } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>('signup');
  const [method, setMethod] = useState<Method>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+234');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const server = mode === 'server';

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(undefined);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    void run(() => (tab === 'signup' ? signUp(name, email, password) : logIn(email, password)));
  };
  const sendCode = () =>
    run(async () => {
      await phoneStart(phone);
      setCodeSent(true);
      setCooldown(30);
    });
  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    void run(() => phoneVerify(phone, code, name));
  };
  const onGoogle = useMemoCb((credential: string) => void run(() => googleSignIn(credential)));

  return (
    <div className="container auth">
      <motion.section className="auth-art" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
        <Star size={44} />
        <span className="eyebrow light">Empire Atelier membership</span>
        <h1 className="auth-title">Your wardrobe, <em>everywhere.</em></h1>
        <p>Free to join. Keep everything you love in one account and pick up on any phone or computer.</p>
        <ul className="perks">
          {PERKS.map(({ Icon, text }) => (
            <li key={text}><span><Icon size={17} /></span>{text}</li>
          ))}
        </ul>
        <div className="auth-garments" aria-hidden>
          {['monogram-trench', 'baroque-slip', 'monogram-bomber'].map((id, i) => <GarmentImage key={id} product={showcase(id, i)} />)}
        </div>
      </motion.section>

      <motion.section className="auth-card panel" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <div className="tabs big auth-tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'signup'} className={tab === 'signup' ? 'on' : ''} onClick={() => { setTab('signup'); setError(undefined); }}>Create account</button>
          <button role="tab" aria-selected={tab === 'login'} className={tab === 'login' ? 'on' : ''} onClick={() => { setTab('login'); setError(undefined); }}>Log in</button>
        </div>
        <h2 className="h2">{tab === 'signup' ? 'Join the atelier' : 'Welcome back'}</h2>

        {server && providers.googleClientId ? (
          <GoogleButton clientId={providers.googleClientId} onCredential={onGoogle} onError={setError} />
        ) : (
          <button type="button" className="social-btn" onClick={() => setError(server ? 'Sign in with Google isn’t switched on yet. The site owner needs to add a Google client ID (see the setup guide).' : 'Sign in with Google works on the live website once the server is running.')}>
            <GoogleMark /> Continue with Google
          </button>
        )}

        <div className="or"><span>or use</span></div>

        <div className="method" role="tablist" aria-label="Sign-in method">
          <button type="button" role="tab" aria-selected={method === 'email'} className={method === 'email' ? 'on' : ''} onClick={() => { setMethod('email'); setError(undefined); }}>
            <IconMail size={17} /><span><b>Email</b><small>and a password</small></span>
          </button>
          <button type="button" role="tab" aria-selected={method === 'phone'} className={method === 'phone' ? 'on' : ''} onClick={() => { setMethod('phone'); setError(undefined); }}>
            <IconPhone size={17} /><span><b>Phone number</b><small>with a text code</small></span>
          </button>
        </div>

        {method === 'email' ? (
          <form className="stack gap-16" onSubmit={submitEmail}>
            {tab === 'signup' && (
              <label className="field">
                <span>Your name</span>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="e.g. Daniel" />
              </label>
            )}
            <label className="field">
              <span>Email (Gmail works)</span>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@gmail.com" />
            </label>
            <label className="field">
              <span>Password</span>
              <span className="pw">
                <input className="input" type={show ? 'text' : 'password'} required minLength={tab === 'signup' ? 8 : 1} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={tab === 'signup' ? 'new-password' : 'current-password'} placeholder={tab === 'signup' ? 'At least 8 characters' : ''} />
                <button type="button" className="link small" onClick={() => setShow((s) => !s)}>{show ? 'Hide' : 'Show'}</button>
              </span>
            </label>
            {error && <div className="error" role="alert">{error}</div>}
            <button className="btn primary" disabled={busy}>{busy ? <span className="spinner small-spin" /> : tab === 'signup' ? 'Create my account' : 'Log in'}</button>
          </form>
        ) : !server || !providers.phone ? (
          <div className="stack gap-12">
            <div className="note small">Phone sign-in sends a text code. It needs an SMS service key on the server, which hasn’t been added yet, so please use Google or email for now. The setup guide shows the five-minute Twilio setup.</div>
          </div>
        ) : (
          <form className="stack gap-16" onSubmit={codeSent ? submitCode : (e) => { e.preventDefault(); void sendCode(); }}>
            {tab === 'signup' && (
              <label className="field">
                <span>Your name</span>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="e.g. Daniel" />
              </label>
            )}
            <label className="field">
              <span>Phone number with country code</span>
              <input className="input" type="tel" inputMode="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+234 801 234 5678" disabled={codeSent} />
            </label>
            {codeSent && (
              <label className="field">
                <span>6-digit code we texted you</span>
                <input className="input code-input" inputMode="numeric" autoComplete="one-time-code" required maxLength={8} value={code} onChange={(e) => setCode(e.target.value)} placeholder="••••••" autoFocus />
              </label>
            )}
            {error && <div className="error" role="alert">{error}</div>}
            <button className="btn primary" disabled={busy || (codeSent && code.length < 4)}>{busy ? <span className="spinner small-spin" /> : codeSent ? 'Verify and continue' : 'Text me a code'}</button>
            {codeSent && (
              <div className="row between small">
                <button type="button" className="link small" onClick={() => { setCodeSent(false); setCode(''); setError(undefined); }}>Change number</button>
                <button type="button" className="link small" disabled={cooldown > 0 || busy} onClick={() => void sendCode()}>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}</button>
              </div>
            )}
          </form>
        )}

        {method === 'phone' && (!server || !providers.phone) && error && <div className="error" role="alert">{error}</div>}
        {method === 'email' && (
          <p className="small muted">
            {tab === 'signup' ? 'Already a member? ' : 'New here? '}
            <button type="button" className="link small" onClick={() => setTab(tab === 'signup' ? 'login' : 'signup')}>{tab === 'signup' ? 'Log in' : 'Create a free account'}</button>
          </p>
        )}
        {mode === 'device' && <p className="note small">Accounts are saved on this device in this version. They sync across devices once the app runs with its server database.</p>}
        <p className="small muted">Anything you’ve already saved as a guest moves into your account.</p>
      </motion.section>
    </div>
  );
}

/** Keeps a callback's identity stable so Google's button isn't redrawn on every keystroke. */
function useMemoCb<A extends unknown[]>(fn: (...a: A) => void) {
  const ref = useRef(fn);
  ref.current = fn;
  return useMemo(() => (...a: A) => ref.current(...a), []);
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3.1-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

/* ---------- Dashboard ---------- */

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

function Dashboard() {
  const { user, sync, savedAt, logOut, mode } = useAuth();
  const app = useApp();
  const [settings, setSettings] = useState(false);
  const days = weekDays(weekStart(new Date()));
  const planned = days.filter((d) => app.plan[dateKey(d)]?.itemIds?.length || app.plan[dateKey(d)]?.event).length;
  const tryOns = app.changes.length + app.looks.filter((l) => l.image).length;
  const favs = app.favorites.map(productById).filter(Boolean) as Product[];
  const picks = useMemo(
    () => PRODUCTS.filter((p) => inDepartment(p, app.prefs.department) && !app.favorites.includes(p.id)).sort((a, b) => scoreProduct(b, app.prefs) - scoreProduct(a, app.prefs)).slice(0, 8),
    [app.prefs, app.favorites],
  );
  const label = <T extends string>(list: { key: T; label: string }[], k: T) => list.find((x) => x.key === k)?.label ?? k;
  const initials = (user!.name || user!.email || 'M').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const STATS = [
    { to: '/saved', Icon: IconHeart, n: app.favorites.length, label: 'Favourites' },
    { to: '/saved', Icon: IconHanger, n: app.looks.length, label: 'Saved looks' },
    { to: '/bag', Icon: IconBag, n: app.bag.length, label: 'In your bag' },
    { to: '/planner', Icon: IconCalendar, n: planned, label: 'Days planned this week' },
    { to: '/changer', Icon: IconSparkle, n: tryOns, label: 'Try-on pictures' },
  ];
  const ACTIONS = [
    { to: '/try-on', Icon: IconSparkle, title: 'Try something on', text: 'Your photo, any piece' },
    { to: '/changer', Icon: IconWand, title: 'Change my outfit', text: 'A new look in one tap' },
    { to: '/stylist', Icon: IconChat, title: 'Ask my stylist', text: 'Any occasion, any budget' },
    { to: '/report', Icon: IconFile, title: 'Download my report', text: 'Profile, plan and list as PDF' },
  ];

  return (
    <div className="container stack gap-32 dashboard">
      <section className="dash-hero">
        <div className="stack gap-12">
          <span className="eyebrow">My atelier</span>
          <h1 className="h1">{greeting()}, {app.name || user!.name}</h1>
          <p className="lead">Here’s everything you’ve saved, planned and picked, kept in your account.</p>
          <div className="row gap-8 wrap">
            <span className={`sync ${sync}`}>
              {sync === 'saving' ? 'Saving…' : sync === 'error' ? 'Couldn’t save, retrying' : <><IconCheck size={13} /> {mode === 'server' ? 'Saved to your account' : 'Saved on this device'}{savedAt ? ` · ${new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</>}
            </span>
            <button className="btn text small" onClick={() => setSettings(true)}>Account settings</button>
            <button className="btn text small" onClick={logOut}>Log out</button>
          </div>
        </div>
        <motion.div className="member-card" initial={{ rotateY: -12, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
          <div className="row between">
            <Star size={30} />
            <span className="member-tier">Atelier member</span>
          </div>
          <span className="member-avatar">{initials}</span>
          <div>
            <b>{user!.name}</b>
            <small>{user!.email || user!.phone}</small>
          </div>
          <small>Member since {new Date(user!.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</small>
        </motion.div>
      </section>

      <section className="stats">
        {STATS.map(({ to, Icon, n, label: l }, i) => (
          <motion.div key={l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
            <Link to={to} className="stat">
              <span className="stat-icon"><Icon size={18} /></span>
              <b>{n}</b>
              <span className="small muted">{l}</span>
            </Link>
          </motion.div>
        ))}
      </section>

      <section className="dash-grid">
        <div className="panel dash-card stack gap-16">
          <div className="row between">
            <h2 className="h3">This week</h2>
            <Link to="/planner" className="link small">Open planner</Link>
          </div>
          <div className="mini-week">
            {days.map((d) => {
              const day = app.plan[dateKey(d)];
              const today = dateKey(d) === dateKey(new Date());
              return (
                <Link to="/planner" key={dateKey(d)} className={`mini-week-day ${today ? 'today' : ''}`}>
                  <small>{d.toLocaleDateString('en-GB', { weekday: 'short' })}</small>
                  <b>{d.getDate()}</b>
                  {day?.itemIds?.length ? <Collage itemIds={day.itemIds.slice(0, 2)} /> : <span className="mini-empty">+</span>}
                  {day?.event && <span className="mini-event">{day.event}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="panel dash-card stack gap-12">
          <div className="row between">
            <h2 className="h3">My style</h2>
            <Link to="/style" className="link small">{app.styled ? 'Edit' : 'Take the quiz'}</Link>
          </div>
          {app.styled ? (
            <>
              <div className="profile-row"><span>Shopping</span><b>{app.prefs.department === 'all' ? 'Women & men' : app.prefs.department === 'men' ? 'Menswear' : 'Womenswear'}</b></div>
              <div className="profile-row"><span>Styles</span><span className="chips">{app.prefs.styles.map((s) => <span key={s} className="chip static">{label(STYLES, s)}</span>)}</span></div>
              <div className="profile-row"><span>Colours</span><span className="row gap-4">{app.prefs.colors.map((c) => <i key={c} className="dot-swatch big" title={label(COLORS, c)} style={{ background: COLORS.find((x) => x.key === c)?.swatch }} />)}</span></div>
              <div className="profile-row"><span>Occasions</span><b>{app.prefs.occasions.map((o) => label(OCCASIONS, o)).join(', ') || 'Any'}</b></div>
              <div className="profile-row"><span>Budget</span><b>{money(app.prefs.budget[0])} – {money(app.prefs.budget[1])}</b></div>
            </>
          ) : (
            <p className="small muted">Answer four quick questions and every suggestion fits your style, colours and budget.</p>
          )}
        </div>
      </section>

      <section className="actions">
        {ACTIONS.map(({ to, Icon, title, text }) => (
          <Link key={to} to={to} className="action">
            <span className="feature-icon"><Icon size={19} /></span>
            <span><b>{title}</b><small>{text}</small></span>
          </Link>
        ))}
      </section>

      <section className="stack gap-16">
        <div className="shop-head"><div><h2 className="shop-title">Picked for you</h2><p className="small muted">{app.styled ? 'Ranked for your style profile.' : 'Popular right now. Take the style quiz to personalise this.'}</p></div></div>
        <div className="product-scroller">{picks.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>
      </section>

      {favs.length > 0 && (
        <section className="stack gap-16">
          <div className="shop-head"><div><h2 className="shop-title">Your favourites</h2></div><Link to="/saved" className="link small">View all</Link></div>
          <div className="product-scroller">{favs.slice(0, 12).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>
        </section>
      )}

      <Settings open={settings} onClose={() => setSettings(false)} />
    </div>
  );
}

function Settings({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, updateProfile, deleteAccount } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>();

  const run = async (fn: () => Promise<void>, ok: string) => {
    setMsg(undefined);
    try {
      await fn();
      setMsg({ ok: true, text: ok });
      setPassword('');
      setNewPassword('');
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : 'Something went wrong' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Account settings">
      <div className="stack gap-16">
        <label className="field"><span>Name</span><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="field"><span>Email</span><input className="input" value={user?.email || user?.phone || ''} disabled /></label>
        <button className="btn ghost small" onClick={() => run(() => updateProfile({ name }), 'Name saved')}>Save name</button>
        <hr className="rule" />
        <label className="field"><span>Current password</span><input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label>
        <label className="field"><span>New password</span><input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" placeholder="At least 8 characters" /></label>
        <button className="btn ghost small" disabled={!password || !newPassword} onClick={() => run(() => updateProfile({ password, newPassword }), 'Password changed')}>Change password</button>
        {msg && <div className={msg.ok ? 'note small' : 'error'}>{msg.text}</div>}
        <hr className="rule" />
        {!confirmDelete ? (
          <button className="btn text small danger" onClick={() => setConfirmDelete(true)}><IconUser size={14} /> Delete my account</button>
        ) : (
          <div className="stack gap-8">
            <span className="small">This deletes your account and everything saved in it. Enter your password to confirm.</span>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <button className="btn primary small danger-bg" disabled={!password} onClick={() => run(() => deleteAccount(password), 'Account deleted')}>Delete permanently</button>
          </div>
        )}
      </div>
    </Dialog>
  );
}

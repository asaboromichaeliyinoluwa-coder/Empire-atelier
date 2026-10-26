import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { getStatus } from './api.ts';
import { API_BASE, IS_PREVIEW } from './platform.ts';
import { useApp, type SavedLook } from './store.tsx';

/**
 * Shopper accounts. With a server, accounts live on the server (server/accounts.ts) and each
 * shopper's favourites, looks, bag, planner and style profile sync to it, so they follow the shopper
 * to any device. With no server (the hosted preview), or on Vercel before a database is added,
 * accounts are kept on this device instead, with the same screens.
 */

export type User = { id: string; email: string; phone?: string; name: string; createdAt: number };
export type Providers = { googleClientId: string | null; phone: boolean };
export type Mode = 'server' | 'device';
export type Sync = 'idle' | 'saving' | 'saved' | 'error';

type Synced = {
  name: string; prefs: unknown; styled: boolean; favorites: string[]; looks: SavedLook[];
  bag: string[]; plan: Record<string, unknown>; chat: unknown[]; background: string; updatedAt: number;
};

type Auth = {
  user: User | null;
  /** The log-in token of a server account (used for shop-owner calls). */
  token?: string;
  ready: boolean;
  mode: Mode;
  sync: Sync;
  savedAt?: number;
  /** Which extra sign-in options the server has keys for. */
  providers: Providers;
  googleSignIn: (credential: string) => Promise<void>;
  phoneStart: (phone: string) => Promise<void>;
  phoneVerify: (phone: string, code: string, name?: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => void;
  updateProfile: (patch: { name?: string; password?: string; newPassword?: string }) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
};

const TOKEN_KEY = 'empire-atelier/auth/v1';
const DEVICE_USERS = 'empire-atelier/device-accounts/v1';
const deviceDataKey = (id: string) => `empire-atelier/device-data/${id}`;

const read = <T,>(k: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (k: string, v: unknown) => {
  try {
    if (v === undefined) localStorage.removeItem(k);
    else localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* storage unavailable */
  }
};

/* ---------- Server accounts ---------- */

async function call<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const { token, ...rest } = init;
  const res = await fetch(API_BASE + path, {
    ...rest,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error || `Request failed (${res.status})`), { status: res.status });
  return body as T;
}

/* ---------- Device accounts (no server) ---------- */

type DeviceUser = User & { salt: string; hash: string };

async function pbkdf2(password: string, salt: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: 150_000 }, key, 256);
  return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const pub = ({ id, email, name, createdAt }: DeviceUser): User => ({ id, email, name, createdAt });

/* ---------- Provider ---------- */

const Ctx = createContext<Auth | null>(null);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthProvider({ children }: { children: ReactNode }) {
  const app = useApp();
  const saved = read<{ token?: string; user?: User; mode?: Mode } | null>(TOKEN_KEY, null);
  const [user, setUser] = useState<User | null>(saved?.user ?? null);
  const [token, setToken] = useState<string | undefined>(saved?.token);
  const [mode, setMode] = useState<Mode>(IS_PREVIEW ? 'device' : (saved?.mode ?? 'server'));
  const [ready, setReady] = useState(false);
  const [sync, setSync] = useState<Sync>('idle');
  const [savedAt, setSavedAt] = useState<number>();
  const [providers, setProviders] = useState<Providers>({ googleClientId: null, phone: false });
  const lastPushed = useRef('');

  /** What follows the shopper between devices. Big pictures (try-on photos) stay on the device. */
  const snapshot = (): Synced => ({
    name: app.name, prefs: app.prefs, styled: app.styled, favorites: app.favorites, bag: app.bag, plan: app.plan,
    background: app.background, chat: app.chat.slice(-30),
    looks: app.looks.map((l) => (l.image && l.image.length > 150_000 ? { ...l, image: undefined } : l)),
    updatedAt: Date.now(),
  });

  const apply = (d: Partial<Synced> | null | undefined, merge: boolean) => {
    if (!d) return;
    const union = (a: string[] = [], b: string[] = []) => [...new Set([...a, ...b])];
    const sameItems = (a: SavedLook, b: SavedLook) => [...a.itemIds].sort().join() === [...b.itemIds].sort().join();
    app.update({
      ...(d.name ? { name: d.name } : {}),
      ...(d.prefs && (!merge || d.styled || !app.styled) ? { prefs: d.prefs as typeof app.prefs, styled: !!d.styled || (merge && app.styled) } : {}),
      favorites: merge ? union(d.favorites, app.favorites) : (d.favorites ?? []),
      bag: merge ? union(d.bag, app.bag) : (d.bag ?? []),
      looks: merge ? [...(d.looks ?? []), ...app.looks.filter((l) => !(d.looks ?? []).some((s) => sameItems(s, l)))] : (d.looks ?? []),
      plan: (merge ? { ...app.plan, ...(d.plan ?? {}) } : (d.plan ?? {})) as typeof app.plan,
      ...(d.chat && (!merge || !app.chat.length) ? { chat: d.chat as typeof app.chat } : {}),
      ...(d.background ? { background: d.background as typeof app.background } : {}),
    });
  };

  // On start: check the session and bring in changes made on other devices.
  useEffect(() => {
    let live = true;
    (async () => {
      let m: Mode = IS_PREVIEW ? 'device' : 'server';
      if (!IS_PREVIEW) {
        const st = await getStatus().catch(() => null);
        if (st && (st as { accounts?: string }).accounts === 'none') m = 'device';
        if (st) setProviders({ googleClientId: st.googleClientId ?? null, phone: !!st.phone });
      }
      if (!live) return;
      setMode(m);
      if (saved?.user && saved.mode && saved.mode !== m) return void (logOutLocal(), setReady(true));
      if (m === 'server' && token) {
        try {
          const [{ user: u }, { data }] = await Promise.all([
            call<{ user: User }>('/api/auth/me', { token }),
            call<{ data: Synced | null }>('/api/account/data', { token }),
          ]);
          if (!live) return;
          setUser(u);
          write(TOKEN_KEY, { token, user: u, mode: m });
          const local = read<{ updatedAt?: number }>(`${TOKEN_KEY}/synced`, {});
          if (data && data.updatedAt > (local.updatedAt ?? 0)) apply(data, false);
        } catch (e) {
          if ((e as { status?: number }).status === 401) logOutLocal();
        }
      }
      setReady(true);
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save changes to the account a moment after they happen.
  const snap = JSON.stringify({ ...snapshot(), updatedAt: 0 });
  useEffect(() => {
    if (!ready || !user || snap === lastPushed.current) return;
    const t = setTimeout(async () => {
      lastPushed.current = snap;
      const data = snapshot();
      setSync('saving');
      try {
        if (mode === 'server') await call('/api/account/data', { method: 'PUT', token, body: JSON.stringify({ data }) });
        else write(deviceDataKey(user.id), data);
        write(`${TOKEN_KEY}/synced`, { updatedAt: data.updatedAt });
        setSavedAt(data.updatedAt);
        setSync('saved');
      } catch {
        lastPushed.current = '';
        setSync('error');
      }
    }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap, ready, user, mode, token]);

  function logOutLocal() {
    write(TOKEN_KEY, undefined);
    write(`${TOKEN_KEY}/synced`, undefined);
    setUser(null);
    setToken(undefined);
    setSync('idle');
    lastPushed.current = '';
  }

  const begin = (u: User, t: string | undefined, data: Partial<Synced> | null, merge: boolean) => {
    setUser(u);
    setToken(t);
    write(TOKEN_KEY, { token: t, user: u, mode });
    apply(data, merge);
    if (!app.name || merge) app.update({ name: data?.name || u.name });
  };

  const auth = useMemo<Auth>(
    () => ({
      user,
      token, ready, mode, sync, savedAt, providers,
      googleSignIn: async (credential) => {
        const r = await call<{ token: string; user: User; data: Synced | null }>('/api/auth/google', { method: 'POST', body: JSON.stringify({ credential }) });
        begin(r.user, r.token, r.data, true);
      },
      phoneStart: async (phone) => {
        await call('/api/auth/phone/start', { method: 'POST', body: JSON.stringify({ phone }) });
      },
      phoneVerify: async (phone, code, name) => {
        const r = await call<{ token: string; user: User; data: Synced | null }>('/api/auth/phone/verify', { method: 'POST', body: JSON.stringify({ phone, code, name }) });
        begin(r.user, r.token, r.data, true);
      },
      signUp: async (name, email, password) => {
        if (mode === 'server') {
          const r = await call<{ token: string; user: User }>('/api/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) });
          return begin(r.user, r.token, null, true);
        }
        const users = read<Record<string, DeviceUser>>(DEVICE_USERS, {});
        const e = email.trim().toLowerCase();
        if (!EMAIL.test(e)) throw new Error('Enter a valid email address');
        if (password.length < 8) throw new Error('Use at least 8 characters for your password');
        if (users[e]) throw new Error('An account with this email already exists. Log in instead.');
        const salt = crypto.randomUUID();
        const u: DeviceUser = { id: crypto.randomUUID(), email: e, name: name.trim() || e.split('@')[0], createdAt: Date.now(), salt, hash: await pbkdf2(password, salt) };
        write(DEVICE_USERS, { ...users, [e]: u });
        begin(pub(u), undefined, null, true);
      },
      logIn: async (email, password) => {
        if (mode === 'server') {
          const r = await call<{ token: string; user: User; data: Synced | null }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
          return begin(r.user, r.token, r.data, true);
        }
        const u = read<Record<string, DeviceUser>>(DEVICE_USERS, {})[email.trim().toLowerCase()];
        if (!u || (await pbkdf2(password, u.salt)) !== u.hash) throw new Error('That email and password don’t match');
        begin(pub(u), undefined, read(deviceDataKey(u.id), null), true);
      },
      logOut: () => {
        logOutLocal();
        // The next person on this device starts fresh; everything stays saved in the account.
        app.reset();
      },
      updateProfile: async (patch) => {
        if (!user) return;
        if (mode === 'server') {
          const r = await call<{ user: User }>('/api/auth/profile', { method: 'POST', token, body: JSON.stringify(patch) });
          setUser(r.user);
          write(TOKEN_KEY, { token, user: r.user, mode });
        } else {
          const users = read<Record<string, DeviceUser>>(DEVICE_USERS, {});
          const u = users[user.email];
          if (patch.newPassword) {
            if ((await pbkdf2(patch.password ?? '', u.salt)) !== u.hash) throw new Error('Your current password isn’t right');
            if (patch.newPassword.length < 8) throw new Error('Use at least 8 characters for your new password');
            u.hash = await pbkdf2(patch.newPassword, u.salt);
          }
          if (patch.name?.trim()) u.name = patch.name.trim();
          write(DEVICE_USERS, users);
          setUser(pub(u));
          write(TOKEN_KEY, { user: pub(u), mode });
        }
        if (patch.name?.trim()) app.update({ name: patch.name.trim() });
      },
      deleteAccount: async (password) => {
        if (!user) return;
        if (mode === 'server') await call('/api/auth/delete', { method: 'POST', token, body: JSON.stringify({ password }) });
        else {
          const users = read<Record<string, DeviceUser>>(DEVICE_USERS, {});
          const u = users[user.email];
          if (!u || (await pbkdf2(password, u.salt)) !== u.hash) throw new Error('Your password isn’t right');
          delete users[user.email];
          write(DEVICE_USERS, users);
          write(deviceDataKey(user.id), undefined);
        }
        logOutLocal();
        app.reset();
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, ready, mode, sync, savedAt, token, app, providers],
  );

  return <Ctx.Provider value={auth}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const a = useContext(Ctx);
  if (!a) throw new Error('useAuth must be used inside AuthProvider');
  return a;
}

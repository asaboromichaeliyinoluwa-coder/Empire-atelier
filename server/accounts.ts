/**
 * Shopper accounts: sign up, log in, and each shopper's saved data (favourites, looks, bag, planner,
 * style profile), so it follows them to any device.
 *
 * Storage, chosen from the environment:
 *   - Upstash Redis (KV_REST_API_URL + KV_REST_API_TOKEN, or UPSTASH_REDIS_REST_URL + _TOKEN). Vercel
 *     sets these when you add Upstash Redis from the project's Storage tab. Needed on Vercel.
 *   - Otherwise a JSON file in data/ next to the server (the Windows portable app, `npm start`).
 * Passwords are hashed with scrypt. Sign-in returns a signed token (HMAC-SHA256, 30 days) that the
 * app sends back as `Authorization: Bearer …`.
 */
import { createHmac, randomBytes, randomUUID, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export class AccountError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

type User = { id: string; email: string; phone?: string; name: string; salt: string; hash: string; createdAt: number };
export type PublicUser = { id: string; email: string; phone?: string; name: string; createdAt: number };

interface Store {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  del(key: string): Promise<void>;
}

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

/** Upstash's REST API: one POST per command. */
function redisStore(url: string, token: string): Store {
  const cmd = async (...args: string[]) => {
    const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(args) });
    const body = (await res.json().catch(() => ({}))) as { result?: unknown; error?: string };
    if (!res.ok || body.error) throw new Error(`Redis: ${body.error ?? res.status}`);
    return body.result;
  };
  return {
    get: async (k) => ((await cmd('GET', `ea:${k}`)) as string | null) ?? null,
    set: async (k, v) => void (await cmd('SET', `ea:${k}`, v)),
    del: async (k) => void (await cmd('DEL', `ea:${k}`)),
  };
}

/** One JSON file, written atomically. Fine for a single shop computer. */
function fileStore(dir: string): Store {
  const file = join(dir, 'accounts.json');
  let data: Record<string, string> | undefined;
  const load = () => (data ??= existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {});
  const save = () => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(`${file}.tmp`, JSON.stringify(data));
    renameSync(`${file}.tmp`, file);
  };
  return {
    get: async (k) => load()[k] ?? null,
    set: async (k, v) => { load()[k] = v; save(); },
    del: async (k) => { delete load()[k]; save(); },
  };
}

const ON_VERCEL = !!process.env.VERCEL;
const store: Store | null = REDIS_URL && REDIS_TOKEN
  ? redisStore(REDIS_URL, REDIS_TOKEN)
  : ON_VERCEL ? null : fileStore(process.env.DATA_DIR || join(process.cwd(), 'data'));

/** 'redis' | 'file' | 'none' (Vercel without a database: sign-in is switched off). */
export const accountsMode = () => (REDIS_URL && REDIS_TOKEN ? 'redis' : store ? 'file' : 'none');

export function db(): Store {
  if (!store) throw new AccountError('Accounts need a database on Vercel. Add Upstash Redis in the project’s Storage tab, then redeploy.', 503);
  return store;
}

let secret: Buffer | undefined;
/** AUTH_SECRET if set; otherwise one random secret kept in the store, so tokens survive restarts. */
async function signingKey() {
  if (secret) return secret;
  if (process.env.AUTH_SECRET) return (secret = Buffer.from(process.env.AUTH_SECRET));
  let s = await db().get('auth:secret');
  if (!s) {
    s = randomBytes(32).toString('hex');
    await db().set('auth:secret', s);
  }
  return (secret = Buffer.from(s));
}

const b64 = (b: Buffer | string) => Buffer.from(b).toString('base64url');
const TOKEN_DAYS = 30;

async function sign(uid: string) {
  const payload = b64(JSON.stringify({ uid, exp: Date.now() + TOKEN_DAYS * 864e5 }));
  return `${payload}.${b64(createHmac('sha256', await signingKey()).update(payload).digest())}`;
}

async function verify(token: string): Promise<string | null> {
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const want = createHmac('sha256', await signingKey()).update(payload).digest();
  const got = Buffer.from(sig, 'base64url');
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null;
  const { uid, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
  return typeof uid === 'string' && exp > Date.now() ? uid : null;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normEmail = (e: unknown) => String(e ?? '').trim().toLowerCase();
const publicUser = ({ id, email, phone, name, createdAt }: User): PublicUser => ({ id, email, ...(phone ? { phone } : {}), name, createdAt });

/** True when the password matches. Accounts made with Google or a phone number have no password. */
async function passwordMatches(user: User, password: string) {
  if (!user.hash) return false;
  const got = Buffer.from(await hash(password, Buffer.from(user.salt, 'hex')), 'hex');
  const want = Buffer.from(user.hash, 'hex');
  return got.length === want.length && timingSafeEqual(got, want);
}

async function hash(password: string, salt: Buffer) {
  return (await scrypt(password, salt, 64)).toString('hex');
}

async function userByEmail(email: string): Promise<User | null> {
  const id = await db().get(`email:${email}`);
  return id ? userById(id) : null;
}
async function userById(id: string): Promise<User | null> {
  const raw = await db().get(`user:${id}`);
  return raw ? JSON.parse(raw) : null;
}

// Slows down password guessing: 8 failed attempts per email per 15 minutes.
const failures = new Map<string, { n: number; until: number }>();
function checkThrottle(email: string) {
  const f = failures.get(email);
  if (f && f.n >= 8 && f.until > Date.now()) throw new AccountError('Too many attempts. Please wait 15 minutes and try again.', 429);
}
function noteFailure(email: string) {
  const f = failures.get(email);
  const fresh = !f || f.until < Date.now();
  failures.set(email, { n: fresh ? 1 : f.n + 1, until: Date.now() + 15 * 60e3 });
}

export async function signUp(body: any) {
  const email = normEmail(body?.email);
  const name = String(body?.name ?? '').trim().slice(0, 60);
  const password = String(body?.password ?? '');
  if (!EMAIL.test(email)) throw new AccountError('Enter a valid email address');
  if (password.length < 8) throw new AccountError('Use at least 8 characters for your password');
  if (await userByEmail(email)) throw new AccountError('An account with this email already exists. Log in instead.', 409);
  const salt = randomBytes(16);
  const user: User = { id: randomUUID(), email, name: name || email.split('@')[0], salt: salt.toString('hex'), hash: await hash(password, salt), createdAt: Date.now() };
  await db().set(`user:${user.id}`, JSON.stringify(user));
  await db().set(`email:${email}`, user.id);
  return { token: await sign(user.id), user: publicUser(user), data: null };
}

export async function logIn(body: any) {
  const email = normEmail(body?.email);
  checkThrottle(email);
  const user = await userByEmail(email);
  const ok = user && (await passwordMatches(user, String(body?.password ?? '')));
  if (!user || !ok) {
    noteFailure(email);
    throw new AccountError('That email and password don’t match', 401);
  }
  failures.delete(email);
  return { token: await sign(user.id), user: publicUser(user), data: await getData(user.id) };
}

/** The signed-in user for a request, from its bearer token. */
export async function currentUser(authorization: string | undefined): Promise<User> {
  const token = /^Bearer (.+)$/.exec(authorization ?? '')?.[1];
  const uid = token ? await verify(token).catch(() => null) : null;
  const user = uid ? await userById(uid) : null;
  if (!user) throw new AccountError('Please log in again', 401);
  return user;
}

export const me = async (auth?: string) => publicUser(await currentUser(auth));

async function getData(uid: string) {
  const raw = await db().get(`data:${uid}`);
  return raw ? JSON.parse(raw) : null;
}

const MAX_DATA = 900_000;
export async function loadData(auth?: string) {
  return getData((await currentUser(auth)).id);
}

export async function saveData(auth: string | undefined, data: unknown) {
  const user = await currentUser(auth);
  const raw = JSON.stringify(data ?? {});
  if (raw.length > MAX_DATA) throw new AccountError('Saved data is too large', 413);
  await db().set(`data:${user.id}`, raw);
  return { savedAt: Date.now() };
}

export async function updateProfile(auth: string | undefined, body: any) {
  const user = await currentUser(auth);
  const name = String(body?.name ?? '').trim().slice(0, 60);
  if (name) user.name = name;
  if (body?.newPassword) {
    // A Google or phone account can set its first password without one.
    if (user.hash && !(await passwordMatches(user, String(body.password ?? '')))) throw new AccountError('Your current password isn’t right', 401);
    if (String(body.newPassword).length < 8) throw new AccountError('Use at least 8 characters for your new password');
    const salt = randomBytes(16);
    user.salt = salt.toString('hex');
    user.hash = await hash(String(body.newPassword), salt);
  }
  await db().set(`user:${user.id}`, JSON.stringify(user));
  return publicUser(user);
}

export async function deleteAccount(auth: string | undefined, body: any) {
  const user = await currentUser(auth);
  if (user.hash && !(await passwordMatches(user, String(body?.password ?? '')))) throw new AccountError('Your password isn’t right', 401);
  await db().del(`data:${user.id}`);
  if (user.email) await db().del(`email:${user.email}`);
  if (user.phone) await db().del(`phone:${user.phone}`);
  await db().del(`user:${user.id}`);
  return { deleted: true };
}

/* ---------- Sign in with Google ---------- */

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim();
const TWILIO = { sid: process.env.TWILIO_ACCOUNT_SID?.trim(), token: process.env.TWILIO_AUTH_TOKEN?.trim(), verify: process.env.TWILIO_VERIFY_SERVICE_SID?.trim() };

/** What the sign-in screen can offer. The Google client id is public; the Twilio secrets never leave the server. */
export const providers = () => ({ googleClientId: GOOGLE_CLIENT_ID ?? null, phone: !!(TWILIO.sid && TWILIO.token && TWILIO.verify) });

async function newSocialUser(fields: { email?: string; phone?: string; name: string }) {
  const user: User = { id: randomUUID(), email: fields.email ?? '', phone: fields.phone, name: fields.name, salt: '', hash: '', createdAt: Date.now() };
  await db().set(`user:${user.id}`, JSON.stringify(user));
  if (user.email) await db().set(`email:${user.email}`, user.id);
  if (user.phone) await db().set(`phone:${user.phone}`, user.id);
  return user;
}

/** Checks a Google ID token with Google and signs the person in, creating the account on first use. */
export async function googleLogin(body: any) {
  if (!GOOGLE_CLIENT_ID) throw new AccountError('Sign in with Google isn’t set up yet. Add GOOGLE_CLIENT_ID on the server.', 503);
  const credential = String(body?.credential ?? '');
  if (!credential) throw new AccountError('Missing Google sign-in');
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
  const info = (await res.json().catch(() => ({}))) as { aud?: string; email?: string; email_verified?: string | boolean; name?: string; given_name?: string; exp?: string };
  if (!res.ok || info.aud !== GOOGLE_CLIENT_ID || !info.email || String(info.email_verified) !== 'true') {
    throw new AccountError('Google couldn’t confirm that sign-in. Please try again.', 401);
  }
  const email = normEmail(info.email);
  const user = (await userByEmail(email)) ?? (await newSocialUser({ email, name: info.name || info.given_name || email.split('@')[0] }));
  return { token: await sign(user.id), user: publicUser(user), data: await getData(user.id) };
}

/* ---------- Sign in with a phone number (SMS code through Twilio Verify) ---------- */

const e164 = (raw: unknown) => {
  const digits = String(raw ?? '').replace(/[^\d+]/g, '');
  const n = digits.startsWith('+') ? digits : digits.startsWith('00') ? `+${digits.slice(2)}` : '';
  if (!/^\+[1-9]\d{7,14}$/.test(n)) throw new AccountError('Enter your number with the country code, like +234 801 234 5678');
  return n;
};

async function twilio(path: string, form: Record<string, string>) {
  if (!(TWILIO.sid && TWILIO.token && TWILIO.verify)) throw new AccountError('Sign in with a phone number isn’t set up yet. Add the Twilio keys on the server.', 503);
  const res = await fetch(`https://verify.twilio.com/v2/Services/${TWILIO.verify}/${path}`, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${TWILIO.sid}:${TWILIO.token}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(form),
  });
  return { ok: res.ok, status: res.status, body: (await res.json().catch(() => ({}))) as { status?: string; message?: string; code?: number } };
}

const sends = new Map<string, number[]>();

/** Texts a 6-digit code to the number. */
export async function phoneStart(body: any) {
  const to = e164(body?.phone);
  const recent = (sends.get(to) ?? []).filter((t) => t > Date.now() - 10 * 60e3);
  if (recent.length >= 5) throw new AccountError('Too many codes requested. Please wait 10 minutes.', 429);
  sends.set(to, [...recent, Date.now()]);
  const r = await twilio('Verifications', { To: to, Channel: 'sms' });
  if (!r.ok) {
    console.error('Twilio send failed', r.status, r.body);
    if (r.body.code === 60200 || r.body.code === 21211) throw new AccountError('That phone number doesn’t look right.');
    if (r.body.code === 21608 || r.status === 403) throw new AccountError('Your Twilio trial can only text numbers you’ve verified in Twilio. Verify this number there, or upgrade the account.', 403);
    throw new AccountError('We couldn’t send the code. Please check the number and try again.', 502);
  }
  return { sent: true, phone: to };
}

/** Checks the code and signs the person in, creating the account on first use. */
export async function phoneVerify(body: any) {
  const phone = e164(body?.phone);
  const code = String(body?.code ?? '').replace(/\D/g, '');
  if (code.length < 4) throw new AccountError('Enter the code from the text message');
  checkThrottle(phone);
  const r = await twilio('VerificationCheck', { To: phone, Code: code });
  if (!r.ok || r.body.status !== 'approved') {
    noteFailure(phone);
    throw new AccountError(r.status === 404 ? 'That code has expired. Ask for a new one.' : 'That code isn’t right', 401);
  }
  failures.delete(phone);
  const id = await db().get(`phone:${phone}`);
  const user = (id ? await userById(id) : null) ?? (await newSocialUser({ phone, name: String(body?.name ?? '').trim().slice(0, 60) || 'Member' }));
  return { token: await sign(user.id), user: publicUser(user), data: await getData(user.id) };
}

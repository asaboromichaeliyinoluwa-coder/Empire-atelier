import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { PRICE_MAX, type Occasion } from '../shared/catalog.ts';
import type { Preferences } from '../shared/outfits.ts';
import type { ChatTurn } from '../shared/stylist.ts';

export type SavedLook = {
  id: string;
  name: string;
  itemIds: string[];
  occasion?: Occasion;
  /** Try-on picture of the look, if one was made. */
  image?: string;
  createdAt: number;
};

/** One day in the outfit planner, keyed by its date (YYYY-MM-DD). */
export type PlanDay = {
  /** What's on that day, e.g. "Client pitch" or "Tolu's wedding". */
  event?: string;
  occasion?: Occasion;
  itemIds?: string[];
  lookName?: string;
};

/** A picture from the AI clothes changer. */
export type ChangedLook = { id: string; style: string; image: string; createdAt: number };

export const BACKGROUNDS = [
  { id: 'clean', label: 'Clean white' },
  { id: 'stars', label: 'Star pattern' },
  { id: 'linen', label: 'Brown to cream' },
  { id: 'plain', label: 'Plain cream' },
] as const;
export type BackgroundId = (typeof BACKGROUNDS)[number]['id'];

type State = {
  name: string;
  prefs: Preferences;
  /** True once the shopper has been through the style quiz. */
  styled: boolean;
  favorites: string[];
  looks: SavedLook[];
  /** The shopper's last try-on photo (or 'sample' for the mannequin), so they don't re-upload for every piece. */
  photo?: string;
  background: BackgroundId;
  plan: Record<string, PlanDay>;
  chat: ChatTurn[];
  changes: ChangedLook[];
  /** Pieces in the shopping bag, bought from each seller's own shop. */
  bag: string[];
  /** Storefront design the saved state was made under; older states move to the clean background once. */
  design?: number;
};

type Store = State & {
  update: (patch: Partial<State>) => void;
  setPrefs: (patch: Partial<Preferences>) => void;
  toggleFavorite: (id: string) => void;
  saveLook: (look: Omit<SavedLook, 'id' | 'createdAt'>) => SavedLook;
  updateLook: (id: string, patch: Partial<SavedLook>) => void;
  removeLook: (id: string) => void;
  isLookSaved: (itemIds: string[]) => SavedLook | undefined;
  /** Sets (or with `undefined`, clears) a planner day. */
  planDay: (date: string, day: PlanDay | undefined) => void;
  addChange: (c: Omit<ChangedLook, 'id' | 'createdAt'>) => void;
  removeChange: (id: string) => void;
  toggleBag: (id: string) => void;
  reset: () => void;
};

const KEY = 'empire-atelier/state/v3';
const initial: State = {
  name: '',
  prefs: { department: 'all', styles: [], colors: [], occasions: [], budget: [0, PRICE_MAX] },
  styled: false,
  favorites: [],
  looks: [],
  background: 'clean',
  plan: {},
  chat: [],
  changes: [],
  bag: [],
  design: 2,
};

const sameItems = (a: string[], b: string[]) => a.length === b.length && [...a].sort().join() === [...b].sort().join();

const Ctx = createContext<Store | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const fresh = saved.design === initial.design ? {} : { background: initial.background, design: initial.design };
        return { ...initial, ...saved, ...fresh, prefs: { ...initial.prefs, ...saved.prefs } };
      }
    } catch {
      // Private mode or blocked storage: start fresh.
    }
    return initial;
  });
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // Over quota (photos are large): keep everything but the pictures.
      try {
        localStorage.setItem(KEY, JSON.stringify({ ...state, photo: undefined, changes: [], looks: state.looks.map(({ image: _i, ...l }) => l) }));
      } catch {
        /* storage unavailable */
      }
    }
  }, [state]);

  const store = useMemo<Store>(
    () => ({
      ...state,
      update: (patch) => setState((s) => ({ ...s, ...patch })),
      setPrefs: (patch) => setState((s) => ({ ...s, prefs: { ...s.prefs, ...patch } })),
      toggleFavorite: (id) =>
        setState((s) => ({
          ...s,
          favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [id, ...s.favorites],
        })),
      saveLook: (look) => {
        const existing = state.looks.find((l) => sameItems(l.itemIds, look.itemIds));
        const saved = { ...existing, ...look, id: existing?.id ?? `${Date.now()}`, createdAt: existing?.createdAt ?? Date.now() };
        setState((s) => ({ ...s, looks: [saved, ...s.looks.filter((l) => l.id !== saved.id)] }));
        return saved;
      },
      updateLook: (id, patch) => setState((s) => ({ ...s, looks: s.looks.map((l) => (l.id === id ? { ...l, ...patch } : l)) })),
      removeLook: (id) => setState((s) => ({ ...s, looks: s.looks.filter((l) => l.id !== id) })),
      isLookSaved: (itemIds) => state.looks.find((l) => sameItems(l.itemIds, itemIds)),
      planDay: (date, day) =>
        setState((s) => {
          const plan = { ...s.plan };
          if (day) plan[date] = day;
          else delete plan[date];
          return { ...s, plan };
        }),
      addChange: (c) =>
        setState((s) => ({ ...s, changes: [{ ...c, id: `${Date.now()}`, createdAt: Date.now() }, ...s.changes].slice(0, 8) })),
      removeChange: (id) => setState((s) => ({ ...s, changes: s.changes.filter((c) => c.id !== id) })),
      toggleBag: (id) => setState((s) => ({ ...s, bag: s.bag.includes(id) ? s.bag.filter((b) => b !== id) : [...s.bag, id] })),
      reset: () => setState(initial),
    }),
    [state],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useApp() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useApp must be used inside AppStoreProvider');
  return s;
}

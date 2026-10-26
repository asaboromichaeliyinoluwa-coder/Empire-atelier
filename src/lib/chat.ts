import { useState } from 'react';

import { OCCASIONS } from '../shared/catalog.ts';
import type { ChatTurn, StylistContext } from '../shared/stylist.ts';
import { askStylist } from './api.ts';
import { dateKey, fromKey } from './planner.ts';
import { useApp } from './store.tsx';

export const PROMPTS = {
  women: ['What should I wear to a wedding under $400?', 'Build me a work outfit in neutrals', 'Date night look in black', 'A weekend brunch outfit'],
  men: ['What should I wear to an owambe?', 'A sharp interview outfit under $500', 'Smart-casual dinner date look', 'Linen outfit for a beach trip'],
};

/** The stylist conversation, shared by the stylist page and the chat bubble. */
export function useStylistChat() {
  const app = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const context = (): StylistContext => {
    const today = dateKey(new Date());
    const plan = Object.entries(app.plan)
      .filter(([k, d]) => k >= today && (d.event || d.occasion))
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 7)
      .map(([k, d]) => `${fromKey(k).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}: ${d.event || 'no event'} (${OCCASIONS.find((o) => o.key === d.occasion)?.label ?? 'any'})`);
    return { name: app.name, prefs: app.prefs, favorites: app.favorites, looks: app.looks.map((l) => ({ name: l.name, itemIds: l.itemIds })), plan };
  };

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    const history: ChatTurn[] = [...app.chat, { role: 'user', text: t }];
    app.update({ chat: history });
    setBusy(true);
    setError(undefined);
    try {
      const reply = await askStylist(history.slice(-16), context());
      app.update({ chat: [...history, { role: 'assistant', text: reply }] });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The stylist is unavailable. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const d = app.prefs.department;
  const prompts = d === 'men' ? PROMPTS.men : d === 'women' ? PROMPTS.women : [PROMPTS.women[0], PROMPTS.men[0], PROMPTS.women[1], PROMPTS.men[1]];

  return { chat: app.chat, busy, error, send, prompts, clear: () => app.update({ chat: [] }) };
}

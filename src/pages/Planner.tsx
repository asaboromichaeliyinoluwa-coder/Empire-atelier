import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { BudgetCards } from '../components/Options.tsx';
import { DepartmentSwitch } from '../components/Layout.tsx';
import { IconArrow, IconBack, IconCalendar, IconClose, IconSparkle } from '../components/icons.tsx';
import { Collage, money } from '../components/ui.tsx';
import { dateKey, defaultOccasion, planLooks, weekDays, weekStart } from '../lib/planner.ts';
import { useApp, type PlanDay } from '../lib/store.tsx';
import { OCCASIONS, productById, type Occasion, type Product } from '../shared/catalog.ts';

const OUTFIT_CAPS = [0, 150, 250, 400];

export default function Planner() {
  const app = useApp();
  const navigate = useNavigate();
  const [offset, setOffset] = useState(0);
  const [cap, setCap] = useState(0);
  const [skips, setSkips] = useState<Record<string, number>>({});
  const today = dateKey(new Date());

  const start = weekStart(new Date(), offset);
  const days = weekDays(start);
  const keys = days.map(dateKey);
  const occasionOf = (d: Date) => app.plan[dateKey(d)]?.occasion ?? defaultOccasion(d);

  const planned = keys.map((k) => app.plan[k]).filter((d) => d?.itemIds?.length) as PlanDay[];
  // Pieces worn more than once that week are bought once.
  const pieces = [...new Set(planned.flatMap((d) => d.itemIds!))].map(productById).filter(Boolean) as Product[];
  const weekTotal = pieces.reduce((s, p) => s + p.price, 0);

  const range = `${start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} – ${days[6].toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const fill = (all: boolean) => {
    const looks = planLooks(
      app.prefs,
      days.map((d) => ({ key: dateKey(d), occasion: occasionOf(d), current: app.plan[dateKey(d)] })),
      { keep: !all, maxTotal: cap || undefined },
    );
    for (const [key, look] of Object.entries(looks)) {
      const current = app.plan[key];
      app.planDay(key, { ...current, occasion: current?.occasion ?? look?.occasion, itemIds: look?.itemIds, lookName: look?.name });
    }
  };

  const swap = (d: Date) => {
    const key = dateKey(d);
    const skip = (skips[key] ?? 0) + 1;
    setSkips({ ...skips, [key]: skip });
    // Avoid the other days' main pieces, then take the next candidate along.
    const others = days.filter((x) => dateKey(x) !== key).map((x) => ({ key: dateKey(x), occasion: occasionOf(x), current: app.plan[dateKey(x)] }));
    const look = planLooks(app.prefs, [...others, { key, occasion: occasionOf(d), skip }], { keep: true, maxTotal: cap || undefined })[key];
    app.planDay(key, { ...app.plan[key], itemIds: look?.itemIds, lookName: look?.name });
  };

  const setOccasion = (d: Date, occasion: Occasion) => {
    const key = dateKey(d);
    const look = planLooks(app.prefs, [{ key, occasion }], { maxTotal: cap || undefined })[key];
    app.planDay(key, { ...app.plan[key], occasion, itemIds: look?.itemIds, lookName: look?.name });
  };

  const wearSaved = (d: Date, id: string) => {
    const look = app.looks.find((l) => l.id === id);
    if (look) app.planDay(dateKey(d), { ...app.plan[dateKey(d)], itemIds: look.itemIds, lookName: look.name });
  };

  const emptyDays = useMemo(() => keys.filter((k) => !app.plan[k]?.itemIds?.length).length, [keys, app.plan]);

  return (
    <div className="container stack gap-24">
      <div className="page-head">
        <span className="eyebrow">Smart outfit planner</span>
        <h1 className="h1">Plan your week</h1>
        <p className="lead">
          Add what's on each day and we'll dress you for it: matched to the occasion, inside your budget, and never the
          same main piece twice in a week.
        </p>
      </div>

      <div className="panel planner-bar">
        <div className="row gap-8 week-nav">
          <button className="icon-btn" onClick={() => setOffset(offset - 1)} aria-label="Previous week"><IconBack size={18} /></button>
          <div className="stack">
            <b className="h3">{offset === 0 ? 'This week' : offset === 1 ? 'Next week' : offset === -1 ? 'Last week' : 'Week of'}</b>
            <span className="small muted">{range}</span>
          </div>
          <button className="icon-btn" onClick={() => setOffset(offset + 1)} aria-label="Next week"><IconArrow size={18} /></button>
        </div>
        <div className="stack gap-8">
          <span className="small muted">Dressing</span>
          <DepartmentSwitch />
        </div>
        <div className="stack gap-8">
          <span className="small muted">Per outfit</span>
          <BudgetCards compact options={OUTFIT_CAPS} value={cap} onChange={setCap} />
        </div>
        <div className="row gap-8 wrap planner-actions">
          <button className="btn primary" onClick={() => fill(false)} disabled={!emptyDays}>
            <IconSparkle size={16} /> {emptyDays === 7 ? 'Plan my week' : emptyDays ? `Fill ${emptyDays} empty ${emptyDays === 1 ? 'day' : 'days'}` : 'Week planned'}
          </button>
          {emptyDays < 7 && <button className="btn ghost" onClick={() => fill(true)}>Re-plan all</button>}
        </div>
      </div>

      <div className="week">
        {days.map((d, i) => {
          const key = dateKey(d);
          const day = app.plan[key];
          const items = (day?.itemIds ?? []).map(productById).filter(Boolean) as Product[];
          const total = items.reduce((s, p) => s + p.price, 0);
          return (
            <motion.article key={key} className={`day panel ${key === today ? 'today' : ''}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <header className="day-head">
                <div>
                  <span className="eyebrow">{d.toLocaleDateString(undefined, { weekday: 'long' })}</span>
                  <div className="day-date">{d.getDate()}</div>
                </div>
                {key === today && <span className="badge">Today</span>}
              </header>
              <input
                className="input day-event"
                placeholder="What’s on?"
                value={day?.event ?? ''}
                maxLength={60}
                onChange={(e) => app.planDay(key, { ...day, occasion: day?.occasion ?? occasionOf(d), event: e.target.value })}
              />
              <select className="day-occasion" value={occasionOf(d)} onChange={(e) => setOccasion(d, e.target.value as Occasion)} aria-label="Occasion">
                {OCCASIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
              {items.length ? (
                <>
                  <Link to={`/look?items=${day!.itemIds!.join(',')}&name=${encodeURIComponent(day?.lookName ?? 'Planned look')}&occasion=${occasionOf(d)}`} className="day-look">
                    <Collage itemIds={day!.itemIds!} />
                  </Link>
                  <div className="row between">
                    <span className="small day-name">{day?.lookName ?? 'Planned look'}</span>
                    <span className="price small">{money(total)}</span>
                  </div>
                  <div className="row gap-4 wrap">
                    <button className="btn text small" onClick={() => swap(d)}>Swap</button>
                    {items.some((p) => p.garment) && <button className="btn text small" onClick={() => navigate(`/try-on?items=${day!.itemIds!.join(',')}`)}>Try on</button>}
                    <button className="icon-btn" onClick={() => app.planDay(key, { ...day, itemIds: undefined, lookName: undefined })} aria-label="Clear look"><IconClose size={15} /></button>
                  </div>
                </>
              ) : (
                <div className="day-empty">
                  <IconCalendar size={22} />
                  <span className="small muted">No look yet</span>
                  <button className="btn ghost small" onClick={() => swap(d)}>Suggest one</button>
                </div>
              )}
              {app.looks.length > 0 && (
                <select className="day-saved" value="" onChange={(e) => wearSaved(d, e.target.value)} aria-label="Wear a saved look">
                  <option value="">Wear a saved look…</option>
                  {app.looks.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              )}
            </motion.article>
          );
        })}
      </div>

      <div className="panel week-summary">
        <div className="stack gap-4">
          <span className="eyebrow">This week's wardrobe</span>
          <span className="h3">{planned.length} of 7 days planned · {pieces.length} pieces</span>
          <span className="small muted">Buying everything you don't already own comes to <b>{money(weekTotal)}</b>. Pieces worn twice are counted once.</span>
        </div>
        <div className="row gap-8 wrap">
          <Link to="/report" className="btn ghost">Download my plan (PDF)</Link>
          <Link to="/stylist" className="btn text">Ask the stylist</Link>
        </div>
      </div>
    </div>
  );
}

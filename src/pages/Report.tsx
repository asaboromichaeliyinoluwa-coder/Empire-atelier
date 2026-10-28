import { useState } from 'react';
import { Link } from 'react-router-dom';

import { IconCalendar, IconCheck, IconDownload, IconFile, IconHeart, IconUser, IconWand, Star } from '../components/icons.tsx';
import { saveFile } from '../lib/platform.ts';
import { dateKey, weekStart } from '../lib/planner.ts';
import { useApp } from '../lib/store.tsx';

export default function Report() {
  const app = useApp();
  const [name, setName] = useState(app.name);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string>();

  // This week (from Monday) onwards.
  const from = dateKey(weekStart(new Date()));
  const plan = Object.entries(app.plan)
    .filter(([k, d]) => k >= from && d.itemIds?.length)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 14);

  const sections = [
    { Icon: IconUser, title: 'Style profile', detail: app.styled ? 'Your department, styles, colours, occasions and budget' : 'Set your style for a fuller report', ok: app.styled, to: '/style' },
    { Icon: IconCalendar, title: 'Outfit plan', detail: plan.length ? `${plan.length} planned ${plan.length === 1 ? 'day' : 'days'}` : 'Plan your week to include it', ok: plan.length > 0, to: '/planner' },
    { Icon: IconHeart, title: 'Saved looks and favourites', detail: `${app.looks.length} looks, ${app.favorites.length} pieces`, ok: app.looks.length + app.favorites.length > 0, to: '/saved' },
    { Icon: Star, title: 'Outfits picked for you', detail: 'Three complete looks from your preferences', ok: true, to: '/outfits' },
    { Icon: IconWand, title: 'Clothes changer gallery', detail: app.changes.length ? `${app.changes.length} pictures` : 'Keep a changed look to include it', ok: app.changes.length > 0, to: '/changer' },
    { Icon: IconFile, title: 'Shopping list by seller', detail: 'Prices, delivery, returns and retailer links', ok: true, to: '/sellers' },
  ];

  const download = async () => {
    setBusy(true);
    setError(undefined);
    try {
      if (name.trim() !== app.name) app.update({ name: name.trim() });
      const { buildReport } = await import('../lib/report.ts');
      const blob = await buildReport({ name, prefs: app.prefs, favorites: app.favorites, looks: app.looks, plan, changes: app.changes });
      await saveFile(`Empire-Glamour-Style-Report${name.trim() ? `-${name.trim().replace(/\W+/g, '-')}` : ''}.pdf`, blob);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The report could not be created.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container narrow stack gap-24">
      <div className="page-head">
        <span className="eyebrow">Downloadable report</span>
        <h1 className="h1">Your style report</h1>
        <p className="lead">A PDF of everything you've put together: your profile, your week of outfits, saved looks and a shopping list with links to each seller.</p>
      </div>

      <section className="report-cover">
        <Star size={54} />
        <span className="report-word">Empire Glamour</span>
        <span className="report-title">Personal Style Report</span>
        <input className="input report-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name on the report" maxLength={40} aria-label="Name on the report" />
      </section>

      <section className="panel report-sections">
        {sections.map(({ Icon, title, detail, ok, to }) => (
          <Link key={title} to={to} className={`report-row ${ok ? '' : 'pending'}`}>
            <span className="feature-icon"><Icon size={18} /></span>
            <span className="grow stack">
              <b>{title}</b>
              <span className="small muted">{detail}</span>
            </span>
            {ok && <IconCheck size={18} className="gold" />}
          </Link>
        ))}
      </section>

      {error && <div className="error">{error}</div>}
      <div className="row gap-12 sticky-actions">
        <button className="btn primary grow" onClick={download} disabled={busy}>
          {busy ? <><div className="spinner small-spin" /> Creating your report…</> : <><IconDownload size={16} /> Download PDF</>}
        </button>
        {done && <span className="small muted">Saved to your downloads.</span>}
      </div>
    </div>
  );
}

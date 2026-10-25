import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { IconArrow } from '../components/icons.tsx';
import { Empty, LookCard, money } from '../components/ui.tsx';
import { useApp } from '../lib/store.tsx';
import { COLORS, OCCASIONS, STYLES, type Occasion } from '../shared/catalog.ts';
import { editorsLooks, suggestOutfits } from '../shared/outfits.ts';
import { DepartmentSwitch } from '../components/Layout.tsx';

const TOTALS = [200, 300, 400, 600, 0];

export default function Outfits() {
  const { prefs, styled } = useApp();
  const [occasion, setOccasion] = useState<Occasion | undefined>(prefs.occasions.length === 1 ? prefs.occasions[0] : undefined);
  const [maxTotal, setMaxTotal] = useState(0);

  const looks = useMemo(
    () => suggestOutfits(prefs, { occasion, maxTotal: maxTotal || undefined, limit: 12 }),
    [prefs, occasion, maxTotal],
  );
  const editors = editorsLooks(prefs.department).filter((o) => (!occasion || o.occasion === occasion) && (!maxTotal || o.total <= maxTotal));
  const summary = [
    ...prefs.styles.map((s) => STYLES.find((x) => x.key === s)?.label),
    ...prefs.colors.map((c) => COLORS.find((x) => x.key === c)?.label),
  ].filter(Boolean);

  return (
    <div className="container stack gap-32">
      <div className="page-head">
        <span className="eyebrow">Outfit suggestions</span>
        <h1 className="h1">What to wear</h1>
        <p className="lead">
          Complete looks, put together from the collection and checked so the colours work.
          {styled && summary.length > 0 && <> Picked for <b>{summary.join(', ')}</b>, {prefs.budget[1] < 10_000 ? `up to ${money(prefs.budget[1])} a piece` : 'any budget'}.</>}
        </p>
        {styled ? (
          <Link to="/style" className="link small">Edit my style <IconArrow size={13} /></Link>
        ) : (
          <Link to="/style" className="banner panel">
            <span><b>Get looks that fit you.</b> Set your favourite styles, colours, occasions and budget.</span>
            <IconArrow size={18} />
          </Link>
        )}
      </div>

      <div className="panel stack gap-16 outfit-filters">
        <div className="stack gap-8">
          <span className="small muted">For</span>
          <DepartmentSwitch />
        </div>
        <div className="stack gap-8">
          <span className="small muted">Occasion</span>
          <div className="chips">
            <button className={`chip ${!occasion ? 'on' : ''}`} onClick={() => setOccasion(undefined)}>{styled && prefs.occasions.length ? 'My occasions' : 'Any'}</button>
            {OCCASIONS.map((o) => (
              <button key={o.key} className={`chip ${occasion === o.key ? 'on' : ''}`} onClick={() => setOccasion(o.key)}>{o.label}</button>
            ))}
          </div>
        </div>
        <div className="stack gap-8">
          <span className="small muted">Whole outfit budget</span>
          <div className="chips">
            {TOTALS.map((t) => (
              <button key={t} className={`chip ${maxTotal === t ? 'on' : ''}`} onClick={() => setMaxTotal(t)}>{t ? `Under ${money(t)}` : 'Any total'}</button>
            ))}
          </div>
        </div>
      </div>

      <section className="stack gap-20">
        <h2 className="h2">{styled ? 'Suggested for you' : 'Suggested looks'}</h2>
        {looks.length ? (
          <div className="look-grid">{looks.map((o, i) => <LookCard key={o.id} outfit={o} index={i} />)}</div>
        ) : (
          <Empty title="No complete looks fit those limits">
            <p className="small muted">Raise the outfit budget, or widen your price range in My style.</p>
          </Empty>
        )}
      </section>

      {editors.length > 0 && (
        <section className="stack gap-20">
          <h2 className="h2">Editors’ looks</h2>
          <div className="look-grid">{editors.map((o, i) => <LookCard key={o.id} outfit={o} index={i} />)}</div>
        </section>
      )}
    </div>
  );
}

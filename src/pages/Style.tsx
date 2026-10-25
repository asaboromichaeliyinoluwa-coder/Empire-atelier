import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { IconCheck } from '../components/icons.tsx';
import { PriceRange } from '../components/ui.tsx';
import { BACKGROUNDS, useApp } from '../lib/store.tsx';
import { COLORS, DEPARTMENTS, OCCASIONS, PRICE_MAX, STYLES } from '../shared/catalog.ts';
import { garmentSvg, svgDataUri, type GarmentKind } from '../shared/garments.ts';

const MEN_ART: Record<string, [GarmentKind, string]> = {
  minimal: ['tee', '#efe6da'],
  classic: ['blazer', '#26304a'],
  glam: ['agbada', '#f2eadc'],
  boho: ['kaftan', '#93a68f'],
  street: ['bomber', '#1e1c20'],
};

const STYLE_ART: Record<string, [GarmentKind, string]> = {
  romantic: ['midi-dress', '#e7a3b3'],
  minimal: ['slip-dress', '#efe6da'],
  classic: ['blazer', '#2a2629'],
  glam: ['gown', '#c9a96e'],
  boho: ['gown', '#c4724e'],
  street: ['jeans', '#5878a0'],
};

function toggle<T>(list: T[], v: T) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

export default function Style() {
  const app = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState(app.name);
  const [prefs, setPrefs] = useState(app.prefs);

  const save = () => {
    app.update({ name: name.trim(), prefs, styled: true });
    navigate('/outfits');
  };

  return (
    <div className="container narrow stack gap-32">
      <div className="page-head">
        <span className="eyebrow">Style preferences</span>
        <h1 className="h1">Tell us your style</h1>
        <p className="lead">We use this to sort the shop and suggest outfits. Change it any time.</p>
      </div>

      <section className="panel stack gap-12">
        <h2 className="h3">What should we call you?</h2>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your first name" maxLength={40} />
      </section>

      <section className="panel stack gap-16">
        <div>
          <h2 className="h3">Who are you shopping for?</h2>
          <p className="small muted">Womenswear, menswear, or both. You can switch any time from the top of the page.</p>
        </div>
        <div className="tabs big">
          {DEPARTMENTS.map((d) => (
            <button key={d.key} className={prefs.department === d.key ? 'on' : ''} onClick={() => setPrefs({ ...prefs, department: d.key })}>{d.key === 'all' ? 'Both' : d.label}</button>
          ))}
        </div>
      </section>

      <section className="panel stack gap-16">
        <div>
          <h2 className="h3">Styles you love</h2>
          <p className="small muted">Pick as many as you like.</p>
        </div>
        <div className="style-cards">
          {STYLES.filter((s) => prefs.department !== 'men' || !s.women).map((s) => {
            const on = prefs.styles.includes(s.key);
            const [kind, color] = (prefs.department === 'men' && MEN_ART[s.key]) || STYLE_ART[s.key];
            return (
              <button key={s.key} className={`style-card ${on ? 'on' : ''}`} onClick={() => setPrefs({ ...prefs, styles: toggle(prefs.styles, s.key) })} aria-pressed={on}>
                <img src={svgDataUri(garmentSvg(kind, color, prefs.department !== 'men' && s.key === 'boho' ? 'stripe' : s.key === 'romantic' ? 'floral' : undefined))} alt="" />
                <b>{s.label}</b>
                <span className="small muted">{s.blurb}</span>
                {on && <span className="pick-check"><IconCheck size={12} /></span>}
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel stack gap-16">
        <h2 className="h3">Favourite colours</h2>
        <div className="swatches big">
          {COLORS.map((c) => {
            const on = prefs.colors.includes(c.key);
            return (
              <button key={c.key} className={`swatch ${on ? 'on' : ''}`} style={{ ['--sw' as string]: c.swatch }} onClick={() => setPrefs({ ...prefs, colors: toggle(prefs.colors, c.key) })} aria-pressed={on}>
                <span />
                <small>{c.label}</small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel stack gap-16">
        <h2 className="h3">Occasions you dress for</h2>
        <div className="chips">
          {OCCASIONS.map((o) => (
            <button key={o.key} className={`chip ${prefs.occasions.includes(o.key) ? 'on' : ''}`} onClick={() => setPrefs({ ...prefs, occasions: toggle(prefs.occasions, o.key) })}>{o.label}</button>
          ))}
        </div>
      </section>

      <section className="panel stack gap-16">
        <div>
          <h2 className="h3">Budget per piece</h2>
          <p className="small muted">The shop and your outfit suggestions stay inside this range.</p>
        </div>
        <PriceRange value={prefs.budget} max={PRICE_MAX} onChange={(budget) => setPrefs({ ...prefs, budget })} />
      </section>

      <section className="panel stack gap-16">
        <div>
          <h2 className="h3">App background</h2>
          <p className="small muted">Choose the backdrop.</p>
        </div>
        <div className="bg-picker">
          {BACKGROUNDS.map((b) => (
            <button key={b.id} className={`bg-thumb ${app.background === b.id ? 'on' : ''}`} onClick={() => app.update({ background: b.id })} aria-pressed={app.background === b.id}>
              <span className={`sw ${b.id === 'stars' ? 'stars' : b.id}`} />
              <span className="small">{b.label}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="row gap-12 sticky-actions">
        <button className="btn primary grow" onClick={save}>Save and see my outfits</button>
        {app.styled && <button className="btn text" onClick={() => { app.reset(); setName(''); setPrefs({ department: 'all', styles: [], colors: [], occasions: [], budget: [0, PRICE_MAX] }); }}>Start over</button>}
      </div>
    </div>
  );
}

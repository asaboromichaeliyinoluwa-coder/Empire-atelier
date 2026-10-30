import { createElement } from 'react';

/** The original photo and the try-on render side by side, so customers can compare. */
export function BeforeAfter({ before, after, label = 'Try-on' }: { before: string; after: string; label?: string }) {
  const side = { display: 'grid', gap: 10, justifyItems: 'center', minWidth: 0 } as const;
  const title = { margin: 0, fontSize: 20, letterSpacing: '0.12em', textTransform: 'uppercase' } as const;
  const frame = { width: '100%', aspectRatio: '3 / 4', borderRadius: 16, background: 'var(--cream)', display: 'grid', placeItems: 'center', overflow: 'hidden' } as const;
  const photo = (src: string, alt: string) =>
    createElement('img', { src, alt, draggable: false, style: { width: '100%', height: '100%', objectFit: 'contain' } });
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={side}>
          <h3 style={title}>Before</h3>
          <div style={frame}>{photo(before, 'Original')}</div>
        </div>
        <div style={side}>
          <h3 style={title}>✦ After</h3>
          <div style={frame}>{photo(after, label)}</div>
        </div>
      </div>
      <p className="small muted" style={{ margin: 0, textAlign: 'center' }}>Rendered by {label} AI</p>
    </div>
  );
}

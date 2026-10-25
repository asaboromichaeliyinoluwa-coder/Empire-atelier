import { useRef, useState } from 'react';

/** Drag to compare the original photo with the try-on render. */
export function BeforeAfter({ before, after, label = 'Try-on' }: { before: string; after: string; label?: string }) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const move = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };
  return (
    <div
      ref={ref}
      className="cam"
      style={{ touchAction: 'pan-y', cursor: 'ew-resize', userSelect: 'none' }}
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        move(e.clientX);
      }}
      onPointerMove={(e) => e.buttons && move(e.clientX)}
    >
      <img className="still" src={after} alt={label} draggable={false} />
      <img className="still" src={before} alt="Original" draggable={false} style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${pos}%`, width: 1, background: 'var(--gold)' }}>
        <div
          style={{
            position: 'absolute', top: '50%', left: -18, width: 36, height: 36, marginTop: -18, borderRadius: '50%',
            background: 'var(--gold)', color: 'var(--matte)', display: 'grid', placeItems: 'center', fontSize: 14,
          }}
        >
          ⟷
        </div>
      </div>
      <span className="badge" style={{ position: 'absolute', left: 12, top: 12 }}>Before</span>
      <span className="badge" style={{ position: 'absolute', right: 12, top: 12 }}>{label}</span>
    </div>
  );
}

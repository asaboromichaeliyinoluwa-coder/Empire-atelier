import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = ({ size = 20, ...p }: P) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...p,
});

export const IconHome = (p: P) => <svg {...base(p)}><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /></svg>;
export const IconBag = (p: P) => <svg {...base(p)}><path d="M5 8h14l-1 12H6Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>;
export const IconSparkle = (p: P) => <svg {...base(p)}><path d="M12 3l1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8Z" /><path d="M19 3v3M17.5 4.5h3" /></svg>;
export const IconHanger = (p: P) => <svg {...base(p)}><path d="M12 7a2 2 0 1 1 2-2c0 1-2 1.5-2 3l9 7.5a1 1 0 0 1-.6 1.8H3.6a1 1 0 0 1-.6-1.8L12 8" /></svg>;
export const IconHeart = ({ filled, ...p }: P & { filled?: boolean }) => <svg {...base(p)} fill={filled ? 'currentColor' : 'none'}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>;
export const IconStore = (p: P) => <svg {...base(p)}><path d="M4 9 5.5 4h13L20 9" /><path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" /><path d="M5 11v9h14v-9M10 20v-5h4v5" /></svg>;
export const IconUser = (p: P) => <svg {...base(p)}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>;
export const IconArrow = (p: P) => <svg {...base(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
export const IconExternal = (p: P) => <svg {...base(p)}><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" /></svg>;
export const IconBack = (p: P) => <svg {...base(p)}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>;
export const IconCamera = (p: P) => <svg {...base(p)}><path d="M4 8h3l2-3h6l2 3h3v11H4Z" /><circle cx="12" cy="13" r="3.5" /></svg>;
export const IconUpload = (p: P) => <svg {...base(p)}><path d="M12 16V4M7 9l5-5 5 5M4 16v4h16v-4" /></svg>;
export const IconClose = (p: P) => <svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const IconCheck = (p: P) => <svg {...base(p)}><path d="m5 12 4.5 4.5L19 7" /></svg>;
export const IconFilter = (p: P) => <svg {...base(p)}><path d="M4 6h16M7 12h10M10 18h4" /></svg>;
export const IconStar = (p: P) => <svg {...base(p)} fill="currentColor" stroke="none"><path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7Z" /></svg>;
export const IconTrash = (p: P) => <svg {...base(p)}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>;
export const IconCalendar = (p: P) => <svg {...base(p)}><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></svg>;
export const IconChat = (p: P) => <svg {...base(p)}><path d="M5 18.5V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8Z" /><path d="M9 9h6M9 12.5h4" /></svg>;
export const IconWand = (p: P) => <svg {...base(p)}><path d="m4 20 11-11M13 7l4 4" /><path d="M18 3v3M16.5 4.5h3M20 9v2M19 10h2M8 3v2M7 4h2" /></svg>;
export const IconFile = (p: P) => <svg {...base(p)}><path d="M7 3h7l5 5v13H7Z" /><path d="M14 3v5h5M10 13h6M10 17h6" /></svg>;
export const IconSend = (p: P) => <svg {...base(p)}><path d="M4 12 20 4l-6 16-3-7Z" /><path d="m11 13 9-9" /></svg>;
export const IconSearch = (p: P) => <svg {...base(p)}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>;
export const IconChevron = ({ left, ...p }: P & { left?: boolean }) => <svg {...base(p)}>{left ? <path d="m15 6-6 6 6 6" /> : <path d="m9 6 6 6-6 6" />}</svg>;
export const IconMinus = (p: P) => <svg {...base(p)}><path d="M6 12h12" /></svg>;
export const IconTag = (p: P) => <svg {...base(p)}><path d="M3 12V4h8l10 10-8 8Z" /><circle cx="7.5" cy="8.5" r="1.4" /></svg>;
export const IconShield = (p: P) => <svg {...base(p)}><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6Z" /><path d="m9 12 2 2 4-4" /></svg>;
export const IconLeaf = (p: P) => <svg {...base(p)}><path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15" /><path d="M5 19 13 11" /></svg>;
export const IconMail = (p: P) => <svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;
export const IconPhone = (p: P) => <svg {...base(p)}><rect x="7" y="2.5" width="10" height="19" rx="2" /><path d="M11 18.5h2" /></svg>;
export const IconDownload = (p: P) => <svg {...base(p)}><path d="M12 4v12M7 11l5 5 5-5M4 20h16" /></svg>;

/** Empire Atelier monogram: a five-pointed star drawn as one interlaced ribbon. */
export const Star = ({ size = 22, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinejoin="miter" {...p}>
    <path d="M24 3.5 31 20.5 45 17 33.5 28 38.5 44.5 24 35.5 9.5 44.5 14.5 28 3 17 17 20.5Z" />
    <path d="M24 13 27 21 35.5 20 29.5 26.5 32.5 35 24 30.5 15.5 35 18.5 26.5 12.5 20 21 21Z" strokeWidth="2.2" />
  </svg>
);

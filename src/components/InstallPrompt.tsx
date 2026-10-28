import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { IS_NATIVE, IS_PREVIEW } from '../lib/platform.ts';
import { IconClose, Star } from './icons.tsx';

type InstallEvent = Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

const DISMISSED = 'empire-atelier:install-dismissed';

const standalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
// iPadOS reports itself as a Mac, so touch support tells the two apart.
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function wasDismissed() {
  try {
    return localStorage.getItem(DISMISSED) === '1';
  } catch {
    return false;
  }
}

/**
 * "Add Empire Atelier to your home screen" card. Android / Chrome get a one-tap Install button;
 * iPhone Safari has no install API, so it shows the Share → Add to Home Screen steps instead.
 */
export function InstallPrompt() {
  const [event, setEvent] = useState<InstallEvent>();
  const [ios] = useState(isIos);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (IS_PREVIEW || IS_NATIVE || standalone() || wasDismissed()) return;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
      setOpen(true);
    };
    const onInstalled = () => setOpen(false);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    let timer: number | undefined;
    if (ios) {
      timer = window.setTimeout(() => setOpen(true), 2500);
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      clearTimeout(timer);
    };
  }, [ios]);

  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(DISMISSED, '1');
    } catch {
      // Private mode: it simply shows again next visit.
    }
  };

  const install = async () => {
    if (!event) return;
    await event.prompt();
    await event.userChoice;
    setEvent(undefined);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          className="install-card"
          role="dialog"
          aria-label="Install Empire Glamour"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="install-icon" aria-hidden>
            <Star size={26} />
          </span>
          <div className="grow">
            <strong>Get the Empire Glamour app</strong>
            {ios ? (
              <span className="small">
                Tap <b>Share</b> <ShareGlyph /> then <b>Add to Home Screen</b>.
              </span>
            ) : (
              <span className="small">Full screen, on your home screen, opens in a tap.</span>
            )}
          </div>
          {!ios && (
            <button className="btn primary small" onClick={install}>
              Install
            </button>
          )}
          <button className="icon-btn" onClick={dismiss} aria-label="Not now">
            <IconClose size={18} />
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

const ShareGlyph = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-label="Share icon" style={{ verticalAlign: '-2px' }}>
    <path d="M12 15V3M8 7l4-4 4 4M6 11H4v10h16V11h-2" />
  </svg>
);

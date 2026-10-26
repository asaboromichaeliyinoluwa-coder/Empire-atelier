import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import { IS_NATIVE, IS_PREVIEW } from './lib/platform.ts';
import { AuthProvider } from './lib/auth.tsx';
import { ShopProvider } from './lib/shop.tsx';
import { AppStoreProvider } from './lib/store.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppStoreProvider>
      <AuthProvider>
        <ShopProvider>
          <App />
        </ShopProvider>
      </AuthProvider>
    </AppStoreProvider>
  </StrictMode>,
);

// Installable app (PWA): the service worker keeps the app opening offline. Not needed inside the
// phone app (its files are already on the phone) or the hosted preview.
if (import.meta.env.PROD && !IS_NATIVE && !IS_PREVIEW && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

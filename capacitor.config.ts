import type { CapacitorConfig } from '@capacitor/cli';

/**
 * iOS / Android app. The screens are bundled into the app from dist/ (built with
 * `npm run mobile:build`, which reads VITE_API_BASE from .env.mobile); try-on and the stylist
 * call the hosted server, which keeps the API keys.
 */
const config: CapacitorConfig = {
  appId: 'com.empireatelier.app',
  appName: 'Empire Atelier',
  webDir: 'dist',
  backgroundColor: '#ecdbc7',
  ios: { contentInset: 'never' },
  android: { allowMixedContent: false },
};

export default config;

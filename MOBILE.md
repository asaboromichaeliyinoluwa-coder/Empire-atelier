# Empire Atelier on phones

There are two ways to put Empire Atelier on a phone. Both use the same code as the website.

| | Installable web app (PWA) | App Store / Google Play app (Capacitor) |
| --- | --- | --- |
| What people do | Open the site, tap **Install** / **Add to Home Screen** | Download from the store |
| Cost | Free | Apple $99/year, Google $25 once |
| Needs | The app live on a public **https** link | A Mac with Xcode (iOS), Android Studio (Android) |
| Updates | Instant, every time you redeploy | Rebuild and resubmit to the stores |

Start with the PWA. It is ready now and works on iPhone and Android.

## 1. Installable web app (PWA)

What's included: `public/manifest.webmanifest` (name, brown/cream colours, icons, shortcuts to Try on,
Stylist and Planner), `public/icons/` (home-screen icons, including the Android maskable one and the
iPhone `apple-touch-icon`), `public/sw.js` (service worker: the app opens offline, `/api` is never cached)
and `src/components/InstallPrompt.tsx` (an "Get the Empire Atelier app" card: a one-tap **Install** button
on Android/Chrome, Share → Add to Home Screen steps on iPhone).

A phone only installs a PWA from a public **https** address, not from `localhost:1010`.

1. Put the code on GitHub, then host it on **Vercel** or **Render** (either works):
   - **Vercel:** vercel.com → **Add New… > Project** → import the repo → open **Environment Variables**
     and add `YOUCAM_API_KEY` and `ANTHROPIC_API_KEY` → **Deploy**. `vercel.json` sets the build; the
     screens are served as static files and `/api` runs as a serverless function (`server/vercel.ts`).
   - **Render:** **New > Blueprint** → pick the repo (`render.yaml` does the rest). Add the same two keys
     in Render's Environment tab.
2. You get a link such as `https://empire-atelier.vercel.app` or `https://empire-atelier.onrender.com`.
3. **iPhone:** open the link in **Safari** → tap **Share** → **Add to Home Screen** → **Add**.
4. **Android:** open the link in **Chrome** → tap **Install** on the card (or menu ⋮ → **Install app**).

The icon appears on the home screen and the app opens full screen, without the browser bar.

## 2. Store apps (Capacitor)

`capacitor.config.ts`, `ios/` and `android/` are a ready Capacitor 8 project (app id
`com.empireatelier.app`). The screens are packed into the app; try-on and the stylist call your live
server, so the API keys never go into the app. Camera permission text is already in `ios/App/App/Info.plist`
and `android/app/src/main/AndroidManifest.xml`. Saving a try-on or the PDF report opens the phone's share
sheet (Save to Files/Photos, WhatsApp…).

1. Deploy the server first (step 1 above) and put its address in `.env.mobile`:
   `VITE_API_BASE=https://your-app.vercel.app` (or your Render address)
2. Install Node 22+, then in the project folder: `npm install`
3. **iPhone** (Mac with Xcode): `npm run ios` → Xcode opens → pick your phone or a simulator → ▶ Run.
   Signing & Capabilities: choose your Apple team. To publish: Product → Archive → Distribute App.
4. **Android** (Android Studio): `npm run android` → Android Studio opens → ▶ Run on a phone or emulator.
   To publish: Build → Generate Signed App Bundle, then upload the `.aab` to Google Play Console.
5. After changing the code, `npm run mobile:build` copies the new screens into both apps.
6. Changed the logo? Replace `resources/icon.png` (1024×1024) and `resources/splash.png` (2732×2732), then
   `npm run mobile:icons`.

Other app origins (for example a custom domain) can be allowed to call the server with
`EXTRA_ORIGINS=https://example.com` on the server.

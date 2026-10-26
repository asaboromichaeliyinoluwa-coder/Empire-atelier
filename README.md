# Empire Atelier

A menswear and womenswear fashion web app for trying on clothes, finding your style, planning outfits and buying from participating
boutiques, built on the [YouCam AI API](https://yce.perfectcorp.com/ai-api). Styled from the Empire Atelier brand board: espresso brown
`#321b13`, cream `#ecdbc7` and paper white `#fffeff`, Gilda Display type and an interlocking-star pattern.

## Features

| Feature | What it does | Problem it solves | Where |
| --- | --- | --- | --- |
| Virtual try-on | Shows clothing on the shopper's own photo | Uncertainty when shopping online | `/try-on` |
| Style preferences | Collects favourite styles, colours, occasions and budget | Irrelevant fashion choices | `/style` |
| Outfit suggestions | Recommends complete, colour-checked outfits | Difficulty choosing what to wear | `/outfits`, product pages |
| Budget filter | Filters products by price (per piece and per outfit) | Difficulty finding affordable options | `/shop`, `/outfits` |
| Product catalog | Clothing with seller information, delivery and returns | Difficulty discovering products | `/shop`, `/product/:id` |
| Save favourite looks | Saves outfits (with try-on pictures) and favourite pieces | Losing track of choices | `/saved` |
| Retailer links | Sends shoppers to the seller's product page, tagged as a referral | Not knowing where to buy | Every product, look and seller |
| Women / Men switch | One department setting (Women, Men, All) filters the shop, outfits, try-on, planner and stylist | Wading through the wrong department | Top bar, `/style` |
| AI clothes changer | Re-dresses the photo with a house look, a YouCam outfit template, or any garment photo | Imagining a whole new look | `/changer` |
| Smart outfit planner | A week of looks matched to each day's event and occasion, within budget, no main piece repeated | Morning outfit stress | `/planner` |
| AI chatbot stylist | Claude answers with real catalogue pieces (cards to try on, save and buy) using the shopper's profile, saved looks and plan | No one to ask | `/stylist` |
| Downloadable report | PDF with profile, week plan, saved looks, picks, changer gallery and a shopping list by seller with retailer links | Keeping it all in one place | `/report` |

### How try-on works

- **With a YouCam key** (`YOUCAM_API_KEY` in `.env`): the server sends the photo and each garment to
  YouCam AI Clothes v4 (`POST /s2s/v2.0/task/cloth-v4`, `garment_category` upper_body / lower_body /
  full_body) and polls for the result. Outfits are rendered piece by piece: bottoms, then dresses,
  then tops and layers, each render feeding the next. A before/after slider compares the result.
- **Preview mode** (no key): MediaPipe Pose finds the shoulders, hips and ankles in the photo on the
  device and the garment artwork is placed on the body. Size and position sliders fine-tune it.
  A studio mannequin is available for people who don't want to upload a photo.

### Clothes changer and stylist

- **Clothes changer**: house looks render through the same YouCam try-on (photo-real with a key, on-device
  preview without). With a key, "YouCam styles" lists `GET /s2s/v2.0/task/template/cloth` and renders with
  `POST /s2s/v2.0/task/cloth` + `template_id`; "Any garment" sends an uploaded garment photo to `cloth-v4`.
- **Stylist**: `server/stylist.ts` calls Claude (`claude-opus-5-5`, low effort, with server-side refusal
  fallback) when `ANTHROPIC_API_KEY` is set. Pieces come back as `[[product-id]]` and render as cards.
  Without a key (or if the call fails) the rule-based stylist in `src/shared/stylist.ts` answers.

### Outfit suggestions

`src/shared/outfits.ts` builds every dress, or top and bottom, with shoes, a bag and (for work and
everyday) a layer. Each look is scored on the shopper's styles, colours and occasions, rejected if
its colours clash or it breaks the budget, and the best varied set is shown with the reasons it was
picked. Editors' looks are hand-picked combinations in the same file.

## Real products and photos

Add your own items with your own photos on the **My products** page (`/admin`, footer link). See `MY-PRODUCTS.md` for
step-by-step instructions. Three items photographed by the owner are already in the shop (`src/shared/real-products.ts`);
their prices and sizes are placeholders to edit. The studio-rendered catalogue (below) stays alongside and is always
labelled as a render, not a photograph. `npm run photos` re-renders it (`tools/render/`).

## Luxury houses, galleries and labelling

Six original, fictional luxury houses sit beside the boutiques (`src/shared/luxury.ts`): Atelier Vermeil (saddle leather,
silk twill, watches), Casa Aurelia (baroque gold, jewellery), Noir Brut (oversized street couture), Studio Prisma (technical
nylon), Malle & Voyage (chevron-canvas trunks and travel bags) and Giardino (garden greens, striped webbing). Their look is
inspired by the houses named in the brief; every name, product and drawing is original, and the app says so wherever they
appear. They have no logos, names or trademarked patterns and are not affiliated with any real brand.

- **Catalogue:** bags and travel bags, sneakers, loafers and formal shoes, jackets, shirts and dresses, plus a new
  **Watches & jewellery** category (watches, pendants, cuffs, rings, belts, sunglasses, wallets). Colour and size options, prices and specifications on every page.
- **Gallery:** each product page has four views (front, close-up, back, material swatch) with hover zoom, all drawn from
  the same artwork with polished-metal, nylon, leather, suede, satin and denim finishes. They are labelled "Original illustration, not a photograph".
- **Shop:** filter by luxury house, boutique, category, colour, style, occasion and budget; search; sort by style match,
  price, newest, sale or name; loading, empty and error states.
- **Try-on labelling:** the try-on stage shows "Real result, rendered by YouCam AI" only for a real YouCam render, and
  "On-device preview, an illustrated mockup" otherwise. Shoes, bags and accessories are not tried on and say so.
- **Real photos:** to use authorised product photography, set `image` (and `tryOnImage`) on a product in `catalog.ts`;
  the gallery then shows the photo and labels it "Product photo".
- **Tests:** `npm test` checks every product, seller, category and drawing (four views each).

## The Maison edit

The Maison Lumière collection (`maison-lumiere` in `src/shared/catalog.ts`) holds original,
luxury-inspired designs: monogram canvas, quilting, baroque silks, houndstooth, house check and
heritage stripe prints; oversized streetwear; saddle-leather bags and slippers; silk carrés. They are
drawn with material finishes (leather, suede, satin, denim, knit, wool, linen, canvas) chosen from each
piece's `material` text (`finishFor` in `src/shared/garments.ts`). They are inspired by the look of
houses such as Louis Vuitton, Gucci, Balenciaga and Hermès, but use no logos, names or trademarked
patterns, and the app says so wherever they appear.

## On phones

Empire Atelier installs on phones as an app (PWA) and is set up for the App Store and Google Play with
Capacitor. See [MOBILE.md](MOBILE.md).

## Run it

Requires Node 22+.

```bash
npm install
cp .env.example .env   # then add your YouCam key
npm run dev            # app on http://localhost:5173, API on :1010
```

Run the finished app on http://localhost:1010: `npm run launch` (builds, then serves the app and API;
change the port with `PORT` in `.env`).

### On Windows without installing Node

`npm run portable` builds `empire-atelier-portable-windows.zip`: Node's official `node.exe`, the built app and
the server bundled into one `server.mjs`. Unzip it, double-click `start.bat`, and the app opens on
http://localhost:1010. Keys go in the `.env` file next to `start.bat`.

### Without installing anything: deploy to Render

1. Put this folder in a GitHub repository.
2. On [render.com](https://render.com), sign in with GitHub, choose **New > Blueprint** and pick the repository. `render.yaml` sets everything up.
3. When Render asks, paste your `YOUCAM_API_KEY`.
4. Open the `https://empire-atelier-….onrender.com` link on your laptop or phone. HTTPS is included, so the camera works.

### Or deploy to Vercel

1. Put this folder in a GitHub repository.
2. On [vercel.com](https://vercel.com), sign in with GitHub, choose **Add New… > Project** and import the repository. Leave the build settings as they are (`vercel.json` sets them).
3. Under **Environment Variables**, add `YOUCAM_API_KEY` and `ANTHROPIC_API_KEY`, then **Deploy**.
4. Open the `https://….vercel.app` link. The screens are static files; `/api` runs as one serverless function (`server/vercel.ts`, built by `scripts-build-vercel.mjs`).

### Accounts (sign up and log in)

Shoppers can create an account (**Account** icon in the header). Their favourites, saved looks, bag,
outfit planner, style profile and stylist chat sync to the account and open on any device, with a
dashboard at `/account`. Passwords are hashed with scrypt; log-in tokens are signed and last 30 days.

Sign in with Google and with a phone number (SMS code) are built in too. They switch on when the server has `GOOGLE_CLIENT_ID` and the three `TWILIO_*` keys; see `SETUP-SIGNIN.md` for click-by-click steps. Without the keys the buttons explain what is missing.

- **Windows app and `npm start`:** accounts are saved in a `data/` folder next to the app. Nothing to set up. Keep that folder when you update.
- **Vercel:** functions have no permanent disk, so add a database once: in your Vercel project open **Storage**, choose **Upstash Redis** (free plan), create it and connect it to the project, then **Redeploy**. Vercel adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` itself. Optionally add a long random `AUTH_SECRET` environment variable. Until the database is connected the app still works, and accounts are kept on each visitor's device instead.
- **Render:** add a Disk mounted at `/opt/render/project/src/data`, or use the same Upstash variables.

### Hosted preview build

`./scripts-build-preview.sh <out-dir>` builds the no-server version used for the claude.ai preview
(photo upload, on-device try-on, no download button).

## Going live with real sellers

Everything is in `src/shared/catalog.ts`:

- `SELLERS`: replace the demo boutiques' `website` (they use reserved `.example.com` addresses, so
  the app shows a "demo seller" note instead of opening them).
- `PRODUCTS`: set each product's `url` (its page on the seller's site), `image` (catalog photo) and
  `tryOnImage` (a clean product-only shot that YouCam uses). Products without photos use the built-in
  illustrations from `src/shared/garments.ts`.
- Retailer links get `utm_source=empire-atelier&utm_medium=referral` so sellers can see the traffic.

## Architecture

```
src/            React + Vite front end (React Router, Framer Motion)
  pages/        one file per screen
  components/   layout, product and look cards, photo picker, before/after
  lib/          store (saved in the browser), YouCam client, on-device pose try-on
  shared/       catalog, sellers, outfit engine, garment artwork (used by client and server)
server/         Node server: YouCam proxy (the key never reaches the browser), static hosting
public/              favicon, PWA manifest, service worker, home-screen icons
resources/           app icon and splash sources for the store apps
ios/ android/        Capacitor store apps (MOBILE.md)
vercel.json          Vercel hosting: static screens + /api function (server/vercel.ts, scripts-build-vercel.mjs)
public/favicon.svg   star monogram (the wordmark and pattern tiles live in src/components/icons.tsx and src/index.css)
```

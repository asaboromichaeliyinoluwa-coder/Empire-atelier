/**
 * Empire Atelier API + static server.
 *   npm run server   → API on :1010 (Vite's dev server proxies /api here)
 *   npm start        → API plus the built app from dist/
 * The YouCam key lives in .env (see .env.example) and never reaches the browser.
 */
import { existsSync, readFileSync } from 'node:fs';
import { createServer, type ServerResponse } from 'node:http';
import { extname, join, normalize } from 'node:path';

if (existsSync('.env')) process.loadEnvFile('.env');

// Imported after .env is loaded, since the API reads its keys when it loads.
const { handleApi, send } = await import('./app.ts');

const PORT = Number(process.env.PORT || 1010);
const DIST = join(process.cwd(), 'dist');

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.wasm': 'application/wasm',
  '.task': 'application/octet-stream',
};

function serveStatic(res: ServerResponse, path: string) {
  const safe = normalize(path).replace(/^(\.\.[/\\])+/, '');
  let file = join(DIST, safe);
  if (!file.startsWith(DIST) || !existsSync(file) || !extname(file)) file = join(DIST, 'index.html');
  if (!existsSync(file)) return send(res, 404, { error: 'Run `npm run build` first' });
  res.writeHead(200, {
    'Content-Type': MIME[extname(file)] ?? 'application/octet-stream',
    'Cache-Control': file.includes('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
  });
  res.end(readFileSync(file));
}

createServer(async (req, res) => {
  const path = new URL(req.url ?? '/', 'http://localhost').pathname;
  if (path.startsWith('/api/')) await handleApi(req, res, path);
  else serveStatic(res, path);
}).listen(PORT, () => console.log(`Empire Atelier server on http://localhost:${PORT}`));

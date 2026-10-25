// Builds Empire Atelier for Vercel (Build Output API): the screens as static files and the API as
// one Node function. Run by Vercel through vercel.json; locally: `npm run build:vercel`.
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { build } from 'vite';

const OUT = '.vercel/output';
const FN = `${OUT}/functions/api.func`;
rmSync(OUT, { recursive: true, force: true });

await build({
  configFile: false,
  publicDir: false,
  logLevel: 'warn',
  ssr: { noExternal: true, target: 'node' },
  build: {
    ssr: 'server/vercel.ts',
    outDir: FN,
    emptyOutDir: true,
    target: 'node22',
    rollupOptions: { output: { entryFileNames: 'index.mjs', inlineDynamicImports: true } },
  },
});
writeFileSync(`${FN}/.vc-config.json`, JSON.stringify({ runtime: 'nodejs22.x', handler: 'index.mjs', launcherType: 'Nodejs', maxDuration: 60 }, null, 2));
writeFileSync(`${FN}/package.json`, JSON.stringify({ type: 'module' }));

mkdirSync(OUT, { recursive: true });
cpSync('dist', `${OUT}/static`, { recursive: true });

writeFileSync(
  `${OUT}/config.json`,
  JSON.stringify(
    {
      version: 3,
      routes: [
        { src: '/assets/(.*)', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }, continue: true },
        { src: '/sw.js', headers: { 'Cache-Control': 'no-cache' }, continue: true },
        { src: '/manifest.webmanifest', headers: { 'Content-Type': 'application/manifest+json' }, continue: true },
        { src: '/api/(.*)', dest: '/api?__p=$1' },
        { handle: 'filesystem' },
        { src: '/(.*)', dest: '/index.html' },
      ],
    },
    null,
    2,
  ),
);
console.log('Vercel build ready in .vercel/output');

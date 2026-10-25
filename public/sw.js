/**
 * Empire Atelier service worker: makes the app installable and keeps it opening offline.
 *   pages      network first, cached copy when offline
 *   /assets/*  cache first (file names carry a content hash)
 *   fonts, MediaPipe model  cached after the first use
 *   /api/*     never cached: try-ons and the stylist always go to the server
 */
const VERSION = 'ea-v1';
const SHELL = ['/', '/manifest.webmanifest', '/favicon.svg', '/icons/icon-192.png', '/icons/icon-512.png'];
const RUNTIME_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net', 'storage.googleapis.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function cacheFirst(request) {
  const hit = await caches.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) (await caches.open(VERSION)).put(request, res.clone());
  return res;
}

async function networkFirstPage(request) {
  try {
    const res = await fetch(request);
    if (res.ok) (await caches.open(VERSION)).put('/', res.clone());
    return res;
  } catch {
    return (await caches.match('/')) ?? Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith('/api/')) return;
    if (request.mode === 'navigate') return event.respondWith(networkFirstPage(request));
    return event.respondWith(cacheFirst(request));
  }
  if (RUNTIME_HOSTS.includes(url.hostname)) event.respondWith(cacheFirst(request));
});

// Offline support for Hearth. Scoped to this folder by where it is served from,
// so it never touches the rest of the site.
//
// Bump VERSION whenever a file is added to or removed from ASSETS. Edits to the
// existing files reach users without a bump: they are served from cache and
// refreshed in the background, so the next launch picks them up.
const VERSION = 'hearth-v1'
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './core.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('hearth-') && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || !request.url.startsWith(self.registration.scope)) return

  const cacheKey = request.mode === 'navigate' ? './index.html' : request
  // Stale-while-revalidate: answer from cache, refresh the copy in the background.
  const refreshed = fetch(request)
    .then(async (response) => {
      if (response.ok && response.type === 'basic' && !response.redirected) {
        // Clone before any await: the page may consume the original body meanwhile.
        const copy = response.clone()
        const cache = await caches.open(VERSION)
        await cache.put(cacheKey, copy)
      }
      return response
    })
    .catch(() => undefined)

  event.waitUntil(refreshed)
  event.respondWith(
    caches
      .match(cacheKey, { ignoreSearch: true, cacheName: VERSION })
      .then((cached) => cached || refreshed.then((response) => response || Response.error())),
  )
})

// Offline support and updates for Hearth. Scoped to this folder by where it is
// served from, so it never touches the rest of the site.
//
// The page registers this worker as `sw.js?v=<build id>`. A new deploy means a
// new URL, so the browser installs a fresh worker even while Cloudflare and the
// browser still hold the old sw.js in their HTTP caches. The worker then copies
// every file of that build into its own cache, and the app is served from it.
const BUILD = new URL(self.location.href).searchParams.get('v') || 'dev'
const CACHE = `hearth-${BUILD}`
const STAMPED = /^[0-9a-f]{7,40}$/.test(BUILD)
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './core.js',
  './version.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
]

// `?v=` misses every CDN cache on the way and `cache: 'reload'` skips the
// browser's, so what lands in the cache is what the origin serves right now.
async function fetchFresh(path) {
  const url = new URL(path, self.location.href)
  url.searchParams.set('v', BUILD)
  const response = await fetch(url, { cache: 'reload' })
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`)
  return response
}

async function precache() {
  const responses = await Promise.all(ASSETS.map(fetchFresh))
  if (STAMPED) {
    // Refuse a half-deployed mix: the files must belong to the build we were registered for.
    const versionSource = await responses[ASSETS.indexOf('./version.js')].clone().text()
    if (!versionSource.includes(`'${BUILD}'`)) throw new Error(`Expected build ${BUILD}, got another version.js`)
  }
  const cache = await caches.open(CACHE)
  await Promise.all(ASSETS.map((path, i) => cache.put(path, responses[i])))
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('hearth-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || !request.url.startsWith(self.registration.scope)) return
  // The update check must always reach the network.
  if (new URL(request.url).pathname.endsWith('/version.json')) return

  const key = request.mode === 'navigate' ? './index.html' : request
  event.respondWith(
    caches.open(CACHE).then(async (cache) => (await cache.match(key, { ignoreSearch: true })) || fetch(request)),
  )
})

// Tapping the goal alarm brings Hearth up instead of opening a second copy.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = event.notification.data?.url || self.registration.scope
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.startsWith(self.registration.scope) && 'focus' in client) return client.focus()
      }
      return self.clients.openWindow(target)
    }),
  )
})

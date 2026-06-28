// SACCO Wallet Service Worker — Offline-First
const CACHE = 'sacco-v1'
const STATIC = [
  '/',
  '/farmer/dashboard',
  '/farmer/savings',
  '/farmer/loans',
  '/farmer/market',
  '/farmer/weather',
  '/manifest.json',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  const { request } = e
  if (request.method !== 'GET') return

  // Network-first for API, cache-first for static
  if (request.url.includes('/api/')) {
    e.respondWith(
      fetch(request).then(res => {
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(request, clone))
        return res
      }).catch(() => caches.match(request))
    )
  } else {
    e.respondWith(
      caches.match(request).then(cached => {
        const network = fetch(request).then(res => {
          caches.open(CACHE).then(c => c.put(request, res.clone()))
          return res
        })
        return cached || network
      })
    )
  }
})

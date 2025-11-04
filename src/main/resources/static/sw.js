const urlParams = new URLSearchParams(self.location.search);
const VERSION = urlParams.get('version') || 'v1';
const CACHE_NAME = `dubini-static-cache-${VERSION}`;

console.log('SW: Starting with cache:', CACHE_NAME);

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('SW: Received SKIP_WAITING message');
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  console.log('SW: Installing version', CACHE_NAME);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SW: Activating version', CACHE_NAME);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('dubini-static-cache-') && cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('SW: Taking control of all clients');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Cachear solo recursos estáticos
  if (url.pathname.startsWith('/scripts/') ||
      url.pathname.startsWith('/styles/') ||
      url.pathname.endsWith('.ico') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg')) {

    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;

        return fetch(event.request).then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  }

  // Cachear HTML dinámico (páginas) bajo demanda
  if (url.pathname === '/') {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
  }
});
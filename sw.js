const CACHE_NAME = '2s-fiber-v29'; // تحديث إلى v28

const ASSETS_TO_CACHE = [
  './',
  './index.html?v=29',
  './logo.png?v=29',
  './manifest.json?v=29',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        // سيقوم هذا الكود بحذف كاشv27 وأي كاش قديم آخر فوراً
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      })
    ))
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.includes('sw.js')) return;
  
  // استثناء روابط السيرفرات لضمان الفحص الحي
  if (url.hostname === 'advpro.info' || url.hostname === 'advrapp.com' || url.searchParams.has('check_t')) {
    event.respondWith(fetch(event.request).catch(() => null));
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => null);
      
      return cachedResponse || fetchPromise;
    })
  );
});


const CACHE_NAME = '2s-fiber-v35'; 

const ASSETS_TO_CACHE = [
  './',
  './index.html?v=35',
  './logo.png?v=35',
  './manifest.json?v=35',
  './app.apk', 
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
        // تنظيف كاش الإصدار 34 وأي إصدارات سابقة
        if (key !== CACHE_NAME) {
          console.log('Cleaning old cache:', key);
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
  
  if (url.hostname === 'advrapp.com' || url.searchParams.has('v')) {
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


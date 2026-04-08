const CACHE_NAME = '2s-fiber-v31'; // التحديث للإصدار v31 ليتوافق مع index.html

const ASSETS_TO_CACHE = [
  './',
  './index.html?v=31',
  './logo.png?v=31',
  './manifest.json?v=31',
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
        // حذف أي كاش قديم (v30 وما قبله) لضمان تحميل التعديلات الجديدة فوراً
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
  
  // عدم عمل كاش لملف السيرفس وركر نفسه
  if (url.pathname.includes('sw.js')) return;
  
  // استثناء روابط السيرفر الخارجي لضمان الفحص الحي وعدم جلب نتيجة قديمة من الكاش
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


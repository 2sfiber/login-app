const CACHE_NAME = '2s-fiber-v20'; // تم التحديث للإصدار v20 لضمان تنشيط التعديلات الجديدة

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './logo.png',
  './manifest.json?v=20',
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
        // حذف أي كاش قديم لضمان عمل التحديث الجديد v20
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
  
  // لا تتدخل في فحص ملف sw نفسه لضمان التحديث التلقائي
  if (url.pathname.includes('sw.js')) {
    return;
  }
  
  // استثناء روابط فحص السيرفر (RADIUS) من الكاش نهائياً لضمان دقة الفحص اللحظي (Real-time)
  if (url.hostname === 'advpro.info') {
    event.respondWith(fetch(event.request).catch(() => null));
    return;
  }
  
  // استراتيجية (الشبكة أولاً مع العودة للكاش في حال عدم وجود إنترنت) للملفات الأساسية
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        return cachedResponse || caches.match(event.request, { ignoreSearch: true });
      });
      return cachedResponse || fetchPromise;
    })
  );
});


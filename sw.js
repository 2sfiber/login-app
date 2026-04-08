const CACHE_NAME = '2s-fiber-v23'; // تحديث للإصدار v23 ليتطابق مع index.html

const ASSETS_TO_CACHE = [
  './',
  './index.html?v=23',
  './logo.png?v=23',
  './manifest.json?v=23',
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
        // حذف أي كاش قديم (v22 وما قبلها) لضمان تحميل التعديلات الجديدة فوراً
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
  
  // تجنب كاش ملف sw.js لضمان تحديث المتصفح للكود مستقبلاً
  if (url.pathname.includes('sw.js')) {
    return;
  }
  
  // استثناء روابط فحص السيرفرات (advpro.info & advrapp.com) لتعمل عبر الشبكة فقط
  if (url.hostname === 'advpro.info' || url.hostname === 'advrapp.com') {
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
      }).catch(() => {
        // في حالة الأوفلاين، يتم عرض النسخة المخزنة
        return cachedResponse || caches.match(event.request, { ignoreSearch: true });
      });
      return cachedResponse || fetchPromise;
    })
  );
});


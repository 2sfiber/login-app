const CACHE_NAME = '2s-fiber-v37'; 

// الملفات الأساسية فقط لضمان سرعة الفتح وعدم التعليق
const ASSETS_TO_CACHE = [
  './',
  './index.html?v=37',
  './logo.png?v=37',
  './manifest.json?v=37',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // استخدام return هنا يضمن استكمال التثبيت حتى لو فشل ملف غير أساسي
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.log("Cache step failed", err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key); // تنظيف كاش v35 و v34 فوراً
        }
      })
    ))
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. استثناء روابط تسجيل الدخول (advrapp) لضمان أنها تعمل دائماً من الإنترنت الحي
  if (url.hostname === 'advrapp.com' || url.pathname.includes('sw.js')) {
    event.respondWith(fetch(event.request).catch(() => null));
    return;
  }

  // 2. منطق العرض: البحث في الكاش أولاً، إذا لم يوجد، الجلب من الإنترنت
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        // تحديث الكاش بالملفات الجديدة تلقائياً (مثل الصور الجديدة)
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // إذا انقطع الإنترنت تماماً والملف ليس في الكاش
        return null; 
      });
    })
  );
});


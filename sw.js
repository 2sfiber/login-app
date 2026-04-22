const CACHE_NAME = '2s-fiber-v39'; // تم تحديث الإصدار لتنظيف الكاش القديم

// الملفات الأساسية التي سيتم تخزينها لضمان عمل التطبيق أوفلاين
const ASSETS_TO_CACHE = [
  './',
  './index.html?v=39',
  './logo.png?v=39',
  './manifest.json?v=39',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap'
];

// مرحلة التثبيت: حفظ الملفات الأساسية في الكاش
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.log("فشل تخزين الملفات:", err));
    })
  );
  self.skipWaiting();
});

// مرحلة التنشيط: حذف كافة الملفات القديمة (v37 وما قبلها) فوراً
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key); 
        }
      })
    ))
  );
  return self.clients.claim();
});

// إدارة الطلبات (Fetch)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. استثناء ملفات الـ APK من الكاش نهائياً لضمان تحميل النسخة الجديدة دائماً
  if (url.pathname.endsWith('.apk')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. استثناء روابط السيرفر (advrapp) لتعمل من الإنترنت الحي فقط
  if (url.hostname === 'advrapp.com' || url.pathname.includes('sw.js')) {
    event.respondWith(fetch(event.request).catch(() => null));
    return;
  }

  // 3. منطق العرض: البحث في الكاش أولاً، ثم الإنترنت
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        // تحديث الكاش بالملفات الجديدة (مثل الصور) إذا كانت حالة الاستجابة ناجحة
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        return null; 
      });
    })
  );
});


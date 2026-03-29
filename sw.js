const CACHE_NAME = '2s-fiber-cache-v11'; // تأكد أن الإصدار هنا يطابق v11 في ملف html
const assetsToCache = [
  './',
  './index.html',
  './logo.png',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap'
];

// 1. مرحلة التثبيت: حفظ الملفات الأساسية في الذاكرة المؤقتة
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: تم فتح الذاكرة المؤقتة وحفظ الأصول');
      return cache.addAll(assetsToCache);
    })
  );
  self.skipWaiting(); // تفعيل الخدمة فوراً دون انتظار إغلاق التبويبات القديمة
});

// 2. مرحلة التنشيط: حذف الملفات القديمة (v10, v9...) لضمان عمل التحديث الجديد
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('SW: جاري حذف الذاكرة القديمة:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); // السيطرة على المتصفح فوراً
});

// 3. معالجة الطلبات: جلب الملفات من الذاكرة إذا كانت متوفرة، وإلا من الإنترنت
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // إذا وجد الملف في الكاش، نرجعه، وإلا نطلبه من الشبكة
      return response || fetch(event.request).catch(() => {
        // إذا فشل الإنترنت وفشل الكاش (أوفلاين)، نرجع صفحة index.html
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

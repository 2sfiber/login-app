const CACHE_NAME = '2s-fiber-v10';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap'
];

// مرحلة التثبيت: حفظ الملفات في الذاكرة
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('2S Fiber: تم تحديث الملفات بنجاح');
      return cache.addAll(ASSETS);
    })
  );
  // إجبار الـ Service Worker الجديد على أن يصبح نشطاً فوراً
  self.skipWaiting(); 
});

// مرحلة التفعيل: تنظيف الذاكرة القديمة
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('2S Fiber: حذف التخزين المؤقت القديم:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // السيطرة على الصفحات المفتوحة فوراً دون الحاجة لإعادة تحميلها
  self.clients.claim();
});

// إدارة الطلبات (الاستجابة الذكية)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // محاولة جلب الملف من الشبكة أولاً
    fetch(event.request).catch(() => {
      // إذا فشل (أوفلاين)، ابحث عنه في الذاكرة المحفوظة
      return caches.match(event.request);
    })
  );
});

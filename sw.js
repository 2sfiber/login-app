const CACHE_NAME = '2s-fiber-v2'; // قمنا بتغيير الإصدار لضمان تحديث المتصفحات القديمة
const ASSETS = [
  './',
  './index.html',
  './logo.png',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap'
];

// تثبيت الكاش وحفظ الملفات الأساسية والخطوط
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// تفعيل النسخة الجديدة وحذف أي كاش قديم فوراً
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// استراتيجية (الشبكة أولاً): يحاول جلب التحديث من الإنترنت، وإذا فشل (لا يوجد نت) يعرض الكاش
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

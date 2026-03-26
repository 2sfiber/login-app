// الإصدار v9: يدعم التثبيت التلقائي وملف الـ Manifest الجديد
const CACHE_NAME = '2s-fiber-v9';

// قائمة الملفات التي سيتم حفظها للعمل بدون إنترنت وتطبيقه كتطبيق
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap'
];

// 1. مرحلة التثبيت: حفظ الملفات الأساسية في الذاكرة
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('تم تحديث ملفات النظام إلى v9');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); 
});

// 2. مرحلة التفعيل: حذف الإصدارات القديمة (v8, v7...) لتجنب التعارض
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('تنظيف التخزين القديم:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. إدارة الطلبات: جلب البيانات من الإنترنت أولاً، وإذا فشل يستخدم الذاكرة
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

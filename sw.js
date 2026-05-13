const CACHE_NAME = '2s-fiber-v42';
const ASSETS_TO_CACHE = [
    'index.html?v=42',
    'style.css?v=42',
    'script.js?v=42',
    'live.html?v=42',
    'logo.png?v=42'
];

// عند التثبيت: تحميل الملفات الجديدة فوراً
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// عند التفعيل: مسح كل الكاش القديم (v40 وتحت)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// جلب الملفات: محاولة الشبكة أولاً لضمان التحديث
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});

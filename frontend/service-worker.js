/**
 * CoSpace Service Worker
 * Versi Cache: cospace-v6 (Local Poppins Font Integration)
 * Strategi:
 * - App Shell: Pre-caching saat install + stale-while-revalidate
 * - API (https://co-space-indol.vercel.app/api/): Network-first dengan fallback ke cache
 * - Navigasi offline: fallback ke offline.html
 */

const STATIC_CACHE = 'cospace-static-v6';
const API_CACHE = 'cospace-api-v6';

// Daftar aset inti App Shell untuk di-precache
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/css/style.css',
  '/js/app.js',
  '/js/api.js',
  '/js/utils.js',
  '/js/components/confirmDialog.js',
  '/js/pages/homePage.js',
  '/js/pages/roomsPage.js',
  '/js/pages/roomDetailPage.js',
  '/js/pages/bookingsPage.js',
  '/js/pages/bookingDetailPage.js',
  '/js/pages/bookPage.js',
  '/js/pages/profilePage.js',
  '/js/pages/notFoundPage.js',
  '/fonts/Poppins-Regular.ttf',
  '/fonts/Poppins-Medium.ttf',
  '/fonts/Poppins-SemiBold.ttf',
  '/fonts/Poppins-Bold.ttf',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

/* ==========================================================================
   1. Install Event: Pre-cache App Shell
   ========================================================================== */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[ServiceWorker] Pre-caching App Shell...');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

/* ==========================================================================
   2. Activate Event: Bersihkan Cache Versi Lama
   ========================================================================== */
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, API_CACHE];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log('[ServiceWorker] Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

/* ==========================================================================
   3. Fetch Event: Strategi Caching
   ========================================================================== */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Jangan tangani permintaan selain GET di cache
  if (req.method !== 'GET') {
    return;
  }

  // A. Permintaan API (Network-First)
  if (url.href.includes('co-space-indol.vercel.app/api')) {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          // Simpan salinan response sukses (status 200) ke cache API
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(req, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback ke cache saat offline
          return caches.match(req).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return new Response(
              JSON.stringify({ error: 'Koneksi offline dan data belum tersedia di cache lokal.' }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
    return;
  }

  // B. Permintaan Navigasi HTML (Halaman)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          const responseToCache = networkResponse.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(req, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          return caches.match(req).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Tampilkan offline.html jika halaman tidak ada di cache
            return caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // C. File Statis (CSS, JS, Ikon, Gambar): Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const fetchPromise = fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(req, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Jaringan gagal, biarkan cachedResponse yang menangani
        });

      return cachedResponse || fetchPromise;
    })
  );
});


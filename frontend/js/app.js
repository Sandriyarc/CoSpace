/**
 * CoSpace Frontend - Router & Inisialisasi Aplikasi (ES Modules)
 */

import { render as renderHome } from './pages/homePage.js';
import { render as renderRooms } from './pages/roomsPage.js';
import { render as renderRoomDetail } from './pages/roomDetailPage.js';
import { render as renderBookings } from './pages/bookingsPage.js';
import { render as renderBookingDetail } from './pages/bookingDetailPage.js';
import { render as renderBook } from './pages/bookPage.js';
import { render as renderProfile } from './pages/profilePage.js';
import { render as renderNotFound } from './pages/notFoundPage.js';
import { $, $$ } from './utils.js';

/* ==========================================================================
   Tabel Rute Hash Router
   ========================================================================== */
const routes = [
  {
    path: '#/',
    title: 'CoSpace',
    parentNav: '#/',
    render: renderHome,
    isDetail: false
  },
  {
    path: '#/rooms',
    title: 'Daftar Ruangan',
    parentNav: '#/rooms',
    render: renderRooms,
    isDetail: false
  },
  {
    path: '#/rooms/:id',
    title: 'Detail Ruangan',
    parentNav: '#/rooms',
    render: renderRoomDetail,
    isDetail: true
  },
  {
    path: '#/bookings',
    title: 'Jadwal Reservasi',
    parentNav: '#/bookings',
    render: renderBookings,
    isDetail: false
  },
  {
    path: '#/bookings/:id',
    title: 'Detail Reservasi',
    parentNav: '#/bookings',
    render: renderBookingDetail,
    isDetail: true
  },
  {
    path: '#/book',
    title: 'Reservasi Ruangan',
    parentNav: '#/book',
    render: renderBook,
    isDetail: false
  },
  {
    path: '#/profile',
    title: 'Profil Pengguna',
    parentNav: '#/profile',
    render: renderProfile,
    isDetail: false
  }
];

/* ==========================================================================
   Parser dan Matcher Rute Hash
   ========================================================================== */

/**
 * Memecah hash menjadi path dan query parameters
 * Contoh: "#/book?room=room-123" -> { path: "#/book", query: URLSearchParams }
 * @param {string} rawHash
 * @returns {{ path: string, query: URLSearchParams }}
 */
function parseHash(rawHash) {
  let hash = rawHash || '#/';
  if (!hash.startsWith('#')) {
    hash = `#${hash}`;
  }
  if (hash === '#' || hash === '') {
    hash = '#/';
  }

  const [pathPart, queryPart] = hash.split('?');
  return {
    path: pathPart,
    query: new URLSearchParams(queryPart || '')
  };
}

/**
 * Memeriksa kecocokan antara path definisi rute dengan path aktif
 * Mendukung parameter rute dinamis (misal :id)
 * @param {string} routePath
 * @param {string} currentPath
 * @returns {Record<string, string>|null}
 */
function matchRoute(routePath, currentPath) {
  const routeSegments = routePath.split('/').filter(Boolean);
  const currentSegments = currentPath.split('/').filter(Boolean);

  if (routeSegments.length !== currentSegments.length) {
    return null;
  }

  const params = {};
  for (let i = 0; i < routeSegments.length; i++) {
    const rSeg = routeSegments[i];
    const cSeg = currentSegments[i];

    if (rSeg.startsWith(':')) {
      const paramName = rSeg.slice(1);
      params[paramName] = decodeURIComponent(cSeg);
    } else if (rSeg !== cSeg) {
      return null;
    }
  }

  return params;
}

/* ==========================================================================
   Pengendali Navigasi & Render Tampilan
   ========================================================================== */

/**
 * Router utama: menentukan halaman yang akan ditampilkan sesuai window.location.hash
 */
function router() {
  const appContainer = $('#app');
  const pageTitle = $('#page-title');
  const btnBack = $('#btn-back');

  if (!appContainer) return;

  const { path, query } = parseHash(window.location.hash);

  let matchedRoute = null;
  let matchedParams = {};

  // Cari rute yang cocok dalam tabel rute
  for (const route of routes) {
    const params = matchRoute(route.path, path);
    if (params !== null) {
      matchedRoute = route;
      matchedParams = params;
      break;
    }
  }

  // Jika rute tidak ditemukan, render halaman 404
  if (!matchedRoute) {
    if (pageTitle) pageTitle.textContent = 'Halaman Tidak Ditemukan';
    if (btnBack) btnBack.style.display = 'inline-flex';
    renderNotFound(appContainer);
    updateBottomNav('');
    return;
  }

  // 1. Perbarui Judul Top Bar
  if (pageTitle) {
    pageTitle.textContent = matchedRoute.title;
  }

  // 2. Atur Visibilitas Tombol Kembali (hanya muncul di halaman detail)
  if (btnBack) {
    if (matchedRoute.isDetail) {
      btnBack.style.display = 'inline-flex';
      btnBack.onclick = () => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.hash = matchedRoute.parentNav;
        }
      };
    } else {
      btnBack.style.display = 'none';
      btnBack.onclick = null;
    }
  }

  // 3. Sorot Menu Bottom Navigation Bar sesuai rute (rute detail menyorot menu induk)
  updateBottomNav(matchedRoute.parentNav);

  // 4. Render Halaman ke dalam #app
  matchedRoute.render(appContainer, {
    params: matchedParams,
    query: query,
    route: matchedRoute
  });

  // 5. Kembalikan scroll ke posisi paling atas
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/**
 * Memperbarui status aktif pada Bottom Navigation Bar
 * @param {string} parentNav - Hash rute induk (misal '#/rooms')
 */
function updateBottomNav(parentNav) {
  const navItems = $$('.bottom-nav .nav-item');
  navItems.forEach((item) => {
    const itemRoute = item.getAttribute('data-route');
    if (itemRoute === parentNav) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

/* ==========================================================================
   Inisialisasi Aplikasi & Fitur PWA
   ========================================================================== */

/**
 * Pemantauan Banner Offline Global
 */
function updateOfflineBanner() {
  const banner = document.getElementById('offline-banner');
  if (!banner) return;
  if (navigator.onLine) {
    banner.style.display = 'none';
  } else {
    banner.style.display = 'flex';
  }
}

/**
 * Pendaftaran Service Worker untuk PWA Offline & Caching
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js', { scope: '/' })
        .then((registration) => {
          console.log('[PWA] Service Worker aktif, scope:', registration.scope);
        })
        .catch((error) => {
          console.error('[PWA] Gagal mendaftarkan Service Worker:', error);
        });
    });
  }
}

function init() {
  // Pendaftaran Service Worker
  registerServiceWorker();

  // Tangkap event instalasi PWA untuk tombol Install di Profil
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window.deferredPrompt = e;
    window.dispatchEvent(new CustomEvent('pwa-installable'));
  });

  window.addEventListener('appinstalled', () => {
    window.deferredPrompt = null;
    console.log('[PWA] Aplikasi CoSpace berhasil diinstal.');
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });

  // Pemantauan status online / offline untuk banner indikator
  window.addEventListener('online', updateOfflineBanner);
  window.addEventListener('offline', updateOfflineBanner);
  updateOfflineBanner();

  // Pasang event listener untuk perubahan hash
  window.addEventListener('hashchange', router);

  // Jika belum ada hash pada URL, arahkan ke '#/'
  if (!window.location.hash || window.location.hash === '#') {
    window.location.hash = '#/';
  } else {
    router();
  }
}

// Jalankan ketika DOM sudah siap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}


/**
 * Utility Helpers dan Komponen Reusable untuk CoSpace Frontend
 */

/* ==========================================================================
   Formatters
   ========================================================================== */

/**
 * Format angka ke format mata uang Rupiah (IDR)
 * Contoh: 75000 -> "Rp 75.000"
 * @param {number|string} amount
 * @returns {string}
 */
export function formatRupiah(amount) {
  const number = Number(amount) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
}

/**
 * Menghasilkan sapaan waktu sesuai jam lokal pengguna
 * @returns {string} Contoh: "Selamat pagi", "Selamat siang", "Selamat sore", "Selamat malam"
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return 'Selamat pagi';
  if (hour >= 11 && hour < 15) return 'Selamat siang';
  if (hour >= 15 && hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

/**
 * Format tanggal standar (YYYY-MM-DD) ke penanggalan bahasa Indonesia
 * Contoh: "2026-11-17" -> "17 November 2026"
 * @param {string|Date} dateInput
 * @param {boolean} [withDayName=false]
 * @returns {string}
 */
export function formatDateIndo(dateInput, withDayName = false) {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const options = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };

  if (withDayName) {
    options.weekday = 'long';
  }

  return new Intl.DateTimeFormat('id-ID', options).format(date);
}

/**
 * Format string jam waktu (misal "09:00:00" -> "09:00")
 * @param {string} timeStr
 * @returns {string}
 */
export function formatTime(timeStr) {
  if (!timeStr) return '-';
  const parts = String(timeStr).split(':');
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeStr;
}

/**
 * Konversi string waktu (HH:mm atau HH:mm:ss) ke satuan detik
 * @param {string} timeStr
 * @returns {number}
 */
export function timeToSeconds(timeStr) {
  if (!timeStr) return 0;
  const parts = String(timeStr).split(':').map(Number);
  return parts[0] * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
}

/**
 * Menghitung durasi jam antara jam mulai dan jam selesai
 * @param {string} startTime - format "HH:mm" atau "HH:mm:ss"
 * @param {string} endTime - format "HH:mm" atau "HH:mm:ss"
 * @returns {number} Durasi dalam jam
 */
export function calculateDurationHours(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const startSec = timeToSeconds(startTime);
  const endSec = timeToSeconds(endTime);
  const diffSec = endSec - startSec;
  if (diffSec <= 0) return 0;
  return Math.round((diffSec / 3600) * 10) / 10;
}

/**
 * Mendapatkan string tanggal hari ini dalam format YYYY-MM-DD
 * @returns {string}
 */
export function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/* ==========================================================================
   Toast Notification
   ========================================================================== */

/**
 * Menampilkan pesan toast notifikasi
 * @param {string} message - Pesan notifikasi
 * @param {'info'|'success'|'error'} [type='info'] - Tipe toast
 * @param {number} [duration=3000] - Durasi tampil dalam milidetik
 */
export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  // Ikon SVG sesuai tipe
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  } else {
    iconSvg = `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `
    <span class="toast-icon">${iconSvg}</span>
    <span class="toast-text">${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  // Otomatis hilangkan toast setelah durasi selesai
  setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove());
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ==========================================================================
   Komponen Reusable (HTML Generator)
   ========================================================================== */

/**
 * Menentukan status reservasi secara otomatis di sisi klien.
 * Aturan:
 * Jika booking.status === "cancelled" ATAU waktu sekarang (zona waktu lokal)
 * sudah melewati booking_date + end_time, maka status = "selesai".
 * Selain itu status = "terkonfirmasi".
 *
 * @param {Object} booking - Objek booking { booking_date, start_time, end_time, status, ... }
 * @returns {'terkonfirmasi'|'selesai'}
 */
export function getBookingStatus(booking) {
  if (!booking) return 'selesai';

  const rawStatus = String(booking.status || '').toLowerCase().trim();
  if (rawStatus === 'cancelled' || rawStatus === 'dibatalkan') {
    return 'selesai';
  }

  if (!booking.booking_date || !booking.end_time) {
    return 'terkonfirmasi';
  }

  try {
    // Parse tanggal booking (YYYY-MM-DD)
    const dateStr = String(booking.booking_date).split('T')[0];
    const [year, month, day] = dateStr.split('-').map(Number);

    // Parse jam selesai (HH:mm atau HH:mm:ss)
    const timeParts = String(booking.end_time).split(':').map(Number);
    const hour = timeParts[0] || 0;
    const minute = timeParts[1] || 0;
    const second = timeParts[2] || 0;

    // Buat Date objek akhir waktu booking dalam zona waktu lokal
    const endDateTime = new Date(year, month - 1, day, hour, minute, second);
    const now = new Date();

    if (now >= endDateTime) {
      return 'selesai';
    }
  } catch (err) {
    console.warn('[getBookingStatus] Gagal parsing waktu reservasi:', err);
  }

  return 'terkonfirmasi';
}

/**
 * Render badge status reservasi (HTML string)
 * Terkonfirmasi: Biru (bg #DBEAFE, teks #1D4ED8)
 * Selesai: Abu-abu (bg #F3F4F6, teks #6B7280)
 *
 * @param {string|Object} statusOrBooking - String status atau objek booking langsung
 * @returns {string} HTML string
 */
export function renderStatusBadge(statusOrBooking = 'terkonfirmasi') {
  let status = statusOrBooking;
  if (statusOrBooking && typeof statusOrBooking === 'object') {
    status = getBookingStatus(statusOrBooking);
  }

  const normalized = String(status || '').toLowerCase().trim();
  let badgeClass = 'badge-confirmed';
  let label = 'Terkonfirmasi';

  if (normalized === 'selesai' || normalized === 'completed' || normalized === 'cancelled' || normalized === 'dibatalkan') {
    badgeClass = 'badge-selesai';
    label = 'Selesai';
  } else {
    badgeClass = 'badge-confirmed';
    label = 'Terkonfirmasi';
  }

  return `<span class="badge ${badgeClass}">${escapeHtml(label)}</span>`;
}

/**
 * Render satu kartu skeleton loading
 * @returns {string} HTML string
 */
export function renderSkeletonCard() {
  return `
    <div class="skeleton-card">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text-short"></div>
    </div>
  `;
}

/**
 * Render daftar skeleton loading
 * @param {number} [count=3]
 * @returns {string} HTML string
 */
export function renderSkeletonList(count = 3) {
  return Array.from({ length: count }, () => renderSkeletonCard()).join('');
}

/**
 * Render komponen Empty State
 * @param {Object} options
 * @param {string} [options.title='Tidak Ada Data']
 * @param {string} [options.message='Belum ada data yang tersedia saat ini.']
 * @param {string} [options.actionText]
 * @param {string} [options.actionHash]
 * @returns {string} HTML string
 */
export function renderEmptyState({
  title = 'Tidak Ada Data',
  message = 'Belum ada data yang tersedia saat ini.',
  actionText = '',
  actionHash = ''
} = {}) {
  const actionButton = actionText && actionHash ? `
    <a href="${actionHash}" class="btn btn-primary btn-sm">${escapeHtml(actionText)}</a>
  ` : '';

  return `
    <div class="empty-state">
      <div class="empty-state-icon">
        <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      </div>
      <h3 class="empty-state-title">${escapeHtml(title)}</h3>
      <p class="empty-state-message">${escapeHtml(message)}</p>
      ${actionButton}
    </div>
  `;
}

/**
 * Render komponen Pesan Error dengan tombol "Coba lagi"
 * @param {Object} options
 * @param {string} [options.title='Terjadi Kesalahan']
 * @param {string} [options.message='Gagal memuat data dari server.']
 * @param {string} [options.retryButtonId='btn-retry']
 * @returns {string} HTML string
 */
export function renderErrorState({
  title = 'Terjadi Kesalahan',
  message = 'Gagal memuat data dari server.',
  retryButtonId = 'btn-retry'
} = {}) {
  return `
    <div class="error-state">
      <div class="error-state-icon">
        <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h3 class="error-state-title">${escapeHtml(title)}</h3>
      <p class="error-state-message">${escapeHtml(message)}</p>
      <button id="${retryButtonId}" class="btn btn-primary">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"></polyline>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
        </svg>
        Coba Lagi
      </button>
    </div>
  `;
}

/* ==========================================================================
   DOM & String Helper
   ========================================================================== */

/**
 * Shortcut querySelector
 * @param {string} selector
 * @param {Document|HTMLElement} [parent=document]
 * @returns {HTMLElement|null}
 */
export const $ = (selector, parent = document) => parent.querySelector(selector);

/**
 * Shortcut querySelectorAll
 * @param {string} selector
 * @param {Document|HTMLElement} [parent=document]
 * @returns {NodeListOf<HTMLElement>}
 */
export const $$ = (selector, parent = document) => parent.querySelectorAll(selector);

/**
 * Sanitasi string untuk mencegah XSS saat render string ke innerHTML
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Parsing daftar fasilitas dari string comma-separated atau JSON array
 * @param {string|Array} facilities
 * @returns {string[]}
 */
export function parseFacilities(facilities) {
  if (!facilities) return [];
  if (Array.isArray(facilities)) return facilities;
  if (typeof facilities === 'string') {
    try {
      const parsed = JSON.parse(facilities);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Bukan format JSON, lanjutkan split koma
    }
    return facilities.split(',').map((f) => f.trim()).filter(Boolean);
  }
  return [];
}

/**
 * Render elemen placeholder dengan pola geometris arsitektural sesuai tipe ruangan
 * @param {string} [type=''] - Tipe ruangan (Meeting Room, Private Office, Hot Desk)
 * @param {string} [name=''] - Nama ruangan
 * @returns {string} HTML string
 */
export function getRoomPlaceholderHtml(type = '', name = '') {
  const normType = String(type).toLowerCase();
  let typeClass = 'type-default';
  let patternSvg = '';
  let iconSvg = '';

  if (normType.includes('meeting')) {
    typeClass = 'type-meeting';
    iconSvg = `
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    `;
    patternSvg = `
      <svg class="room-pattern-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="mesh-meeting" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#7C3AED" />
            <stop offset="50%" stop-color="#4F46E5" />
            <stop offset="100%" stop-color="#2563EB" />
          </linearGradient>
        </defs>
        <rect width="400" height="250" fill="url(#mesh-meeting)" />
        <circle cx="200" cy="125" r="110" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="6 6" opacity="0.22" />
        <circle cx="200" cy="125" r="70" fill="#FFFFFF" fill-opacity="0.08" />
        <circle cx="200" cy="125" r="36" stroke="#DDD6FE" stroke-width="2" opacity="0.4" />
        <!-- Ikon Besar Semi-Transparan -->
        <g transform="translate(152, 77) scale(4)" stroke="#FFFFFF" stroke-width="1.2" fill="none" opacity="0.16">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </g>
        <circle cx="95" cy="125" r="14" fill="#FFFFFF" fill-opacity="0.25" />
        <circle cx="305" cy="125" r="14" fill="#FFFFFF" fill-opacity="0.25" />
        <circle cx="200" cy="30" r="14" fill="#DDD6FE" fill-opacity="0.35" />
        <circle cx="200" cy="220" r="14" fill="#DDD6FE" fill-opacity="0.35" />
      </svg>
    `;
  } else if (normType.includes('office') || normType.includes('private')) {
    typeClass = 'type-office';
    iconSvg = `
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
    `;
    patternSvg = `
      <svg class="room-pattern-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="mesh-office" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#4338CA" />
            <stop offset="50%" stop-color="#6366F1" />
            <stop offset="100%" stop-color="#9333EA" />
          </linearGradient>
        </defs>
        <rect width="400" height="250" fill="url(#mesh-office)" />
        <rect x="35" y="25" width="150" height="90" rx="12" stroke="#FFFFFF" stroke-width="1.8" opacity="0.2" fill="#FFFFFF" fill-opacity="0.05" />
        <rect x="215" y="25" width="150" height="90" rx="12" stroke="#C4B5FD" stroke-width="1.8" opacity="0.25" fill="#FFFFFF" fill-opacity="0.08" />
        <rect x="35" y="135" width="150" height="90" rx="12" stroke="#C4B5FD" stroke-width="1.8" opacity="0.25" fill="#FFFFFF" fill-opacity="0.08" />
        <rect x="215" y="135" width="150" height="90" rx="12" stroke="#FFFFFF" stroke-width="1.8" opacity="0.2" fill="#FFFFFF" fill-opacity="0.05" />
        <!-- Ikon Besar Semi-Transparan -->
        <g transform="translate(152, 77) scale(4)" stroke="#FFFFFF" stroke-width="1.2" fill="none" opacity="0.16">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </g>
        <line x1="200" y1="15" x2="200" y2="235" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="5 5" opacity="0.22" />
        <line x1="20" y1="125" x2="380" y2="125" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="5 5" opacity="0.22" />
      </svg>
    `;
  } else if (normType.includes('desk') || normType.includes('hot')) {
    typeClass = 'type-hotdesk';
    iconSvg = `
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
    `;
    patternSvg = `
      <svg class="room-pattern-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="mesh-hotdesk" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#8B5CF6" />
            <stop offset="50%" stop-color="#6366F1" />
            <stop offset="100%" stop-color="#2563EB" />
          </linearGradient>
        </defs>
        <rect width="400" height="250" fill="url(#mesh-hotdesk)" />
        <path d="M-50 50 L150 -50 M-50 150 L250 -50 M-50 250 L350 -50 M50 350 L450 50 M150 350 L450 150 M250 350 L450 250" stroke="#FFFFFF" stroke-width="2" opacity="0.16" />
        <path d="M-50 100 L100 250 M50 -50 L350 250 M150 -50 L450 250 M250 -50 L450 150" stroke="#DDD6FE" stroke-width="2" opacity="0.22" />
        <!-- Ikon Besar Semi-Transparan -->
        <g transform="translate(152, 77) scale(4)" stroke="#FFFFFF" stroke-width="1.2" fill="none" opacity="0.18">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </g>
        <circle cx="100" cy="80" r="10" fill="#FFFFFF" fill-opacity="0.25" />
        <circle cx="200" cy="180" r="12" fill="#DDD6FE" fill-opacity="0.32" />
        <circle cx="300" cy="70" r="10" fill="#FFFFFF" fill-opacity="0.25" />
      </svg>
    `;
  } else {
    typeClass = 'type-default';
    iconSvg = `
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
        <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
        <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
        <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
      </svg>
    `;
    patternSvg = `
      <svg class="room-pattern-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="mesh-default" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#7C3AED" />
            <stop offset="100%" stop-color="#2563EB" />
          </linearGradient>
        </defs>
        <rect width="400" height="250" fill="url(#mesh-default)" />
        <circle cx="80" cy="80" r="60" stroke="#FFFFFF" stroke-width="2" opacity="0.18" />
        <circle cx="320" cy="170" r="70" stroke="#DDD6FE" stroke-width="2" opacity="0.25" />
        <g transform="translate(152, 77) scale(4)" stroke="#FFFFFF" stroke-width="1.2" fill="none" opacity="0.16">
          <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
          <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
          <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
          <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
        </g>
      </svg>
    `;
  }

  return `
    <div class="room-geometric-pattern ${typeClass}">
      ${patternSvg}
      <div class="room-pattern-overlay">
        <div class="room-pattern-badge">
          ${iconSvg}
          <span>${escapeHtml(type || 'Coworking Room')}</span>
        </div>
      </div>
    </div>
  `;
}

// Re-export dialog konfirmasi agar dapat diakses dari utils
export { showConfirmDialog } from './components/confirmDialog.js';

/* ==========================================================================
   Peta Gambar Ruangan Lokal
   ========================================================================== */

/**
 * Peta file gambar ruangan lokal berdasarkan kecocokan nama dan tipe
 */
const ROOM_LOCAL_IMAGE_MAP = [
  // 1. Focus Pod (Bilik kerja individual)
  {
    keywords: ['focus', 'pod', 'bilik', 'booth', 'phone'],
    image: 'images/rooms/focus-pod.jpg'
  },
  // 2. Hot Desk (Area meja bersama)
  {
    keywords: ['hot desk', 'open space', 'desk', 'sharing', 'cowork'],
    image: 'images/rooms/hot-desk-area.jpg'
  },
  // 3. Merapi Meeting Room (Ruang rapat meja panjang kayu)
  {
    keywords: ['merapi', 'meeting a', 'rapat utama', 'conference'],
    image: 'images/rooms/merapi-meeting-room.jpg'
  },
  // 4. Sindoro Meeting Room (Ruang rapat modern sofa biru & pemandangan pohon)
  {
    keywords: ['sindoro', 'meeting b', 'boardroom', 'executive'],
    image: 'images/rooms/sindoro-meeting-room.jpg'
  },
  // 5. Creative Space / Breakout Space (Lesehan rumput sintetis & beanbag)
  {
    keywords: ['creative', 'breakout', 'santai', 'beanbag', 'lounge', 'kreatif'],
    image: 'images/rooms/creative-room.jpg'
  },
  // 6. Private Office Alpha / 1 (Ruang kantor privat tim)
  {
    keywords: ['alpha', 'office 1', 'office a', 'suite 1', 'private office 1'],
    image: 'images/rooms/private-office-1.jpg'
  },
  // 7. Private Office Beta / 2 (Ruang kantor privat sofa & rak kayu)
  {
    keywords: ['beta', 'office 2', 'office b', 'suite 2', 'private office 2', 'private'],
    image: 'images/rooms/private-office-2.jpg'
  }
];

/**
 * Dapatkan URL gambar ruangan yang paling sesuai.
 * Mengutamakan image_url dari database, lalu fallback ke foto aset lokal berdasarkan nama/tipe.
 * @param {Object} room
 * @returns {string|null}
 */
export function getRoomImageUrl(room) {
  if (!room) return null;

  // Jika image_url dari backend sudah berupa URL yang valid
  if (room.image_url && typeof room.image_url === 'string' && room.image_url.trim().length > 0) {
    return room.image_url.trim();
  }

  const name = String(room.name || '').toLowerCase();
  const type = String(room.type || '').toLowerCase();

  // 1. Cocokkan berdasarkan nama ruangan
  for (const entry of ROOM_LOCAL_IMAGE_MAP) {
    if (entry.keywords.some(kw => name.includes(kw))) {
      return entry.image;
    }
  }

  // 2. Fallback berdasarkan tipe ruangan
  if (type.includes('meeting')) {
    return 'images/rooms/merapi-meeting-room.jpg';
  }
  if (type.includes('desk')) {
    return 'images/rooms/hot-desk-area.jpg';
  }
  if (type.includes('office')) {
    return 'images/rooms/private-office-1.jpg';
  }

  return 'images/rooms/creative-room.jpg';
}




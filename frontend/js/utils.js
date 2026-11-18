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
 * Render badge status booking (confirmed hijau, cancelled merah)
 * @param {string} status - 'confirmed' | 'cancelled' | string
 * @returns {string} HTML string
 */
export function renderStatusBadge(status = 'confirmed') {
  const normalized = String(status).toLowerCase();
  let badgeClass = 'badge-pending';
  let label = status;

  if (normalized === 'confirmed') {
    badgeClass = 'badge-confirmed';
    label = 'Terkonfirmasi';
  } else if (normalized === 'cancelled') {
    badgeClass = 'badge-cancelled';
    label = 'Dibatalkan';
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
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    `;
    patternSvg = `
      <svg class="room-pattern-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="250" fill="#EDF4F0" />
        <circle cx="200" cy="125" r="90" stroke="#3F6B5A" stroke-width="2" stroke-dasharray="6 6" opacity="0.3" />
        <circle cx="200" cy="125" r="60" fill="#3F6B5A" fill-opacity="0.1" />
        <circle cx="200" cy="125" r="32" stroke="#D97B4A" stroke-width="2" opacity="0.4" />
        <circle cx="110" cy="125" r="14" fill="#3F6B5A" fill-opacity="0.22" />
        <circle cx="290" cy="125" r="14" fill="#3F6B5A" fill-opacity="0.22" />
        <circle cx="200" cy="35" r="14" fill="#D97B4A" fill-opacity="0.3" />
        <circle cx="200" cy="215" r="14" fill="#D97B4A" fill-opacity="0.3" />
        <circle cx="135" cy="62" r="12" fill="#3F6B5A" fill-opacity="0.18" />
        <circle cx="265" cy="62" r="12" fill="#3F6B5A" fill-opacity="0.18" />
        <circle cx="135" cy="188" r="12" fill="#3F6B5A" fill-opacity="0.18" />
        <circle cx="265" cy="188" r="12" fill="#3F6B5A" fill-opacity="0.18" />
        <line x1="0" y1="125" x2="400" y2="125" stroke="#3F6B5A" stroke-width="1" opacity="0.16" />
        <line x1="200" y1="0" x2="200" y2="250" stroke="#3F6B5A" stroke-width="1" opacity="0.16" />
      </svg>
    `;
  } else if (normType.includes('office') || normType.includes('private')) {
    typeClass = 'type-office';
    iconSvg = `
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
    `;
    patternSvg = `
      <svg class="room-pattern-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="250" fill="#FAF5ED" />
        <rect x="40" y="25" width="145" height="90" rx="10" stroke="#3F6B5A" stroke-width="2" opacity="0.25" fill="#3F6B5A" fill-opacity="0.06" />
        <rect x="215" y="25" width="145" height="90" rx="10" stroke="#D97B4A" stroke-width="2" opacity="0.3" fill="#D97B4A" fill-opacity="0.06" />
        <rect x="40" y="135" width="145" height="90" rx="10" stroke="#D97B4A" stroke-width="2" opacity="0.3" fill="#D97B4A" fill-opacity="0.06" />
        <rect x="215" y="135" width="145" height="90" rx="10" stroke="#3F6B5A" stroke-width="2" opacity="0.25" fill="#3F6B5A" fill-opacity="0.06" />
        <line x1="200" y1="15" x2="200" y2="235" stroke="#3F6B5A" stroke-width="1.5" stroke-dasharray="5 5" opacity="0.2" />
        <line x1="20" y1="125" x2="380" y2="125" stroke="#3F6B5A" stroke-width="1.5" stroke-dasharray="5 5" opacity="0.2" />
      </svg>
    `;
  } else if (normType.includes('desk') || normType.includes('hot')) {
    typeClass = 'type-hotdesk';
    iconSvg = `
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
    `;
    patternSvg = `
      <svg class="room-pattern-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="250" fill="#FCF6F0" />
        <path d="M-50 50 L150 -50 M-50 150 L250 -50 M-50 250 L350 -50 M50 350 L450 50 M150 350 L450 150 M250 350 L450 250" stroke="#3F6B5A" stroke-width="2" opacity="0.14" />
        <path d="M-50 100 L100 250 M50 -50 L350 250 M150 -50 L450 250 M250 -50 L450 150" stroke="#D97B4A" stroke-width="2" opacity="0.18" />
        <circle cx="100" cy="80" r="10" fill="#3F6B5A" fill-opacity="0.2" />
        <circle cx="200" cy="180" r="12" fill="#D97B4A" fill-opacity="0.25" />
        <circle cx="300" cy="70" r="10" fill="#3F6B5A" fill-opacity="0.2" />
      </svg>
    `;
  } else {
    typeClass = 'type-default';
    iconSvg = `
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
        <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
        <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
        <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
      </svg>
    `;
    patternSvg = `
      <svg class="room-pattern-svg" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="250" fill="#FAF7F2" />
        <circle cx="80" cy="80" r="50" stroke="#3F6B5A" stroke-width="2" opacity="0.15" />
        <circle cx="320" cy="170" r="60" stroke="#D97B4A" stroke-width="2" opacity="0.18" />
        <path d="M0 200 Q200 100 400 200" stroke="#3F6B5A" stroke-width="1.5" stroke-dasharray="6 6" opacity="0.2" />
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



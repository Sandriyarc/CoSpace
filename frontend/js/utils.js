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


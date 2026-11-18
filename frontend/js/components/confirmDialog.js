/**
 * Komponen Dialog Konfirmasi Bergaya Modal
 * Pengganti confirm() bawaan browser dengan tampilan modern & mobile-first
 */

import { escapeHtml } from '../utils.js';

/**
 * Menampilkan dialog konfirmasi bergaya modal
 * @param {Object} options
 * @param {string} options.title - Judul dialog
 * @param {string} options.message - Penjelasan singkat
 * @param {string} [options.confirmText='Ya, lanjutkan'] - Label tombol konfirmasi
 * @param {string} [options.cancelText='Batal'] - Label tombol batal
 * @param {string} [options.confirmVariant='danger'] - Varian tombol konfirmasi ('danger' | 'primary')
 * @returns {Promise<boolean>} Promise yang bernilai true jika dikonfirmasi, false jika dibatalkan
 */
export function showConfirmDialog({
  title = 'Konfirmasi Tindakan',
  message = '',
  confirmText = 'Ya, lanjutkan',
  cancelText = 'Batal',
  confirmVariant = 'danger'
} = {}) {
  return new Promise((resolve) => {
    // Bersihkan dialog sebelumnya jika masih aktif di DOM
    const oldDialog = document.getElementById('cospace-confirm-modal');
    if (oldDialog) {
      oldDialog.remove();
    }

    // Buat elemen overlay backdrop
    const overlay = document.createElement('div');
    overlay.id = 'cospace-confirm-modal';
    overlay.className = 'modal-backdrop';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'confirm-modal-title');
    overlay.setAttribute('aria-describedby', 'confirm-modal-desc');

    const confirmBtnClass = confirmVariant === 'danger' ? 'btn btn-danger' : 'btn btn-primary';

    overlay.innerHTML = `
      <div class="modal-dialog-card" role="document">
        <div class="modal-dialog-header">
          <div class="modal-dialog-icon ${confirmVariant}">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3 id="confirm-modal-title" class="modal-dialog-title">${escapeHtml(title)}</h3>
        </div>
        <div class="modal-dialog-body">
          <p id="confirm-modal-desc" class="modal-dialog-message">${escapeHtml(message)}</p>
        </div>
        <div class="modal-dialog-actions">
          <button type="button" class="btn btn-secondary modal-btn-cancel" id="confirm-modal-btn-cancel">
            ${escapeHtml(cancelText)}
          </button>
          <button type="button" class="${confirmBtnClass} modal-btn-confirm" id="confirm-modal-btn-confirm">
            ${escapeHtml(confirmText)}
          </button>
        </div>
      </div>
    `;

    // Handler penutupan dialog
    function closeDialog(result) {
      document.removeEventListener('keydown', handleKeyDown);
      overlay.classList.add('modal-closing');
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.remove();
        }
      }, 150);
      resolve(result);
    }

    // Handler tombol Escape keyboard
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeDialog(false);
      }
    }

    // Handler klik di luar dialog (pada backdrop)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeDialog(false);
      }
    });

    // Event listener tombol aksi
    const cancelBtn = overlay.querySelector('#confirm-modal-btn-cancel');
    const confirmBtn = overlay.querySelector('#confirm-modal-btn-confirm');

    cancelBtn?.addEventListener('click', () => closeDialog(false));
    confirmBtn?.addEventListener('click', () => closeDialog(true));

    document.addEventListener('keydown', handleKeyDown);

    // Tambahkan dialog ke body
    document.body.appendChild(overlay);

    // Fokus awal pada tombol Batal demi keamanan pengguna
    cancelBtn?.focus();
  });
}


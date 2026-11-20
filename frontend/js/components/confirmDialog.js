/**
 * Komponen Dialog Konfirmasi Bergaya Modal
 * Pengganti confirm() bawaan browser dengan tampilan modern & mobile-first
 */

import {
  escapeHtml,
  formatDateIndo,
  formatTime,
  formatRupiah,
  calculateDurationHours
} from '../utils.js';

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

/**
 * Menampilkan modal dialog konfirmasi ringkasan pemesanan sebelum dikirim ke server
 * @param {Object} options
 * @param {string} options.roomName
 * @param {string} options.bookingDate
 * @param {string} options.startTime
 * @param {string} options.endTime
 * @param {number} options.duration
 * @param {number} options.totalCost
 * @param {string} options.name
 * @param {string} options.email
 * @param {string} options.phone
 * @param {string} [options.institution]
 * @param {string} [options.notes]
 * @param {Function} options.onConfirm - Callback async saat user klik "Ya, Buat Reservasi"
 * @param {Function} [options.onError] - Callback saat onConfirm mengalami kegagalan
 */
export function showBookingSummaryConfirmModal({
  roomName,
  pricePerHour = 0,
  bookingDate,
  startTime,
  endTime,
  duration,
  totalCost,
  name,
  email,
  phone,
  institution = '',
  notes = '',
  onConfirm,
  onError
}) {
  return new Promise((resolve) => {
    // Bersihkan dialog sebelumnya jika masih aktif di DOM
    const oldDialog = document.getElementById('cospace-confirm-modal');
    if (oldDialog) {
      oldDialog.remove();
    }

    const calculatedCost = Number(totalCost) > 0 ? Number(totalCost) : (Number(duration) * Number(pricePerHour || 0));

    const overlay = document.createElement('div');
    overlay.id = 'cospace-confirm-modal';
    overlay.className = 'modal-backdrop';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    overlay.innerHTML = `
      <div class="modal-dialog-card modal-booking-card" role="document">
        <div class="modal-dialog-header">
          <div class="modal-dialog-icon primary">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div>
            <h3 class="modal-dialog-title">Konfirmasi Reservasi</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">Tinjau kembali rincian pemesanan Anda.</p>
          </div>
        </div>

        <div class="modal-dialog-body" style="margin-bottom: 16px;">
          <!-- Ringkasan Reservasi -->
          <div class="modal-summary-box">
            <div class="modal-summary-row">
              <span class="modal-summary-label">Ruangan</span>
              <strong class="modal-summary-value">${escapeHtml(roomName)}</strong>
            </div>
            <div class="modal-summary-row">
              <span class="modal-summary-label">Tanggal</span>
              <span class="modal-summary-value">${formatDateIndo(bookingDate, true)}</span>
            </div>
            <div class="modal-summary-row">
              <span class="modal-summary-label">Waktu</span>
              <span class="modal-summary-value">${formatTime(startTime)} - ${formatTime(endTime)}</span>
            </div>
            <div class="modal-summary-row">
              <span class="modal-summary-label">Durasi</span>
              <span class="modal-summary-value">${duration} Jam</span>
            </div>
            <div class="modal-summary-row modal-summary-highlight">
              <span class="modal-summary-label">Estimasi Biaya</span>
              <strong class="modal-summary-value price">${formatRupiah(calculatedCost)}</strong>
            </div>
            <div class="modal-summary-divider"></div>
            <div class="modal-summary-row">
              <span class="modal-summary-label">Nama</span>
              <span class="modal-summary-value">${escapeHtml(name)}</span>
            </div>
            <div class="modal-summary-row">
              <span class="modal-summary-label">Email</span>
              <span class="modal-summary-value">${escapeHtml(email)}</span>
            </div>
            <div class="modal-summary-row">
              <span class="modal-summary-label">No. Telepon</span>
              <span class="modal-summary-value">${escapeHtml(phone)}</span>
            </div>
            ${institution ? `
              <div class="modal-summary-row">
                <span class="modal-summary-label">Instansi</span>
                <span class="modal-summary-value">${escapeHtml(institution)}</span>
              </div>
            ` : ''}
            <div class="modal-summary-row">
              <span class="modal-summary-label">Catatan</span>
              <span class="modal-summary-value">${notes ? escapeHtml(notes) : '<em style="color: var(--text-muted);">-</em>'}</span>
            </div>
          </div>

          <!-- Kotak Peringatan Berwarna (Ikon Peringatan) -->
          <div class="modal-warning-box">
            <svg class="modal-warning-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <div class="modal-warning-text">
              Pastikan semua data sudah benar. Reservasi tidak dapat dibatalkan atau diubah setelah dibuat.
            </div>
          </div>
        </div>

        <div class="modal-dialog-actions">
          <button type="button" class="btn btn-secondary modal-btn-cancel" id="booking-modal-btn-cancel">
            Periksa Lagi
          </button>
          <button type="button" class="btn btn-primary modal-btn-confirm" id="booking-modal-btn-confirm">
            Ya, Buat Reservasi
          </button>
        </div>
      </div>
    `;

    let isSubmitting = false;

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

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (isSubmitting) return; // Dicegah saat proses kirim berlangsung
        e.preventDefault();
        closeDialog(false);
      }
    }

    function handleBackdropClick(e) {
      if (e.target === overlay) {
        if (isSubmitting) return; // Dicegah saat proses kirim berlangsung
        closeDialog(false);
      }
    }

    const cancelBtn = overlay.querySelector('#booking-modal-btn-cancel');
    const confirmBtn = overlay.querySelector('#booking-modal-btn-confirm');

    cancelBtn?.addEventListener('click', () => {
      if (isSubmitting) return;
      closeDialog(false);
    });

    confirmBtn?.addEventListener('click', async () => {
      if (isSubmitting) return;
      isSubmitting = true;

      // Status loading & cegah klik ganda
      confirmBtn.disabled = true;
      cancelBtn.disabled = true;
      confirmBtn.innerHTML = `
        <svg class="spin" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" style="animation: spin 1s linear infinite; display: inline-block; vertical-align: middle; margin-right: 6px;">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="0.8"></path>
        </svg>
        Memproses...
      `;

      try {
        if (typeof onConfirm === 'function') {
          await onConfirm();
        }
        closeDialog(true);
      } catch (err) {
        isSubmitting = false;
        confirmBtn.disabled = false;
        cancelBtn.disabled = false;
        confirmBtn.textContent = 'Ya, Buat Reservasi';

        if (typeof onError === 'function') {
          await onError(err);
        }
        closeDialog(false);
      }
    });

    overlay.addEventListener('click', handleBackdropClick);
    document.addEventListener('keydown', handleKeyDown);

    document.body.appendChild(overlay);
    cancelBtn?.focus();
  });
}

/**
 * Menampilkan modal dialog sukses singkat setelah reservasi berhasil dibuat
 * @param {Object} booking - Objek reservasi lengkap beserta relasi
 * @param {Function} onViewReservation - Callback saat user klik tombol "Lihat Reservasi" atau menutup dialog
 */
export function showBookingSuccessModal(booking, onViewReservation) {
  const oldDialog = document.getElementById('cospace-confirm-modal');
  if (oldDialog) {
    oldDialog.remove();
  }

  const overlay = document.createElement('div');
  overlay.id = 'cospace-confirm-modal';
  overlay.className = 'modal-backdrop';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  const room = booking?.rooms || {};
  const roomName = room.name || booking?.roomName || 'Ruangan';
  const duration = calculateDurationHours(booking?.start_time, booking?.end_time);
  const pricePerHour = Number(room.price_per_hour || booking?.price_per_hour) || 0;
  const totalCost = Number(booking?.totalCost || booking?.total_cost) > 0
    ? Number(booking?.totalCost || booking?.total_cost)
    : (duration * pricePerHour);
  const customer = booking?.customers || {};
  const customerName = customer.name || booking?.name || 'Pelanggan';
  const customerPhone = customer.phone || booking?.phone || '-';
  const institution = (customer.institution || booking?.institution || '').trim();
  const notes = (booking?.notes || '').trim();

  overlay.innerHTML = `
    <div class="modal-dialog-card modal-booking-card" role="document">
      <div class="modal-success-header">
        <div class="modal-success-icon-badge">
          <svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h3 class="modal-dialog-title" style="margin-bottom: 4px;">Reservasi Berhasil Dibuat</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Pemesanan ruangan Anda telah berhasil tersimpan dalam sistem.</p>
      </div>

      <div class="modal-dialog-body" style="margin-bottom: 20px;">
        <!-- Ringkasan Reservasi -->
        <div class="modal-summary-box">
          <div class="modal-summary-row">
            <span class="modal-summary-label">Ruangan</span>
            <strong class="modal-summary-value">${escapeHtml(roomName)}</strong>
          </div>
          <div class="modal-summary-row">
            <span class="modal-summary-label">Tanggal</span>
            <span class="modal-summary-value">${formatDateIndo(booking.booking_date, true)}</span>
          </div>
          <div class="modal-summary-row">
            <span class="modal-summary-label">Waktu</span>
            <span class="modal-summary-value">${formatTime(booking.start_time)} - ${formatTime(booking.end_time)} (${duration} Jam)</span>
          </div>
          <div class="modal-summary-row modal-summary-highlight">
            <span class="modal-summary-label">Estimasi Biaya</span>
            <strong class="modal-summary-value price">${formatRupiah(totalCost)}</strong>
          </div>
          <div class="modal-summary-divider"></div>
          <div class="modal-summary-row">
            <span class="modal-summary-label">Pemesan</span>
            <span class="modal-summary-value">${escapeHtml(customerName)} (${escapeHtml(customerPhone)})</span>
          </div>
          ${institution ? `
            <div class="modal-summary-row">
              <span class="modal-summary-label">Instansi</span>
              <span class="modal-summary-value">${escapeHtml(institution)}</span>
            </div>
          ` : ''}
          <div class="modal-summary-row">
            <span class="modal-summary-label">Catatan</span>
            <span class="modal-summary-value">${notes ? escapeHtml(notes) : '<em style="color: var(--text-muted);">-</em>'}</span>
          </div>
        </div>
      </div>

      <div class="modal-dialog-actions">
        <button type="button" class="btn btn-primary btn-block" id="success-modal-btn-view">
          Lihat Reservasi
        </button>
      </div>
    </div>
  `;

  function closeAndRedirect() {
    document.removeEventListener('keydown', handleKeyDown);
    overlay.classList.add('modal-closing');
    setTimeout(() => {
      if (overlay.parentNode) overlay.remove();
    }, 150);
    if (typeof onViewReservation === 'function') {
      onViewReservation();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeAndRedirect();
    }
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeAndRedirect();
    }
  });

  const viewBtn = overlay.querySelector('#success-modal-btn-view');
  viewBtn?.addEventListener('click', () => {
    closeAndRedirect();
  });

  document.addEventListener('keydown', handleKeyDown);
  document.body.appendChild(overlay);
  viewBtn?.focus();
}


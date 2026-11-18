/**
 * Halaman Detail Reservasi
 * Rute: #/bookings/:id
 */

import { bookingApi } from '../api.js';
import {
  formatRupiah,
  formatDateIndo,
  formatTime,
  calculateDurationHours,
  escapeHtml,
  renderStatusBadge,
  renderErrorState,
  showToast,
  $
} from '../utils.js';
import { showConfirmDialog } from '../components/confirmDialog.js';

export function render(container, context = {}) {
  const bookingId = context.params?.id;

  if (!bookingId) {
    container.innerHTML = renderErrorState({
      title: 'Reservasi Tidak Ditemukan',
      message: 'ID reservasi tidak valid atau tidak disertakan.'
    });
    return;
  }

  // Tampilkan skeleton loader awal
  container.innerHTML = `
    <div class="booking-detail-page">
      <div class="skeleton-card">
        <div class="skeleton skeleton-title" style="width: 60%;"></div>
        <div class="skeleton skeleton-text" style="width: 35%;"></div>
      </div>
      <div class="skeleton-card">
        <div class="skeleton skeleton-title" style="width: 40%; margin-bottom: 14px;"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
      </div>
    </div>
  `;

  async function loadBookingDetail() {
    try {
      const booking = await bookingApi.getById(bookingId);

      // Perbarui judul di Top Bar
      const pageTitle = $('#page-title');
      if (pageTitle) {
        pageTitle.textContent = 'Detail Reservasi';
      }

      const room = booking.rooms || {};
      const customer = booking.customers || {};
      const durationHours = calculateDurationHours(booking.start_time, booking.end_time);
      const pricePerHour = Number(room.price_per_hour) || 0;
      const totalCost = durationHours * pricePerHour;

      container.innerHTML = `
        <div class="booking-detail-page">
          <!-- Kartu Header Ruangan & Status -->
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 8px;">
              <div>
                <h2 class="card-title" style="font-size: 1.25rem; margin-bottom: 2px;">${escapeHtml(room.name || 'Ruangan')}</h2>
                <span style="font-size: 0.82rem; color: var(--text-muted); font-weight: 500;">Tipe: ${escapeHtml(room.type || '-')}</span>
              </div>
              <div id="booking-badge-container">
                ${renderStatusBadge(booking.status)}
              </div>
            </div>
          </div>

          <!-- Rincian Waktu & Biaya Reservasi -->
          <div class="card">
            <h3 class="card-title" style="font-size: 1rem; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Jadwal & Biaya
            </h3>
            <div class="detail-info-list">
              <div class="detail-info-row">
                <span class="detail-info-label">Tanggal</span>
                <span class="detail-info-value">${formatDateIndo(booking.booking_date, true)}</span>
              </div>
              <div class="detail-info-row">
                <span class="detail-info-label">Waktu</span>
                <span class="detail-info-value" style="color: var(--primary-dark);">${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}</span>
              </div>
              <div class="detail-info-row">
                <span class="detail-info-label">Durasi</span>
                <span class="detail-info-value">${durationHours} Jam</span>
              </div>
              <div class="detail-info-row">
                <span class="detail-info-label">Tarif Ruangan</span>
                <span class="detail-info-value">${formatRupiah(pricePerHour)} / jam</span>
              </div>
              <div class="detail-info-row">
                <span class="detail-info-label">Estimasi Total Biaya</span>
                <span class="detail-info-value price-highlight">${formatRupiah(totalCost)}</span>
              </div>
            </div>
          </div>

          <!-- Rincian Data Pemesan -->
          <div class="card">
            <h3 class="card-title" style="font-size: 1rem; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Data Pemesan
            </h3>
            <div class="detail-info-list">
              <div class="detail-info-row">
                <span class="detail-info-label">Nama</span>
                <span class="detail-info-value">${escapeHtml(customer.name || '-')}</span>
              </div>
              <div class="detail-info-row">
                <span class="detail-info-label">Email</span>
                <span class="detail-info-value">${escapeHtml(customer.email || '-')}</span>
              </div>
              <div class="detail-info-row">
                <span class="detail-info-label">Telepon</span>
                <span class="detail-info-value">${escapeHtml(customer.phone || '-')}</span>
              </div>
              <div class="detail-info-row">
                <span class="detail-info-label">Instansi</span>
                <span class="detail-info-value">${escapeHtml(customer.institution?.trim() || '-')}</span>
              </div>
              <div class="detail-info-row">
                <span class="detail-info-label">Catatan</span>
                <span class="detail-info-value">${escapeHtml(booking.notes?.trim() || '-')}</span>
              </div>
            </div>
          </div>

          <!-- Tombol Aksi Pengelolaan Booking -->
          <div class="action-buttons-group">
            ${
              String(booking.status).toLowerCase() === 'confirmed'
                ? `<button id="btn-cancel-booking" class="btn btn-outline-danger btn-block" type="button">
                     <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                       <circle cx="12" cy="12" r="10"></circle>
                       <line x1="15" y1="9" x2="9" y2="15"></line>
                       <line x1="9" y1="9" x2="15" y2="15"></line>
                     </svg>
                     Batalkan Reservasi
                   </button>`
                : ''
            }
            <a href="#/rooms/${encodeURIComponent(booking.room_id)}" class="btn btn-secondary btn-block">
              Lihat Detail Ruangan Ini
            </a>

            <!-- Tombol Hapus: Gaya teks merah di bawah dengan ikon -->
            <div class="action-danger-zone">
              <button id="btn-delete-booking" class="btn-text-danger" type="button">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Hapus Reservasi
              </button>
            </div>
          </div>
        </div>
      `;

      // Event listener tombol "Batalkan Reservasi"
      const cancelBtn = container.querySelector('#btn-cancel-booking');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', async () => {
          const isConfirmed = await showConfirmDialog({
            title: 'Batalkan Reservasi',
            message: 'Apakah Anda yakin ingin membatalkan reservasi ini?',
            confirmText: 'Ya, lanjutkan',
            cancelText: 'Batal',
            confirmVariant: 'danger'
          });
          if (!isConfirmed) return;

          cancelBtn.disabled = true;
          cancelBtn.textContent = 'Memproses pembatalan...';

          try {
            // Kirim PUT /api/bookings/:id dengan update parsial status: 'cancelled'
            await bookingApi.update(bookingId, { status: 'cancelled' });
            showToast('Reservasi berhasil dibatalkan.', 'info');

            // Perbarui tampilan halaman
            loadBookingDetail();
          } catch (err) {
            cancelBtn.disabled = false;
            cancelBtn.innerHTML = `
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              Batalkan Reservasi
            `;
            showToast(err.message || 'Gagal membatalkan reservasi.', 'error');
          }
        });
      }

      // Event listener tombol "Hapus Reservasi"
      const deleteBtn = container.querySelector('#btn-delete-booking');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
          const isConfirmed = await showConfirmDialog({
            title: 'Hapus Reservasi',
            message: 'Apakah Anda yakin ingin menghapus reservasi ini secara permanen? Data yang telah dihapus tidak dapat dipulihkan.',
            confirmText: 'Ya, lanjutkan',
            cancelText: 'Batal',
            confirmVariant: 'danger'
          });
          if (!isConfirmed) return;

          deleteBtn.disabled = true;
          deleteBtn.textContent = 'Menghapus data...';

          try {
            // Kirim DELETE /api/bookings/:id
            await bookingApi.delete(bookingId);
            showToast('Reservasi berhasil dihapus.', 'success');

            // Arahkan kembali ke halaman jadwal (#/bookings)
            window.location.hash = '#/bookings';
          } catch (err) {
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = `
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Hapus Reservasi
            `;
            showToast(err.message || 'Gagal menghapus reservasi.', 'error');
          }
        });
      }
    } catch (err) {
      container.innerHTML = renderErrorState({
        title: 'Gagal Memuat Detail Reservasi',
        message: err.message || 'Terjadi gangguan saat mengambil data reservasi dari server.',
        retryButtonId: 'btn-retry-booking-detail'
      });

      const retryBtn = container.querySelector('#btn-retry-booking-detail');
      if (retryBtn) {
        retryBtn.addEventListener('click', loadBookingDetail);
      }
    }
  }

  loadBookingDetail();
}

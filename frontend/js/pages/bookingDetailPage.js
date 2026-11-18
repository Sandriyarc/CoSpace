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
  $
} from '../utils.js';

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
          <!-- Kartu Header Ruangan & Status + Tombol Lihat Detail Ruangan -->
          <div class="card booking-detail-header-card card-static">
            <div class="detail-header-gradient-bar"></div>
            <div class="booking-detail-header-row">
              <div class="booking-detail-header-info">
                <div class="booking-detail-title-badge-row">
                  <h2 class="card-title booking-detail-room-name">${escapeHtml(room.name || 'Ruangan')}</h2>
                  <div id="booking-badge-container">
                    ${renderStatusBadge(booking.status)}
                  </div>
                </div>
                <span class="booking-detail-room-type">Tipe: ${escapeHtml(room.type || '-')}</span>
              </div>
              <div class="booking-detail-header-action">
                <a href="#/rooms/${encodeURIComponent(booking.room_id)}" class="btn btn-primary btn-view-room">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <span>Lihat Detail Ruangan Ini</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Grid 2 Kolom: Jadwal & Biaya dan Data Pemesan -->
          <div class="booking-detail-grid">
            <!-- Rincian Waktu & Biaya Reservasi -->
            <div class="card booking-detail-schedule-card card-static">
              <h3 class="card-title" style="font-size: 1rem; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Jadwal & Biaya
              </h3>

              <!-- Ringkasan Biaya Kartu Gradien dengan Angka Besar -->
              <div class="cost-summary-gradient-card" style="margin-bottom: 16px;">
                <span class="cost-summary-label">Estimasi Total Biaya</span>
                <div class="cost-summary-amount price-highlight">${formatRupiah(totalCost)}</div>
                <span class="cost-summary-sub">${durationHours} Jam × ${formatRupiah(pricePerHour)}/jam</span>
              </div>

              <div class="detail-info-list">
                <div class="detail-info-row">
                  <span class="detail-info-label">Tanggal</span>
                  <span class="detail-info-value">${formatDateIndo(booking.booking_date, true)}</span>
                </div>
                <div class="detail-info-row">
                  <span class="detail-info-label">Waktu</span>
                  <span class="detail-info-value" style="color: var(--primary); font-weight: 700;">${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}</span>
                </div>
                <div class="detail-info-row">
                  <span class="detail-info-label">Durasi</span>
                  <span class="detail-info-value">${durationHours} Jam</span>
                </div>
                <div class="detail-info-row">
                  <span class="detail-info-label">Tarif Ruangan</span>
                  <span class="detail-info-value">${formatRupiah(pricePerHour)} / jam</span>
                </div>
              </div>
            </div>

            <!-- Rincian Data Pemesan -->
            <div class="card booking-detail-customer-card card-static">
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
          </div>
        </div>
      `;
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

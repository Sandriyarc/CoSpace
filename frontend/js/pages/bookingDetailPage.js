/**
 * Halaman Detail Booking (Placeholder)
 * Rute: #/bookings/:id
 */
import { escapeHtml, renderStatusBadge } from '../utils.js';

export function render(container, context = {}) {
  const bookingId = context.params?.id || 'ID Booking';

  container.innerHTML = `
    <div class="placeholder-page">
      <div class="placeholder-header">
        <span class="placeholder-badge">Detail Reservasi</span>
        <h2 class="placeholder-title">Informasi Jadwal</h2>
        <p class="placeholder-desc">ID Parameter Rute: <code>${escapeHtml(bookingId)}</code></p>
      </div>

      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 class="card-title" style="margin-bottom: 0;">Status Reservasi</h3>
          ${renderStatusBadge('confirmed')}
        </div>
        <p class="card-subtitle" style="margin-bottom: 16px;">
          Halaman ini menampilkan detail ruangan, pelanggan, tanggal, jam mulai & selesai, dan catatan.
        </p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <a href="#/bookings" class="btn btn-secondary btn-block">
            Kembali ke Daftar Jadwal
          </a>
        </div>
      </div>
    </div>
  `;
}


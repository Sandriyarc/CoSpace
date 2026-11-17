/**
 * Halaman Jadwal Reservasi (Placeholder)
 * Rute: #/bookings
 */
import { renderEmptyState } from '../utils.js';

export function render(container) {
  container.innerHTML = `
    <div class="placeholder-page">
      <div class="placeholder-header">
        <span class="placeholder-badge">Jadwal & Agenda</span>
        <h2 class="placeholder-title">Jadwal Reservasi</h2>
        <p class="placeholder-desc">Pantau ketersediaan slot waktu dan reservasi coworking space.</p>
      </div>

      <div class="card">
        <h3 class="card-title">Daftar Jadwal (Placeholder)</h3>
        <p class="card-subtitle" style="margin-bottom: 12px;">Klik untuk melihat contoh halaman detail jadwal:</p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <a href="#/bookings/sample-booking-1" class="btn btn-secondary btn-block">Detail Reservasi #1</a>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Contoh Komponen Empty State</h3>
        <p class="card-subtitle" style="margin-bottom: 12px;">Tampilan saat belum ada reservasi pada tanggal tertentu:</p>
        ${renderEmptyState({
          title: 'Tidak Ada Reservasi',
          message: 'Belum ada reservasi ruangan pada tanggal yang dipilih.',
          actionText: 'Reservasi Sekarang',
          actionHash: '#/book'
        })}
      </div>
    </div>
  `;
}


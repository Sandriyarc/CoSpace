/**
 * Halaman Beranda (Placeholder)
 * Rute: #/
 */
import { showToast, renderStatusBadge } from '../utils.js';

export function render(container) {
  container.innerHTML = `
    <div class="placeholder-page">
      <div class="placeholder-header">
        <span class="placeholder-badge">Beranda</span>
        <h2 class="placeholder-title">Selamat Datang di CoSpace</h2>
        <p class="placeholder-desc">Sistem Reservasi dan Pemantauan Jadwal Coworking Space secara Real-time.</p>
      </div>

      <div class="card">
        <h3 class="card-title">Akses Cepat</h3>
        <p class="card-subtitle" style="margin-bottom: 14px;">Eksplorasi fitur utama sistem reservasi coworking space:</p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <a href="#/rooms" class="btn btn-secondary btn-block">Lihat Daftar Ruangan</a>
          <a href="#/bookings" class="btn btn-secondary btn-block">Pantau Jadwal Reservasi</a>
          <a href="#/book" class="btn btn-primary btn-block">Buat Reservasi Baru</a>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Contoh Komponen Reusable</h3>
        <p class="card-subtitle" style="margin-bottom: 12px;">Badge Status:</p>
        <div style="display: flex; gap: 8px; margin-bottom: 14px;">
          ${renderStatusBadge('confirmed')}
          ${renderStatusBadge('cancelled')}
        </div>
        <button id="btn-test-toast" class="btn btn-secondary btn-block">Uji Notifikasi Toast</button>
      </div>
    </div>
  `;

  // Listener untuk demonstrasi toast
  const toastBtn = container.querySelector('#btn-test-toast');
  if (toastBtn) {
    toastBtn.addEventListener('click', () => {
      showToast('Koneksi frontend CoSpace aktif!', 'success');
    });
  }
}


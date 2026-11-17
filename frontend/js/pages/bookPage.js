/**
 * Halaman Form Reservasi Ruangan (Placeholder)
 * Rute: #/book dan #/book?room=ID
 */
import { escapeHtml } from '../utils.js';

export function render(container, context = {}) {
  const selectedRoomId = context.query?.get('room') || null;

  container.innerHTML = `
    <div class="placeholder-page">
      <div class="placeholder-header">
        <span class="placeholder-badge">Reservasi Baru</span>
        <h2 class="placeholder-title">Form Pemesanan</h2>
        <p class="placeholder-desc">Pesan ruangan kerja dan meeting room sesuai kebutuhan Anda.</p>
      </div>

      <div class="card">
        <h3 class="card-title">Parameter Pemilihan Awal</h3>
        ${
          selectedRoomId
            ? `<p class="card-subtitle" style="margin-bottom: 12px;">Ruangan awal dipilih via query URL: <strong>${escapeHtml(selectedRoomId)}</strong></p>`
            : `<p class="card-subtitle" style="margin-bottom: 12px;">Belum ada ruangan yang dipilih di query string (bisa dipilih langsung di form).</p>`
        }
        <div style="background: var(--bg-page); padding: 14px; border-radius: var(--radius-sm); margin-bottom: 14px;">
          <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
            Form reservasi akan memuat pilihan ruangan, data customer, tanggal, jam mulai, jam selesai, dan validasi bentrok jadwal.
          </p>
        </div>
        <a href="#/rooms" class="btn btn-secondary btn-block">Pilih Dari Daftar Ruangan</a>
      </div>
    </div>
  `;
}


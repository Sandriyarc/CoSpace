/**
 * Halaman Detail Ruangan (Placeholder)
 * Rute: #/rooms/:id
 */
import { escapeHtml } from '../utils.js';

export function render(container, context = {}) {
  const roomId = context.params?.id || 'ID Ruangan';

  container.innerHTML = `
    <div class="placeholder-page">
      <div class="placeholder-header">
        <span class="placeholder-badge">Detail Ruangan</span>
        <h2 class="placeholder-title">Informasi Ruangan</h2>
        <p class="placeholder-desc">ID Parameter Rute: <code>${escapeHtml(roomId)}</code></p>
      </div>

      <div class="card">
        <h3 class="card-title">Detail Ruangan (Placeholder)</h3>
        <p class="card-subtitle" style="margin-bottom: 14px;">
          Halaman ini menampilkan spesifikasi ruangan, fasilitas, harga per jam, dan jadwal ketersediaan.
        </p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <a href="#/book?room=${encodeURIComponent(roomId)}" class="btn btn-primary btn-block">
            Pesan Ruangan Ini
          </a>
          <a href="#/rooms" class="btn btn-secondary btn-block">
            Kembali ke Daftar Ruangan
          </a>
        </div>
      </div>
    </div>
  `;
}


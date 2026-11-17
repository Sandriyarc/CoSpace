/**
 * Halaman Daftar Ruangan (Placeholder)
 * Rute: #/rooms
 */
import { renderSkeletonList } from '../utils.js';

export function render(container) {
  container.innerHTML = `
    <div class="placeholder-page">
      <div class="placeholder-header">
        <span class="placeholder-badge">Katalog Ruangan</span>
        <h2 class="placeholder-title">Daftar Ruangan</h2>
        <p class="placeholder-desc">Pilihan ruang kerja, meeting room, dan event space terbaik.</p>
      </div>

      <div class="card">
        <h3 class="card-title">Daftar Ruangan (Placeholder)</h3>
        <p class="card-subtitle" style="margin-bottom: 12px;">Klik tautan di bawah untuk melihat contoh halaman detail ruangan:</p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <a href="#/rooms/sample-room-1" class="btn btn-secondary btn-block">Detail Ruang Kolaboratif A</a>
          <a href="#/rooms/sample-room-2" class="btn btn-secondary btn-block">Detail Meeting Room B</a>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Contoh Tampilan Skeleton Loading</h3>
        <p class="card-subtitle" style="margin-bottom: 12px;">Komponen pemuatan data awal:</p>
        ${renderSkeletonList(2)}
      </div>
    </div>
  `;
}


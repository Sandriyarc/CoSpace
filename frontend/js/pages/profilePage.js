/**
 * Halaman Profil Pengguna / Customer (Placeholder)
 * Rute: #/profile
 */
import { renderErrorState, showToast } from '../utils.js';

export function render(container) {
  container.innerHTML = `
    <div class="placeholder-page">
      <div class="placeholder-header">
        <span class="placeholder-badge">Pengaturan Profil</span>
        <h2 class="placeholder-title">Profil Pengguna</h2>
        <p class="placeholder-desc">Informasi akun pemesan dan riwayat reservasi Anda.</p>
      </div>

      <div class="card">
        <h3 class="card-title">Data Pengguna (Placeholder)</h3>
        <p class="card-subtitle" style="margin-bottom: 14px;">
          Fitur ini akan menghubungkan data pengguna dengan endpoint <code>/api/customers</code>.
        </p>
        <div style="background: var(--primary-subtle); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--primary-light); margin-bottom: 14px;">
          <strong style="color: var(--primary); font-size: 0.85rem;">Backend Online:</strong>
          <p style="font-size: 0.8rem; color: var(--text-secondary); word-break: break-all; margin-top: 2px;">
            https://co-space-indol.vercel.app/api
          </p>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Contoh Komponen Error State</h3>
        <p class="card-subtitle" style="margin-bottom: 12px;">Komponen saat terjadi kegagalan jaringan atau server:</p>
        ${renderErrorState({
          title: 'Gagal Memuat Profil',
          message: 'Silakan periksa koneksi internet Anda atau coba beberapa saat lagi.',
          retryButtonId: 'btn-retry-profile'
        })}
      </div>
    </div>
  `;

  // Listener untuk tombol coba lagi demonstrasi
  const retryBtn = container.querySelector('#btn-retry-profile');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      showToast('Mencoba menyambungkan kembali ke server...', 'info');
    });
  }
}


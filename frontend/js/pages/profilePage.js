/**
 * Halaman Profil & Tentang Aplikasi (About)
 * Rute: #/profile
 */

import { showToast } from '../utils.js';

export function render(container) {
  const isOnline = navigator.onLine;

  container.innerHTML = `
    <div class="profile-page">
      <!-- 1. Kartu Profil Pengembang -->
      <div class="card profile-hero-card">
        <div class="profile-banner-gradient"></div>
        <div class="profile-card-header">
          <div class="profile-avatar-circle">
            SR
          </div>
          <div class="profile-info-block">
            <h2 class="profile-name">Sandriya Rindy Cahyani</h2>
            <div class="profile-nim">NIM: 21120124120026</div>
            <div class="profile-course-badge">
              Tugas Akhir Praktikum Pemrograman Perangkat Bergerak
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Status Koneksi & Install PWA -->
      <div class="card">
        <h3 class="card-title" style="font-size: 1rem; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
          <span>Status Aplikasi & Jaringan</span>
          <span id="connection-status-pill" class="connection-status-pill ${isOnline ? 'connection-online' : 'connection-offline'}">
            <span class="status-dot ${isOnline ? 'dot-online' : 'dot-offline'}"></span>
            <span id="connection-status-text">${isOnline ? 'Online (Terhubung)' : 'Offline (Terputus)'}</span>
          </span>
        </h3>
        <p class="card-subtitle" style="margin-bottom: 14px; font-size: 0.86rem;">
          CoSpace mendukung pengoperasian sebagai Progressive Web App (PWA) di perangkat Android, iOS, maupun Desktop.
        </p>
        <button id="btn-install-app" class="btn btn-primary btn-block" style="border-radius: var(--radius-sm); padding: 12px;">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Install Aplikasi CoSpace
        </button>
      </div>

      <!-- 3. Tentang Aplikasi CoSpace -->
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3 class="card-title" style="font-size: 1rem; margin-bottom: 0;">Tentang CoSpace</h3>
          <span class="badge badge-confirmed" style="font-size: 0.72rem;">Versi 1.0.0</span>
        </div>
        <p class="card-subtitle" style="line-height: 1.55; margin-bottom: 14px; font-size: 0.88rem;">
          <strong>CoSpace</strong> adalah Sistem Reservasi dan Pemantauan Jadwal Coworking Space modern berbasis Progressive Web App (PWA) dengan arsitektur REST API. Didesain mobile-first untuk kemudahan pemesanan ruang kerja, meeting room, dan pemantauan slot waktu secara transparan dan real-time.
        </p>

        <h4 style="font-size: 0.88rem; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">Fitur Utama:</h4>
        <ul style="padding-left: 20px; font-size: 0.84rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: 4px;">
          <li>Katalog ruangan lengkap dengan filter tipe dan pencarian instan sisi klien.</li>
          <li>Pengecekan bentrok jadwal otomatis (Anti-Collision Slot) dengan status HTTP 409.</li>
          <li>Pemantauan jadwal terisi harian dan reservasi mendatang real-time.</li>
          <li>Integrasi otomatis data pelanggan (Customer Auto-Registration).</li>
          <li>Manajemen reservasi mandiri (pembatalan parsial dan penghapusan).</li>
          <li>Desain mobile-first responsif dengan safe area notch support.</li>
        </ul>
      </div>

      <!-- 4. Teknologi yang Dipakai -->
      <div class="card">
        <h3 class="card-title" style="font-size: 1rem; margin-bottom: 6px;">Teknologi yang Digunakan</h3>
        <p class="card-subtitle" style="font-size: 0.84rem; margin-bottom: 10px;">
          Dibangun menggunakan stack teknologi modern tanpa dependensi build tool yang berat:
        </p>
        <div class="tech-badges-grid">
          <span class="tech-badge-item">⚡ JavaScript (Vanilla ES Modules)</span>
          <span class="tech-badge-item">📱 PWA (Progressive Web App)</span>
          <span class="tech-badge-item">🟢 Node.js</span>
          <span class="tech-badge-item">🚂 Express 5</span>
          <span class="tech-badge-item">⚡ Supabase Database</span>
          <span class="tech-badge-item">▲ Vercel Serverless (Backend)</span>
          <span class="tech-badge-item">▲ Vercel (Frontend)</span>
        </div>
      </div>

      <!-- 5. Tautan Proyek & API -->
      <div class="card">
        <h3 class="card-title" style="font-size: 1rem; margin-bottom: 12px;">Tautan Proyek & Dokumentasi</h3>

        <!-- Tautan GitHub -->
        <a href="https://github.com/Sandriyarc/CoSpace" target="_blank" rel="noopener noreferrer" class="external-link-card">
          <div>
            <div class="external-link-title">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              Repository GitHub
            </div>
            <div class="external-link-url">https://github.com/Sandriyarc/CoSpace</div>
          </div>
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>

        <!-- Tautan REST API -->
        <a href="https://co-space-indol.vercel.app/api/rooms" target="_blank" rel="noopener noreferrer" class="external-link-card" style="margin-bottom: 0;">
          <div>
            <div class="external-link-title">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              REST API Endpoint (/api/rooms)
            </div>
            <div class="external-link-url">https://co-space-indol.vercel.app/api/rooms</div>
          </div>
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      </div>
    </div>
  `;

  // 1. Tombol Install PWA (Hanya tampil jika didukung dan belum terinstal)
  const installBtn = container.querySelector('#btn-install-app');
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  if (installBtn) {
    if (isInstalled) {
      // Sembunyikan tombol jika aplikasi sudah terpasang
      installBtn.style.display = 'none';
    } else if (window.deferredPrompt) {
      // Tampilkan tombol jika event beforeinstallprompt sudah tersedia
      installBtn.style.display = 'inline-flex';
    } else {
      // Sembunyikan sementara jika belum siap / tidak didukung
      installBtn.style.display = 'none';
    }

    // Dengarkan event ketika PWA siap diinstal
    window.addEventListener('pwa-installable', () => {
      if (!isInstalled && installBtn) {
        installBtn.style.display = 'inline-flex';
      }
    });

    // Dengarkan event ketika PWA selesai diinstal
    window.addEventListener('pwa-installed', () => {
      if (installBtn) {
        installBtn.style.display = 'none';
      }
    });

    installBtn.addEventListener('click', async () => {
      if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        const { outcome } = await window.deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast('Terima kasih telah menginstal CoSpace!', 'success');
          installBtn.style.display = 'none';
        }
        window.deferredPrompt = null;
      }
    });
  }

  // 2. Pemantauan Status Koneksi Online / Offline secara Real-Time
  const statusPill = container.querySelector('#connection-status-pill');
  const statusText = container.querySelector('#connection-status-text');

  function updateStatus(online) {
    if (!statusPill || !statusText) return;
    if (online) {
      statusPill.className = 'connection-status-pill connection-online';
      statusPill.querySelector('.status-dot').className = 'status-dot dot-online';
      statusText.textContent = 'Online (Terhubung)';
      showToast('Koneksi internet terhubung kembali.', 'success');
    } else {
      statusPill.className = 'connection-status-pill connection-offline';
      statusPill.querySelector('.status-dot').className = 'status-dot dot-offline';
      statusText.textContent = 'Offline (Terputus)';
      showToast('Koneksi internet terputus.', 'error');
    }
  }

  window.addEventListener('online', () => updateStatus(true));
  window.addEventListener('offline', () => updateStatus(false));
}

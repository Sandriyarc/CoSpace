/**
 * Halaman Beranda (Home Dashboard)
 * Rute: #/
 */

import { roomApi, bookingApi } from '../api.js';
import {
  getGreeting,
  formatRupiah,
  formatDateIndo,
  formatTime,
  timeToSeconds,
  getTodayDateString,
  escapeHtml,
  renderStatusBadge,
  getRoomPlaceholderHtml,
  renderSkeletonList,
  renderErrorState,
  renderEmptyState
} from '../utils.js';

export function render(container) {
  // 1. Tampilkan Skeleton Loading saat mengambil data
  container.innerHTML = `
    <div class="home-page">
      <div class="skeleton-card" style="height: 140px;"></div>
      <div class="skeleton-card" style="height: 90px;"></div>
      <div class="skeleton-card">
        <div class="skeleton skeleton-title" style="width: 50%;"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
      </div>
    </div>
  `;

  async function loadDashboard() {
    try {
      // Ambil data ruangan dan jadwal secara paralel
      const [rooms, bookings] = await Promise.all([
        roomApi.getAll(),
        bookingApi.getAll()
      ]);

      const todayStr = getTodayDateString();
      const now = new Date();
      const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

      // Filter reservasi hari ini yang terkonfirmasi
      const todayConfirmed = (bookings || []).filter(
        b => b.booking_date === todayStr && String(b.status).toLowerCase() === 'confirmed'
      );

      // Hitung ruangan yang sedang terpakai saat ini berdasarkan jam sekarang
      const activeNow = todayConfirmed.filter(b => {
        const startSec = timeToSeconds(b.start_time);
        const endSec = timeToSeconds(b.end_time);
        return currentSeconds >= startSec && currentSeconds < endSec;
      });
      const occupiedRoomsCount = new Set(activeNow.map(b => b.room_id)).size;

      // 1. Jadwal Hari Ini (urut jam mulai naik)
      const todayBookings = (bookings || [])
        .filter(b => b.booking_date === todayStr)
        .sort((a, b) => timeToSeconds(a.start_time) - timeToSeconds(b.start_time));

      // 2. Reservasi Mendatang (setelah hari ini, confirmed, urut tanggal & jam, max 3)
      const upcomingBookings = (bookings || [])
        .filter(b => b.booking_date > todayStr && String(b.status).toLowerCase() === 'confirmed')
        .sort((a, b) => {
          if (a.booking_date !== b.booking_date) {
            return a.booking_date.localeCompare(b.booking_date);
          }
          return timeToSeconds(a.start_time) - timeToSeconds(b.start_time);
        })
        .slice(0, 3);

      // HTML untuk Jadwal Hari Ini dalam bentuk timeline vertikal
      let todayScheduleHtml = '';
      if (todayBookings.length === 0) {
        todayScheduleHtml = renderEmptyState({
          title: 'Tidak Ada Jadwal Hari Ini',
          message: 'Semua ruangan kosong dan siap Anda gunakan hari ini!',
          actionText: 'Reservasi Sekarang',
          actionHash: '#/book'
        });
      } else {
        todayScheduleHtml = `
          <div class="vertical-timeline">
            ${todayBookings.map((b, idx) => {
              const roomName = b.rooms?.name || 'Ruangan';
              const customerName = b.customers?.name || 'Pelanggan';
              const timeRange = `${formatTime(b.start_time)} - ${formatTime(b.end_time)}`;
              const isConfirmed = String(b.status).toLowerCase() === 'confirmed';
              const isLast = idx === todayBookings.length - 1;

              return `
                <div class="timeline-item">
                  <div class="timeline-indicator">
                    <div class="timeline-bullet ${isConfirmed ? 'bullet-confirmed' : 'bullet-cancelled'}">
                      <span class="timeline-dot"></span>
                    </div>
                    ${!isLast ? '<div class="timeline-stem"></div>' : ''}
                  </div>
                  <a href="#/bookings/${encodeURIComponent(b.id)}" class="timeline-card">
                    <div class="timeline-header">
                      <span class="timeline-time">
                        <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${escapeHtml(timeRange)}
                      </span>
                      ${renderStatusBadge(b.status)}
                    </div>
                    <h4 class="timeline-room">${escapeHtml(roomName)}</h4>
                    <div class="timeline-meta">
                      <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>Pemesan: <strong>${escapeHtml(customerName)}</strong></span>
                    </div>
                  </a>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }

      // HTML untuk Reservasi Mendatang
      let upcomingHtml = '';
      if (upcomingBookings.length === 0) {
        upcomingHtml = `
          <div class="card card-static" style="text-align: center; padding: 24px 16px; color: var(--text-secondary); font-size: 0.88rem;">
            Belum ada reservasi mendatang yang terdaftar.
          </div>
        `;
      } else {
        upcomingHtml = upcomingBookings.map((b) => {
          const roomName = b.rooms?.name || 'Ruangan';
          const customerName = b.customers?.name || 'Pelanggan';
          const timeRange = `${formatTime(b.start_time)} - ${formatTime(b.end_time)}`;

          return `
            <a href="#/bookings/${encodeURIComponent(b.id)}" class="home-booking-card">
              <div class="home-booking-info">
                <span class="home-booking-room">${escapeHtml(roomName)}</span>
                <span class="home-booking-meta">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" style="color: var(--primary);">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                  </svg>
                  ${formatDateIndo(b.booking_date, false)} • ${escapeHtml(timeRange)}
                </span>
                <span style="font-size: 0.76rem; color: var(--text-muted); margin-top: 1px;">
                  Pemesan: ${escapeHtml(customerName)}
                </span>
              </div>
              <div>
                ${renderStatusBadge(b.status)}
              </div>
            </a>
          `;
        }).join('');
      }

      // Horizontally scrollable popular rooms row
      const popularHtml = (rooms || []).slice(0, 4).map((room) => {
        const visual = room.image_url
          ? `<img src="${escapeHtml(room.image_url)}" alt="${escapeHtml(room.name)}" class="popular-room-img" />`
          : getRoomPlaceholderHtml(room.type, room.name);

        return `
          <a href="#/rooms/${encodeURIComponent(room.id)}" class="popular-room-card">
            <div class="popular-room-visual">${visual}</div>
            <div class="popular-room-info">
              <span class="popular-room-name">${escapeHtml(room.name)}</span>
              <span class="popular-room-type">${escapeHtml(room.type)}</span>
              <span class="popular-room-price">${formatRupiah(room.price_per_hour)}<span>/jam</span></span>
            </div>
          </a>
        `;
      }).join('');

      // Render Tampilan Dashboard Beranda
      container.innerHTML = `
        <div class="home-page">
          <!-- Hero Sapaan Berdasarkan Waktu -->
          <div class="greeting-hero">
            <div class="greeting-hero-pattern" aria-hidden="true">
              <svg viewBox="0 0 360 220" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMid slice">
                <defs>
                  <filter id="hero-blur-1" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="30" />
                  </filter>
                  <pattern id="dot-grid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.2" fill="#FFFFFF" fill-opacity="0.22" />
                  </pattern>
                </defs>
                <!-- Mesh Gradient & Blur Circles -->
                <circle cx="320" cy="40" r="110" fill="#60A5FA" fill-opacity="0.35" filter="url(#hero-blur-1)" />
                <circle cx="220" cy="180" r="90" fill="#C084FC" fill-opacity="0.3" filter="url(#hero-blur-1)" />
                <!-- Dot Pattern Overlay -->
                <rect x="180" y="0" width="180" height="220" fill="url(#dot-grid)" opacity="0.6" />
                <!-- Decorative Geometric Curved Lines -->
                <circle cx="310" cy="50" r="120" stroke="rgba(255, 255, 255, 0.2)" stroke-width="1.5" />
                <circle cx="310" cy="50" r="80" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.5" stroke-dasharray="4 4" />
                <path d="M160 220 C180 130 260 90 360 90" stroke="rgba(255, 255, 255, 0.22)" stroke-width="2" />
                <path d="M210 220 C230 160 280 130 360 130" stroke="rgba(147, 197, 253, 0.4)" stroke-width="2" stroke-dasharray="5 5" />
              </svg>
            </div>
            <div class="greeting-hero-content">
              <div class="greeting-time">${getGreeting()}</div>
              <h2 class="greeting-title">Selamat Datang di CoSpace</h2>
              <p class="greeting-desc">
                Ruang kerja modern untuk produktivitas, kolaborasi, dan kemudahan reservasi.
              </p>
              <a href="#/book" class="btn btn-hero-white btn-pill">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Buat Reservasi Baru
              </a>
            </div>
          </div>

          <!-- Kartu Statistik Real-Time dari API -->
          <div class="stats-grid">
            <!-- Stat 1: Total Ruangan -->
            <div class="stat-card">
              <div class="stat-icon stat-icon-rooms">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                  <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                  <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                  <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                </svg>
              </div>
              <div class="stat-number">${(rooms || []).length}</div>
              <div class="stat-label">Total Ruangan</div>
            </div>

            <!-- Stat 2: Reservasi Hari Ini -->
            <div class="stat-card">
              <div class="stat-icon stat-icon-today">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div class="stat-number">${todayConfirmed.length}</div>
              <div class="stat-label">Jadwal Hari Ini</div>
            </div>

            <!-- Stat 3: Sedang Terpakai Saat Ini -->
            <div class="stat-card">
              <div class="stat-icon stat-icon-active">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div class="stat-number">${occupiedRoomsCount}</div>
              <div class="stat-label">Ruang Terpakai</div>
            </div>
          </div>

          <!-- Kontainer Dua Kolom Beranda di Layar Desktop -->
          <div class="home-sections-grid">
            <!-- Bagian: Jadwal Hari Ini -->
            <div class="home-section-col">
              <div class="section-header-bar">
                <h3 class="section-title">Jadwal Hari Ini (${formatDateIndo(todayStr)})</h3>
                <a href="#/bookings" class="section-link">
                  Semua Jadwal
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </a>
              </div>
              <div>
                ${todayScheduleHtml}
              </div>
            </div>

            <!-- Bagian: Reservasi Mendatang -->
            <div class="home-section-col">
              <div class="section-header-bar">
                <h3 class="section-title">Reservasi Mendatang</h3>
                <a href="#/bookings" class="section-link">
                  Lihat Semua
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </a>
              </div>
              <div>
                ${upcomingHtml}
              </div>
            </div>
          </div>

          <!-- Ruangan Populer: horizontal scroll row -->
          <section class="popular-rooms-section">
            <div class="section-header-bar">
              <h3 class="section-title">Ruangan Populer</h3>
              <a href="#/rooms" class="section-link">
                Lihat Semua
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </a>
            </div>
            <div class="popular-rooms-row">
              ${popularHtml}
            </div>
          </section>
        </div>
      `;
    } catch (err) {
      container.innerHTML = renderErrorState({
        title: 'Gagal Memuat Beranda',
        message: err.message || 'Terjadi gangguan saat mengambil data dashboard.',
        retryButtonId: 'btn-retry-home'
      });

      const retryBtn = container.querySelector('#btn-retry-home');
      if (retryBtn) {
        retryBtn.addEventListener('click', loadDashboard);
      }
    }
  }

  loadDashboard();
}

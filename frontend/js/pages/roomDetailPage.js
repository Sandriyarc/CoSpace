/**
 * Halaman Detail Ruangan
 * Rute: #/rooms/:id
 */

import { roomApi } from '../api.js';
import {
  formatRupiah,
  formatDateIndo,
  formatTime,
  escapeHtml,
  parseFacilities,
  getRoomPlaceholderHtml,
  getRoomImageUrl,
  renderErrorState,
  renderEmptyState,
  $
} from '../utils.js';

export function render(container, context = {}) {
  const roomId = context.params?.id;

  if (!roomId) {
    container.innerHTML = renderErrorState({
      title: 'Ruangan Tidak Ditemukan',
      message: 'ID ruangan tidak valid atau tidak disertakan.'
    });
    return;
  }

  // Tampilkan skeleton loading saat data sedang dimuat
  container.innerHTML = `
    <div class="room-detail-page">
      <div class="skeleton-card" style="height: 200px; margin-bottom: 16px;"></div>
      <div class="skeleton-card">
        <div class="skeleton skeleton-title" style="width: 70%;"></div>
        <div class="skeleton skeleton-text" style="width: 40%;"></div>
      </div>
      <div class="skeleton-card">
        <div class="skeleton skeleton-title" style="width: 50%;"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
      </div>
      <div class="skeleton-card">
        <div class="skeleton skeleton-title" style="width: 50%;"></div>
        <div class="skeleton skeleton-text"></div>
      </div>
    </div>
  `;

  async function loadRoomDetail() {
    try {
      // Ambil data ruangan dan daftar booking secara paralel
      const [room, bookings] = await Promise.all([
        roomApi.getById(roomId),
        roomApi.getBookings(roomId)
      ]);

      // Perbarui judul halaman di top bar jika elemen tersedia
      const pageTitle = $('#page-title');
      if (pageTitle) {
        pageTitle.textContent = 'Detail Ruangan';
      }

      // 1. Gambar Hero (Foto asli atau Fallback Gradien)
      const imageUrl = getRoomImageUrl(room);
      const heroImageHtml = imageUrl
        ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(room.name)}" class="room-detail-img" onerror="this.onerror=null; this.parentElement.innerHTML=\`${getRoomPlaceholderHtml(room.type, room.name).replace(/"/g, '&quot;')}\`;" />`
        : getRoomPlaceholderHtml(room.type, room.name);

      // 2. Fasilitas sebagai grid ikon
      const facilities = parseFacilities(room.facilities);
      const facilitiesHtml = facilities.length > 0
        ? facilities.map(f => `
            <div class="facility-icon-tile">
              <span class="facility-icon-bubble">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
              <span>${escapeHtml(f)}</span>
            </div>
          `).join('')
        : `<p style="font-size: 0.85rem; color: var(--text-muted);">Tidak ada fasilitas khusus yang terdaftar.</p>`;

      // 3. Pengelompokan Jadwal Terisi per Tanggal
      let scheduleHtml = '';
      if (!bookings || bookings.length === 0) {
        scheduleHtml = renderEmptyState({
          title: 'Belum Ada Jadwal Terisi',
          message: 'Semua slot waktu pada ruangan ini masih kosong dan siap Anda gunakan!'
        });
      } else {
        // Kelompokkan booking per booking_date
        const groups = {};
        bookings.forEach((b) => {
          const date = b.booking_date;
          if (!groups[date]) groups[date] = [];
          groups[date].push(b);
        });

        // Urutkan tanggal naik
        const sortedDates = Object.keys(groups).sort();

        scheduleHtml = sortedDates.map((dateStr) => {
          const dateBookings = groups[dateStr];
          const slotsHtml = dateBookings.map((b) => {
            const customerName = b.customers?.name || 'Pelanggan';
            const timeRange = `${formatTime(b.start_time)} - ${formatTime(b.end_time)}`;

            return `
              <div class="schedule-slot-item">
                <div class="schedule-slot-info">
                  <div class="schedule-slot-time">
                    <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    ${escapeHtml(timeRange)}
                  </div>
                  <span class="schedule-slot-user">Pemesan: <strong>${escapeHtml(customerName)}</strong></span>
                </div>
                <span class="badge badge-confirmed">Terisi</span>
              </div>
            `;
          }).join('');

          return `
            <div class="schedule-group">
              <div class="schedule-date-header">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>${formatDateIndo(dateStr, true)}</span>
              </div>
              <div class="schedule-slots-list">
                ${slotsHtml}
              </div>
            </div>
          `;
        }).join('');
      }

      // Render Tampilan Penuh
      container.innerHTML = `
        <div class="room-detail-page">
          <!-- Hero visual gradient dengan nama ruangan yang overlap -->
          <div class="room-detail-hero">
            <div class="room-detail-hero-media">${heroImageHtml}</div>
            <div class="room-detail-hero-shade"></div>
            <div class="room-detail-hero-title">
              <span class="room-hero-type-badge">${escapeHtml(room.type)}</span>
              <h2 class="room-hero-name">${escapeHtml(room.name)}</h2>
              <span class="room-hero-capacity">
                <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                </svg>
                Kapasitas: ${escapeHtml(room.capacity)} Orang
              </span>
            </div>
          </div>

          <div class="room-detail-content-grid">
            <div class="room-detail-main">
              <!-- Deskripsi Ruangan -->
              <div class="card room-detail-desc-card">
                <h3 class="card-title" style="margin-bottom: 8px;">Deskripsi Ruangan</h3>
                <p class="card-subtitle" style="line-height: 1.6; font-size: 0.92rem;">
                  ${escapeHtml(room.description || 'Ruangan coworking space modern yang nyaman dan kondusif untuk produktivitas Anda.')}
                </p>
              </div>

              <!-- Fasilitas Ruangan sebagai icon grid -->
              <div class="card room-detail-facility-card">
                <h3 class="card-title" style="margin-bottom: 4px;">Fasilitas Tersedia</h3>
                <div class="facility-icon-grid">
                  ${facilitiesHtml}
                </div>
              </div>

              <!-- Jadwal Terisi dikelompokkan per tanggal -->
              <div class="card room-detail-schedule-card">
                <div style="margin-bottom: 12px;">
                  <h3 class="card-title" style="margin-bottom: 4px;">Jadwal Terisi</h3>
                  <p class="card-subtitle" style="font-size: 0.84rem;">
                    Daftar slot waktu yang sudah dibooking pada ruangan ini.
                  </p>
                </div>
                ${scheduleHtml}
              </div>
            </div>

            <!-- Kartu Reservasi sticky di desktop -->
            <aside class="room-detail-booking-card">
              <div class="card">
                <h3 class="section-title" style="margin-bottom: 12px;">Reservasi</h3>
                <div class="cost-summary-gradient-card">
                  <span class="cost-summary-label">Tarif Sewa Ruangan</span>
                  <div class="cost-summary-amount">${formatRupiah(room.price_per_hour)}<span class="cost-summary-unit">/jam</span></div>
                </div>
                <div class="reservation-meta-list">
                  <div class="reservation-meta-row">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                    </svg>
                    <span>Kapasitas ${escapeHtml(room.capacity)} orang</span>
                  </div>
                  <div class="reservation-meta-row">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                      <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                      <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                      <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                    </svg>
                    <span>${escapeHtml(room.type)}</span>
                  </div>
                </div>
                <a href="#/book?room=${encodeURIComponent(room.id)}" class="btn btn-primary btn-block detail-cta-btn">
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Reservasi Ruangan Ini
                </a>
                <p class="reservation-hint">Pilih tanggal dan jam reservasi pada langkah berikutnya.</p>
              </div>
            </aside>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = renderErrorState({
        title: 'Gagal Memuat Detail Ruangan',
        message: err.message || 'Terjadi gangguan saat mengambil data detail ruangan dari server.',
        retryButtonId: 'btn-retry-room-detail'
      });

      const retryBtn = container.querySelector('#btn-retry-room-detail');
      if (retryBtn) {
        retryBtn.addEventListener('click', loadRoomDetail);
      }
    }
  }

  loadRoomDetail();
}

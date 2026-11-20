/**
 * Halaman Jadwal Reservasi
 * Rute: #/bookings
 */

import { bookingApi, roomApi } from '../api.js';
import {
  formatDateIndo,
  formatTime,
  timeToSeconds,
  escapeHtml,
  getBookingStatus,
  renderStatusBadge,
  renderSkeletonList,
  renderErrorState,
  renderEmptyState
} from '../utils.js';

export function render(container) {
  // 1. Tampilkan layout filter dan kontainer skeleton
  container.innerHTML = `
    <div class="bookings-page">
      <!-- Filter Bar: panel mengambang -->
      <div class="bookings-filter-panel">
      <div class="bookings-filter-bar">
        <div class="filter-panel-title">Filter Jadwal</div>
        <!-- Row 1: Filter Tanggal & Dropdown Ruangan -->
        <div class="filter-input-row">
          <div class="filter-input-col">
            <input
              type="date"
              id="booking-filter-date"
              class="filter-date-input"
              title="Filter Tanggal"
              placeholder="Pilih Tanggal"
              aria-label="Filter Tanggal"
            />
          </div>
          <div class="filter-input-col">
            <select id="booking-filter-room" class="filter-select" aria-label="Filter Ruangan">
              <option value="Semua">Semua Ruangan</option>
            </select>
          </div>
        </div>

        <!-- Row 2: Chip Status -->
        <div class="filter-chips-container" id="status-filter-chips" role="tablist">
          <button class="filter-chip active" data-status="Semua" role="tab">Semua</button>
          <button class="filter-chip" data-status="terkonfirmasi" role="tab">Terkonfirmasi</button>
          <button class="filter-chip" data-status="selesai" role="tab">Selesai</button>
        </div>
      </div>
      </div>

      <!-- Kontainer Daftar Booking Dikelompokkan per Tanggal -->
      <div id="bookings-list-container">
        ${renderSkeletonList(3)}
      </div>
    </div>
  `;

  let allBookings = [];
  let allRooms = [];
  let currentStatus = 'Semua';
  let currentDate = '';
  let currentRoomId = 'Semua';

  const dateInput = container.querySelector('#booking-filter-date');
  const roomSelect = container.querySelector('#booking-filter-room');
  const statusChips = container.querySelectorAll('#status-filter-chips .filter-chip');
  const listContainer = container.querySelector('#bookings-list-container');

  /**
   * Terapkan filter di sisi klien dan render jadwal yang dikelompokkan per tanggal
   */
  function applyFilters() {
    if (!listContainer) return;

    let filtered = allBookings;

    // Filter Status memakai getBookingStatus
    if (currentStatus !== 'Semua') {
      filtered = filtered.filter(b => getBookingStatus(b) === currentStatus.toLowerCase());
    }

    // Filter Tanggal
    if (currentDate) {
      filtered = filtered.filter(b => b.booking_date === currentDate);
    }

    // Filter Ruangan
    if (currentRoomId !== 'Semua') {
      filtered = filtered.filter(b => b.room_id === currentRoomId);
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = renderEmptyState({
        title: 'Tidak Ada Jadwal',
        message: 'Belum ada reservasi yang sesuai dengan kriteria filter yang Anda pilih.',
        actionText: 'Buat Reservasi Baru',
        actionHash: '#/book'
      });
      return;
    }

    // Kelompokkan data booking per tanggal
    const grouped = {};
    filtered.forEach((b) => {
      const dateKey = b.booking_date;
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(b);
    });

    // Urutkan tanggal naik
    const sortedDates = Object.keys(grouped).sort();

    listContainer.innerHTML = sortedDates.map((dateStr) => {
      const bookingsOnDate = grouped[dateStr];

      // Aturan: kelompok tanggal tetap menaik; di dalam filter "Semua", booking terkonfirmasi tampil sebelum yang selesai pada tanggal yang sama.
      bookingsOnDate.sort((a, b) => {
        const statusA = getBookingStatus(a);
        const statusB = getBookingStatus(b);
        if (statusA !== statusB) {
          return statusA === 'terkonfirmasi' ? -1 : 1;
        }
        return timeToSeconds(a.start_time) - timeToSeconds(b.start_time);
      });

      const cardsHtml = bookingsOnDate.map((b) => {
        const bStatus = getBookingStatus(b);
        const isCompleted = bStatus === 'selesai';
        const roomName = b.rooms?.name || 'Ruangan';
        const roomType = b.rooms?.type ? `(${b.rooms.type})` : '';
        const customerName = b.customers?.name || 'Pelanggan';
        const timeRange = `${formatTime(b.start_time)} - ${formatTime(b.end_time)}`;

        return `
          <a href="#/bookings/${encodeURIComponent(b.id)}" class="booking-card ${isCompleted ? 'is-completed' : ''}">
            <div class="booking-time-block">
              <span class="booking-time-start">${formatTime(b.start_time)}</span>
              <span class="booking-time-sep">—</span>
              <span class="booking-time-end">${formatTime(b.end_time)}</span>
            </div>
            <div class="booking-details">
              <div class="booking-card-top">
                <div>
                  <h4 class="booking-card-room-name">${escapeHtml(roomName)} <span style="font-size: 0.8rem; font-weight: 500; color: var(--text-muted);">${escapeHtml(roomType)}</span></h4>
                </div>
                ${renderStatusBadge(bStatus)}
              </div>
              <div class="booking-card-body">
                <div class="booking-card-info-item">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <span style="font-weight: 600; color: var(--primary-dark);">${escapeHtml(timeRange)}</span>
                </div>
                <div class="booking-card-info-item">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted);">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>Pemesan: <strong>${escapeHtml(customerName)}</strong></span>
                </div>
              </div>
            </div>
          </a>
        `;
      }).join('');

      return `
        <div class="schedule-group">
          <div class="schedule-date-header">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>${formatDateIndo(dateStr, true)}</span>
            <span style="font-size: 0.78rem; font-weight: 500; color: var(--text-muted); margin-left: auto;">${bookingsOnDate.length} Reservasi</span>
          </div>
          <div class="schedule-cards-grid">
            ${cardsHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Muat data booking dan data ruangan dari server
   */
  async function loadData() {
    listContainer.innerHTML = renderSkeletonList(3);
    try {
      const [bookings, rooms] = await Promise.all([
        bookingApi.getAll(),
        roomApi.getAll()
      ]);

      allBookings = bookings || [];
      allRooms = rooms || [];

      // Isi pilihan dropdown ruangan
      if (roomSelect) {
        roomSelect.innerHTML = `
          <option value="Semua">Semua Ruangan</option>
          ${allRooms.map(r => `<option value="${escapeHtml(r.id)}">${escapeHtml(r.name)}</option>`).join('')}
        `;
      }

      applyFilters();
    } catch (err) {
      listContainer.innerHTML = renderErrorState({
        title: 'Gagal Memuat Jadwal',
        message: err.message || 'Terjadi gangguan saat mengambil data jadwal dari server.',
        retryButtonId: 'btn-retry-bookings'
      });

      const retryBtn = container.querySelector('#btn-retry-bookings');
      if (retryBtn) {
        retryBtn.addEventListener('click', loadData);
      }
    }
  }

  // Listener input tanggal
  if (dateInput) {
    dateInput.addEventListener('change', (e) => {
      currentDate = e.target.value;
      applyFilters();
    });
  }

  // Listener dropdown ruangan
  if (roomSelect) {
    roomSelect.addEventListener('change', (e) => {
      currentRoomId = e.target.value;
      applyFilters();
    });
  }

  // Listener chip filter status
  statusChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      statusChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentStatus = chip.getAttribute('data-status') || 'Semua';
      applyFilters();
    });
  });

  loadData();

  // Aturan 6: Pengecekan ulang otomatis status tanpa reload tiap 60 detik
  const intervalId = setInterval(() => {
    applyFilters();
  }, 60000);

  return () => {
    clearInterval(intervalId);
  };
}

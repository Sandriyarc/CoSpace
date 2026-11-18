/**
 * Halaman Katalog / Daftar Ruangan
 * Rute: #/rooms
 */

import { roomApi } from '../api.js';
import {
  formatRupiah,
  escapeHtml,
  parseFacilities,
  getRoomPlaceholderHtml,
  getRoomImageUrl,
  renderSkeletonList,
  renderErrorState,
  renderEmptyState
} from '../utils.js';

export function render(container, context = {}) {
  // 1. Tampilkan Search Bar, Filter Chips, dan Skeleton Loading awal
  container.innerHTML = `
    <div class="rooms-page">
      <!-- Kolom Pencarian -->
      <div class="search-bar-wrapper">
        <span class="search-icon">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </span>
        <input
          type="text"
          id="room-search-input"
          class="search-input"
          placeholder="Cari nama ruangan..."
          autocomplete="off"
        />
        <button id="search-clear-btn" class="search-clear-btn" aria-label="Hapus pencarian">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Chip Filter Tipe Ruangan -->
      <div class="filter-chips-container" id="filter-chips" role="tablist" aria-label="Filter Tipe Ruangan">
        <button class="filter-chip active" data-type="Semua" role="tab">Semua</button>
        <button class="filter-chip" data-type="Meeting Room" role="tab">Meeting Room</button>
        <button class="filter-chip" data-type="Private Office" role="tab">Private Office</button>
        <button class="filter-chip" data-type="Hot Desk" role="tab">Hot Desk</button>
      </div>

      <!-- Kontainer Daftar Kartu Ruangan -->
      <div id="rooms-list-container">
        ${renderSkeletonList(3)}
      </div>
    </div>
  `;

  let roomsData = [];
  const queryParam = context?.query?.get ? context.query.get('q') : (context?.query?.q || '');
  let currentSearch = (queryParam || '').toLowerCase().trim();
  let currentType = 'Semua';

  const searchInput = container.querySelector('#room-search-input');
  const clearBtn = container.querySelector('#search-clear-btn');
  const filterChips = container.querySelectorAll('.filter-chip');
  const listContainer = container.querySelector('#rooms-list-container');

  if (queryParam && searchInput) {
    searchInput.value = queryParam;
    if (clearBtn) clearBtn.classList.add('visible');
    const topbarInput = document.getElementById('topbar-search-input');
    if (topbarInput && topbarInput.value !== queryParam) {
      topbarInput.value = queryParam;
    }
  }

  /**
   * Render kartu untuk satu data ruangan (seragam untuk semua kartu)
   */
  function renderRoomCard(room) {
    const facilities = parseFacilities(room.facilities).slice(0, 3);
    const facilitiesHtml = facilities.length > 0
      ? `<div class="room-facilities-preview">
           ${facilities.map(f => `<span class="room-facility-chip">${escapeHtml(f)}</span>`).join('')}
         </div>`
      : '';

    // Gambar ruangan (foto asli atau fallback gradien placeholder)
    const imageUrl = getRoomImageUrl(room);
    const imageHtml = imageUrl
      ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(room.name)}" class="room-card-img" onerror="this.onerror=null; this.parentElement.innerHTML=\`${getRoomPlaceholderHtml(room.type, room.name).replace(/"/g, '&quot;')}\`;" />`
      : getRoomPlaceholderHtml(room.type, room.name);

    return `
      <a href="#/rooms/${encodeURIComponent(room.id)}" class="room-card" data-id="${escapeHtml(room.id)}">
        <div class="room-card-img-wrapper">
          ${imageHtml}
          <span class="room-type-badge-overlay">${escapeHtml(room.type)}</span>
        </div>
        <div class="room-card-body">
          <div class="room-card-header">
            <h3 class="room-card-name">${escapeHtml(room.name)}</h3>
            <div class="room-card-price">
              ${formatRupiah(room.price_per_hour)}<span class="room-card-price-sub">/jam</span>
            </div>
          </div>
          <div class="room-card-meta">
            <span class="room-meta-item">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
              Kapasitas: ${escapeHtml(room.capacity)} Orang
            </span>
          </div>
          ${facilitiesHtml}
        </div>
      </a>
    `;
  }

  /**
   * Terapkan filter pencarian nama dan chip tipe ruangan (client-side tanpa reload)
   */
  function applyFilters() {
    if (!listContainer) return;

    let filtered = roomsData;

    // 1. Filter tipe ruangan
    if (currentType !== 'Semua') {
      filtered = filtered.filter(
        r => String(r.type).toLowerCase() === currentType.toLowerCase()
      );
    }

    // 2. Filter kata kunci nama ruangan
    if (currentSearch) {
      filtered = filtered.filter(
        r => String(r.name).toLowerCase().includes(currentSearch)
      );
    }

    // 3. Tampilkan hasil atau empty state
    if (filtered.length === 0) {
      listContainer.innerHTML = renderEmptyState({
        title: 'Ruangan Tidak Ditemukan',
        message: 'Tidak ada ruangan yang cocok dengan kata kunci atau filter tipe yang Anda pilih.'
      });
      return;
    }

    listContainer.innerHTML = filtered.map(room => renderRoomCard(room)).join('');
  }

  /**
   * Ambil data ruangan dari API backend
   */
  async function loadRooms() {
    listContainer.innerHTML = renderSkeletonList(3);
    try {
      roomsData = await roomApi.getAll();
      applyFilters();
    } catch (err) {
      listContainer.innerHTML = renderErrorState({
        title: 'Gagal Memuat Ruangan',
        message: err.message || 'Terjadi gangguan saat mengambil data ruangan dari server.',
        retryButtonId: 'btn-retry-rooms'
      });

      const retryBtn = container.querySelector('#btn-retry-rooms');
      if (retryBtn) {
        retryBtn.addEventListener('click', loadRooms);
      }
    }
  }

  // Listener input pencarian (reaktif tanpa reload)
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.toLowerCase().trim();
      const topbarInput = document.getElementById('topbar-search-input');
      if (topbarInput && topbarInput.value !== e.target.value) {
        topbarInput.value = e.target.value;
      }
      if (clearBtn) {
        if (currentSearch) {
          clearBtn.classList.add('visible');
        } else {
          clearBtn.classList.remove('visible');
        }
      }
      applyFilters();
    });
  }

  // Listener tombol bersihkan pencarian
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        currentSearch = '';
        clearBtn.classList.remove('visible');
        searchInput.focus();
        const topbarInput = document.getElementById('topbar-search-input');
        if (topbarInput) topbarInput.value = '';
        applyFilters();
      }
    });
  }

  // Listener tombol filter chip tipe
  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentType = chip.getAttribute('data-type') || 'Semua';
      applyFilters();
    });
  });

  // Eksekusi pemuatan data awal
  loadRooms();
}

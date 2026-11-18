/**
 * Halaman Profil Pengguna
 * Rute: #/profile
 */

import { showToast, escapeHtml } from '../utils.js';

const STORAGE_KEY = 'cospace_profile';

/**
 * Mengambil profil dari localStorage dengan fallback nilai default
 * @returns {{ name: string, email: string, phone: string, photo: string|null }}
 */
function getStoredProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return {
        name: typeof data.name === 'string' && data.name.trim() ? data.name.trim() : 'Pengguna CoSpace',
        email: typeof data.email === 'string' ? data.email.trim() : '',
        phone: typeof data.phone === 'string' ? data.phone.trim() : '',
        photo: typeof data.photo === 'string' && data.photo.startsWith('data:image/') ? data.photo : null
      };
    }
  } catch (err) {
    console.warn('Gagal membaca cospace_profile dari localStorage:', err);
  }
  return {
    name: 'Pengguna CoSpace',
    email: '',
    phone: '',
    photo: null
  };
}

/**
 * Menyimpan data profil ke localStorage
 * @param {object} profile
 * @returns {boolean}
 */
function saveStoredProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent('cospace:profile-changed', { detail: profile }));
    return true;
  } catch (err) {
    console.error('Gagal menyimpan cospace_profile ke localStorage:', err);
    return false;
  }
}

/**
 * Menghasilkan inisial dari nama pengguna untuk avatar default
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
  if (!name || !name.trim()) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function render(container) {
  const profile = getStoredProfile();
  let isEditing = false;

  container.innerHTML = `
    <div class="profile-page">
      <!-- 1. Hero Card: Avatar & Identitas Pengguna -->
      <div class="card profile-hero-card" id="profile-hero-card"></div>

      <!-- 2. Kartu Informasi Pribadi (Bisa Diedit - Lebar Penuh) -->
      <div class="card profile-info-card" id="profile-info-card"></div>
    </div>
  `;

  const heroCardEl = container.querySelector('#profile-hero-card');
  const infoCardEl = container.querySelector('#profile-info-card');

  /**
   * Render kartu Hero (Avatar, Nama, Tombol Kamera, Opsi Hapus Foto)
   */
  function renderHeroCard() {
    if (!heroCardEl) return;

    heroCardEl.innerHTML = `
      <div class="profile-banner-gradient">
        <svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <pattern id="profile-dots" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="#FFFFFF" fill-opacity="0.28" />
            </pattern>
          </defs>
          <circle cx="350" cy="10" r="80" fill="#FFFFFF" fill-opacity="0.12" />
          <circle cx="300" cy="130" r="60" fill="#60A5FA" fill-opacity="0.22" />
          <rect x="180" y="0" width="220" height="140" fill="url(#profile-dots)" />
        </svg>
      </div>

      <div class="profile-card-header">
        <div class="profile-avatar-wrapper">
          <div class="profile-avatar-circle" id="profile-avatar-circle">
            ${profile.photo
              ? `<img src="${profile.photo}" alt="Foto Profil" class="profile-avatar-img" />`
              : `<span class="profile-avatar-initials">${escapeHtml(getInitials(profile.name))}</span>`
            }
          </div>
          <button type="button" class="profile-avatar-camera-btn" id="btn-change-photo" title="Ubah Foto Profil" aria-label="Ubah Foto Profil">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </button>
          <input type="file" id="profile-photo-input" accept="image/*" style="display: none;" />
        </div>

        <div class="profile-info-block">
          <h2 class="profile-name">${escapeHtml(profile.name)}</h2>
          <div class="profile-header-actions">
            <span class="profile-role-badge">
              <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Pengguna CoSpace
            </span>
            ${profile.photo ? `
              <button type="button" class="btn-remove-photo" id="btn-remove-photo" title="Hapus foto profil">
                <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Hapus Foto
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    // Pasang listener upload foto
    const changePhotoBtn = heroCardEl.querySelector('#btn-change-photo');
    const photoInput = heroCardEl.querySelector('#profile-photo-input');
    const removePhotoBtn = heroCardEl.querySelector('#btn-remove-photo');

    if (changePhotoBtn && photoInput) {
      changePhotoBtn.addEventListener('click', () => {
        photoInput.click();
      });

      photoInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          handlePhotoUpload(file);
        }
        photoInput.value = '';
      });
    }

    if (removePhotoBtn) {
      removePhotoBtn.addEventListener('click', () => {
        profile.photo = null;
        if (saveStoredProfile(profile)) {
          renderHeroCard();
          showToast('Foto profil berhasil dihapus.', 'info');
        } else {
          showToast('Gagal menghapus foto profil.', 'error');
        }
      });
    }
  }

  /**
   * Proses upload dan kompresi foto ke ~256x256 JPEG
   * @param {File} file
   */
  function handlePhotoUpload(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Harap pilih file gambar (JPG, PNG, WebP).', 'error');
      return;
    }

    // Maksimal 5MB (5 * 1024 * 1024 byte)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran gambar maksimal 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const targetSize = 256;
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');

          // Center-crop gambar agar persegi
          const minSide = Math.min(img.width, img.height);
          const startX = (img.width - minSide) / 2;
          const startY = (img.height - minSide) / 2;

          ctx.drawImage(img, startX, startY, minSide, minSide, 0, 0, targetSize, targetSize);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

          profile.photo = compressedDataUrl;
          if (saveStoredProfile(profile)) {
            renderHeroCard();
            showToast('Foto profil berhasil diperbarui.', 'success');
          } else {
            showToast('Gagal menyimpan foto ke memori lokal.', 'error');
          }
        } catch (err) {
          console.error('Gagal memproses gambar:', err);
          showToast('Terjadi kesalahan saat memproses gambar.', 'error');
        }
      };

      img.onerror = () => {
        showToast('Gagal memuat file gambar.', 'error');
      };

      img.src = event.target.result;
    };

    reader.onerror = () => {
      showToast('Gagal membaca berkas gambar.', 'error');
    };

    reader.readAsDataURL(file);
  }

  /**
   * Render kartu Informasi Pribadi (View Mode vs Edit Mode)
   */
  function renderInfoCard() {
    if (!infoCardEl) return;

    if (!isEditing) {
      // 1. VIEW MODE
      infoCardEl.innerHTML = `
        <div class="profile-card-title-row">
          <div>
            <h3 class="card-title" style="font-size: 1.05rem; margin-bottom: 2px;">Informasi Pribadi</h3>
            <p class="card-subtitle" style="font-size: 0.82rem; margin-bottom: 0;">Data akun dan kontak Anda.</p>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-edit-profile" style="padding: 7px 16px; font-size: 0.82rem;">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit Profil
          </button>
        </div>

        <div class="profile-details-list">
          <div class="profile-detail-item">
            <div class="profile-detail-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div class="profile-detail-content">
              <div class="profile-detail-label">Nama Lengkap</div>
              <div class="profile-detail-value" id="display-name">${escapeHtml(profile.name)}</div>
            </div>
          </div>

          <div class="profile-detail-item">
            <div class="profile-detail-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <div class="profile-detail-content">
              <div class="profile-detail-label">Email</div>
              <div class="profile-detail-value ${profile.email ? '' : 'is-empty'}" id="display-email">
                ${profile.email ? escapeHtml(profile.email) : 'Belum diatur'}
              </div>
            </div>
          </div>

          <div class="profile-detail-item">
            <div class="profile-detail-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            <div class="profile-detail-content">
              <div class="profile-detail-label">No. Telepon</div>
              <div class="profile-detail-value ${profile.phone ? '' : 'is-empty'}" id="display-phone">
                ${profile.phone ? escapeHtml(profile.phone) : 'Belum diatur'}
              </div>
            </div>
          </div>
        </div>
      `;

      const editBtn = infoCardEl.querySelector('#btn-edit-profile');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          isEditing = true;
          renderInfoCard();
          const nameInput = infoCardEl.querySelector('#input-profile-name');
          if (nameInput) nameInput.focus();
        });
      }
    } else {
      // 2. EDIT MODE
      infoCardEl.innerHTML = `
        <div class="profile-card-title-row">
          <div>
            <h3 class="card-title" style="font-size: 1.05rem; margin-bottom: 2px;">Edit Informasi Pribadi</h3>
            <p class="card-subtitle" style="font-size: 0.82rem; margin-bottom: 0;">Perbarui data akun dan kontak Anda.</p>
          </div>
        </div>

        <form id="profile-edit-form" class="profile-edit-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="input-profile-name">
              Nama Lengkap <span class="req">*</span>
            </label>
            <input
              type="text"
              id="input-profile-name"
              class="form-control"
              placeholder="Masukkan nama lengkap"
              value="${escapeHtml(profile.name)}"
              required
              autocomplete="name"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="input-profile-email">
              Email
            </label>
            <input
              type="email"
              id="input-profile-email"
              class="form-control"
              placeholder="contoh: user@cospace.id"
              value="${escapeHtml(profile.email)}"
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="input-profile-phone">
              No. Telepon
            </label>
            <input
              type="tel"
              id="input-profile-phone"
              class="form-control"
              placeholder="contoh: 081234567890"
              value="${escapeHtml(profile.phone)}"
              autocomplete="tel"
            />
          </div>

          <div class="profile-form-actions">
            <button type="button" class="btn btn-secondary" id="btn-cancel-edit">
              Batal
            </button>
            <button type="submit" class="btn btn-primary" id="btn-save-edit">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Simpan
            </button>
          </div>
        </form>
      `;

      const form = infoCardEl.querySelector('#profile-edit-form');
      const cancelBtn = infoCardEl.querySelector('#btn-cancel-edit');

      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          isEditing = false;
          renderInfoCard();
        });
      }

      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();

          const nameInput = form.querySelector('#input-profile-name');
          const emailInput = form.querySelector('#input-profile-email');
          const phoneInput = form.querySelector('#input-profile-phone');

          const nameVal = nameInput ? nameInput.value.trim() : '';
          const emailVal = emailInput ? emailInput.value.trim() : '';
          const phoneVal = phoneInput ? phoneInput.value.trim() : '';

          // 1. Validasi Nama (Wajib)
          if (!nameVal) {
            showToast('Nama tidak boleh kosong.', 'error');
            if (nameInput) nameInput.focus();
            return;
          }

          // 2. Validasi Email (Jika diisi)
          if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
            showToast('Format email tidak valid.', 'error');
            if (emailInput) emailInput.focus();
            return;
          }

          // 3. Validasi No. Telepon (Jika diisi)
          if (phoneVal && !/^[0-9+\s()-]{8,20}$/.test(phoneVal)) {
            showToast('Nomor telepon minimal 8 digit dan hanya angka/simbol kontak valid.', 'error');
            if (phoneInput) phoneInput.focus();
            return;
          }

          // Update objek profile
          profile.name = nameVal;
          profile.email = emailVal;
          profile.phone = phoneVal;

          if (saveStoredProfile(profile)) {
            isEditing = false;
            renderHeroCard();
            renderInfoCard();
            showToast('Profil berhasil disimpan!', 'success');
          } else {
            showToast('Gagal menyimpan profil ke perangkat.', 'error');
          }
        });
      }
    }
  }

  // Render awal hero & info card
  renderHeroCard();
  renderInfoCard();
}

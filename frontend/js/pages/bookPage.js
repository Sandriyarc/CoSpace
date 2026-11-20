/**
 * Halaman Formulir Reservasi Ruangan
 * Rute: #/book dan #/book?room=ID
 */

import { roomApi, customerApi, bookingApi } from '../api.js';
import {
  formatRupiah,
  formatTime,
  formatDateIndo,
  timeToSeconds,
  calculateDurationHours,
  getTodayDateString,
  escapeHtml,
  renderSkeletonList,
  renderErrorState,
  showToast
} from '../utils.js';

export function render(container, context = {}) {
  const preselectedRoomId = context.query?.get('room') || '';

  // Render kerangka form awal
  container.innerHTML = `
    <div class="book-page">
      <div class="placeholder-header" style="margin-bottom: 14px;">
        <span class="placeholder-badge">Form Pemesanan</span>
        <p class="placeholder-desc">Isi rincian jadwal dan data diri untuk melakukan reservasi coworking space.</p>
      </div>

      <!-- Area Peringatan Bentrok Jadwal (Muncul saat 409) -->
      <div id="conflict-alert-wrapper" style="display: none;"></div>

      <div id="form-loader-container">
        ${renderSkeletonList(2)}
      </div>

      <form id="booking-form" style="display: none;" novalidate>
        <div class="booking-form-grid">
          <!-- Kolom Kiri: Ruangan & Jadwal + Estimasi Biaya -->
          <div class="booking-form-col">
            <!-- Card 1: Pilihan Ruangan & Jadwal -->
            <div class="card card-static">
              <div class="form-stepper">
                <span class="step-badge">1</span>
                <div>
                  <span class="stepper-kicker">Langkah 1</span>
                  <h3 class="form-section-title">Ruangan dan Jadwal</h3>
                </div>
              </div>

              <!-- Pilih Ruangan -->
              <div class="form-group">
                <label class="form-label" for="field-room">
                  <span>Pilih Ruangan<span class="req">*</span></span>
                </label>
                <select id="field-room" class="form-select">
                  <option value="">-- Pilih Ruangan --</option>
                </select>
                <span id="error-field-room" class="field-error"></span>
              </div>

              <!-- Tanggal Reservasi -->
              <div class="form-group">
                <label class="form-label" for="field-date">
                  <span>Tanggal Reservasi<span class="req">*</span></span>
                </label>
                <input
                  type="date"
                  id="field-date"
                  class="form-control"
                  min="${getTodayDateString()}"
                  value="${getTodayDateString()}"
                  placeholder="Pilih Tanggal"
                  aria-label="Tanggal Reservasi"
                />
                <span id="error-field-date" class="field-error"></span>
              </div>

              <!-- Jam Mulai & Selesai -->
              <div class="form-grid-2">
                <div class="form-group">
                  <label class="form-label" for="field-start-time">
                    <span>Jam Mulai<span class="req">*</span></span>
                  </label>
                  <input type="time" id="field-start-time" class="form-control" value="09:00" aria-label="Jam Mulai" />
                  <span id="error-field-start-time" class="field-error"></span>
                </div>
                <div class="form-group">
                  <label class="form-label" for="field-end-time">
                    <span>Jam Selesai<span class="req">*</span></span>
                  </label>
                  <input type="time" id="field-end-time" class="form-control" value="11:00" aria-label="Jam Selesai" />
                  <span id="error-field-end-time" class="field-error"></span>
                </div>
              </div>
            </div>

          </div>

          <!-- Kolom Kanan: Data Pemesan + Tombol Submit -->
          <div class="booking-form-col">
            <!-- Card 2: Data Pemesan (Customer) -->
            <div class="card card-static">
              <div class="form-stepper">
                <span class="step-badge">2</span>
                <div>
                  <span class="stepper-kicker">Langkah 2</span>
                  <h3 class="form-section-title">Data Pemesan</h3>
                </div>
              </div>

              <!-- Nama Lengkap -->
              <div class="form-group">
                <label class="form-label" for="field-name">
                  <span>Nama Lengkap<span class="req">*</span></span>
                </label>
                <input type="text" id="field-name" class="form-control" placeholder="Contoh: Budi Santoso" />
                <span id="error-field-name" class="field-error"></span>
              </div>

              <!-- Email -->
              <div class="form-group">
                <label class="form-label" for="field-email">
                  <span>Alamat Email<span class="req">*</span></span>
                </label>
                <input type="email" id="field-email" class="form-control" placeholder="nama@email.com" />
                <span id="error-field-email" class="field-error"></span>
              </div>

              <!-- Nomor Telepon -->
              <div class="form-group">
                <label class="form-label" for="field-phone">
                  <span>Nomor WhatsApp / Telepon<span class="req">*</span></span>
                </label>
                <input type="tel" id="field-phone" class="form-control" placeholder="08xxxxxxxxxx" />
                <span id="error-field-phone" class="field-error"></span>
              </div>

              <!-- Instansi / Perusahaan (Opsional) -->
              <div class="form-group">
                <label class="form-label" for="field-institution">
                  <span>Instansi / Universitas / Perusahaan</span>
                </label>
                <input type="text" id="field-institution" class="form-control" placeholder="Contoh: Universitas Indonesia" />
                <span id="error-field-institution" class="field-error"></span>
              </div>

              <!-- Catatan Tambahan -->
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" for="field-notes">
                  <span>Catatan Khusus (Opsional)</span>
                </label>
                <textarea id="field-notes" class="form-textarea" rows="2" placeholder="Kebutuhan tata ruang, proyektor, atau minuman..."></textarea>
              </div>
            </div>

            <!-- Estimasi Biaya reaktif, sticky di desktop -->
            <div class="cost-estimation-card" id="cost-estimation-card">
              <div class="cost-estimation-header">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                Estimasi Biaya Reservasi
              </div>
              <div id="cost-estimation-content">
                <p style="font-size: 0.84rem; color: var(--text-secondary);">
                  Pilih ruangan dan waktu reservasi untuk melihat perhitungan biaya.
                </p>
              </div>
            </div>

            <!-- Tombol Aksi Submit -->
            <div style="margin-top: 20px; margin-bottom: 16px;">
              <button type="submit" id="btn-submit-booking" class="btn btn-primary btn-block" style="padding: 14px; font-size: 1rem; border-radius: var(--radius-md);">
                Konfirmasi & Buat Reservasi
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  `;

  let availableRooms = [];

  const loaderContainer = container.querySelector('#form-loader-container');
  const formElement = container.querySelector('#booking-form');
  const conflictWrapper = container.querySelector('#conflict-alert-wrapper');
  const roomSelect = container.querySelector('#field-room');
  const dateInput = container.querySelector('#field-date');
  const startTimeInput = container.querySelector('#field-start-time');
  const endTimeInput = container.querySelector('#field-end-time');
  const nameInput = container.querySelector('#field-name');
  const emailInput = container.querySelector('#field-email');
  const phoneInput = container.querySelector('#field-phone');
  const institutionInput = container.querySelector('#field-institution');
  const notesInput = container.querySelector('#field-notes');
  const costContent = container.querySelector('#cost-estimation-content');
  const submitBtn = container.querySelector('#btn-submit-booking');

  /**
   * Dapatkan string jam menit berikutnya (dibulatkan ke menit berikutnya)
   * Contoh: 14:05:23 -> 14:06
   */
  function getNextMinuteString() {
    const now = new Date();
    const nextTime = new Date(Math.floor(now.getTime() / 60000) * 60000 + 60000);
    if (nextTime.getDate() !== now.getDate()) {
      return '23:59';
    }
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(nextTime.getHours())}:${pad(nextTime.getMinutes())}`;
  }

  /**
   * Cek apakah jam mulai lebih awal dari jam sekarang (zona waktu lokal)
   */
  function isStartTimePastToday(startTime) {
    if (!startTime) return false;
    const now = new Date();
    const [startH, startM] = startTime.split(':').map(Number);
    const nowH = now.getHours();
    const nowM = now.getMinutes();

    if (startH < nowH) return true;
    if (startH === nowH && startM <= nowM) return true;
    return false;
  }

  /**
   * Helper penanganan pesan error per-field
   */
  function setError(fieldId, errorMsg) {
    const input = container.querySelector(`#${fieldId}`);
    const errorSpan = container.querySelector(`#error-${fieldId}`);
    if (input) input.classList.toggle('is-invalid', Boolean(errorMsg));
    if (errorSpan) errorSpan.textContent = errorMsg || '';
  }

  function clearErrors() {
    container.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    container.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  }

  /**
   * Cek apakah ada error validasi di form
   */
  function hasValidationErrors() {
    const bookingDate = dateInput.value;
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;
    const todayStr = getTodayDateString();

    if (!bookingDate || bookingDate < todayStr) return true;
    if (!startTime) return true;
    if (bookingDate === todayStr && isStartTimePastToday(startTime)) return true;
    if (!endTime) return true;
    if (startTime && timeToSeconds(endTime) <= timeToSeconds(startTime)) return true;

    // Periksa apakah ada pesan error aktif pada elemen span.field-error
    for (const span of container.querySelectorAll('.field-error')) {
      if (span.textContent.trim().length > 0) return true;
    }

    return false;
  }

  /**
   * Perbarui status aktif/nonaktif tombol submit
   */
  function updateSubmitButtonState() {
    if (submitBtn) {
      submitBtn.disabled = hasValidationErrors();
    }
  }

  /**
   * Validasi tanggal dan jam reservasi secara menyeluruh & reaktif
   */
  function validateDateTime() {
    const bookingDate = dateInput.value;
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;
    const todayStr = getTodayDateString();
    const isToday = bookingDate === todayStr;

    // 1. Set atribut min pada input jam mulai secara dinamis saat tanggal hari ini dipilih
    // (dibulatkan ke menit berikutnya), dan hapus min jika tanggal bukan hari ini
    if (isToday) {
      startTimeInput.setAttribute('min', getNextMinuteString());
    } else {
      startTimeInput.removeAttribute('min');
    }

    let isDateValid = true;
    let isStartTimeValid = true;
    let isEndTimeValid = true;

    // 2. Validasi Tanggal (tidak boleh sebelum hari ini)
    if (!bookingDate) {
      setError('field-date', 'Tanggal reservasi wajib diisi');
      isDateValid = false;
    } else if (bookingDate < todayStr) {
      setError('field-date', 'Tanggal reservasi tidak boleh sebelum hari ini');
      isDateValid = false;
    } else {
      setError('field-date', '');
    }

    // 3. Validasi Jam Mulai (jika hari ini, tidak boleh lebih awal dari sekarang)
    if (!startTime) {
      setError('field-start-time', 'Jam mulai wajib diisi');
      isStartTimeValid = false;
    } else if (isToday && isStartTimePastToday(startTime)) {
      setError('field-start-time', 'Jam mulai sudah lewat. Pilih jam setelah sekarang');
      isStartTimeValid = false;
    } else {
      setError('field-start-time', '');
    }

    // 4. Validasi Jam Selesai (harus lebih besar dari jam mulai)
    if (!endTime) {
      setError('field-end-time', 'Jam selesai wajib diisi');
      isEndTimeValid = false;
    } else if (startTime && timeToSeconds(endTime) <= timeToSeconds(startTime)) {
      setError('field-end-time', 'Jam selesai harus lebih besar dari jam mulai');
      isEndTimeValid = false;
    } else {
      setError('field-end-time', '');
    }

    updateSubmitButtonState();
    return isDateValid && isStartTimeValid && isEndTimeValid;
  }

  /**
   * Perbarui tampilan estimasi biaya secara instan
   */
  function updateCostEstimation() {
    const selectedRoomId = roomSelect.value;
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;

    const selectedRoom = availableRooms.find(r => r.id === selectedRoomId);

    if (!selectedRoom || !startTime || !endTime) {
      costContent.innerHTML = `
        <p style="font-size: 0.84rem; color: var(--text-secondary);">
          Pilih ruangan dan jam reservasi untuk melihat rincian biaya.
        </p>
      `;
      return;
    }

    const bookingDate = dateInput.value;
    const todayStr = getTodayDateString();

    if (bookingDate === todayStr && isStartTimePastToday(startTime)) {
      costContent.innerHTML = `
        <p class="cost-estimation-warning" style="font-size: 0.84rem; color: #DC2626; font-weight: 600;">
          Jam mulai sudah lewat. Pilih jam setelah sekarang
        </p>
      `;
      return;
    }

    const duration = calculateDurationHours(startTime, endTime);
    const pricePerHour = Number(selectedRoom.price_per_hour) || 0;

    if (duration <= 0) {
      costContent.innerHTML = `
        <p class="cost-estimation-warning" style="font-size: 0.84rem; color: #DC2626; font-weight: 600;">
          Jam selesai harus lebih besar dari jam mulai
        </p>
      `;
      return;
    }

    const totalCost = duration * pricePerHour;

    costContent.innerHTML = `
      <div class="cost-estimation-row">
        <span>Ruangan Terpilih:</span>
        <strong>${escapeHtml(selectedRoom.name)}</strong>
      </div>
      <div class="cost-estimation-row">
        <span>Tarif Per Jam:</span>
        <span>${formatRupiah(pricePerHour)}</span>
      </div>
      <div class="cost-estimation-row">
        <span>Total Durasi:</span>
        <span>${duration} Jam (${formatTime(startTime)} - ${formatTime(endTime)})</span>
      </div>
      <div class="cost-estimation-total">
        <span style="font-weight: 700; color: var(--text-main);">Estimasi Total:</span>
        <span class="cost-total-amount">${formatRupiah(totalCost)}</span>
      </div>
    `;
  }

  /**
   * Muat data daftar ruangan untuk dropdown
   */
  async function initForm() {
    try {
      availableRooms = await roomApi.getAll();

      // Isi opsi dropdown ruangan
      roomSelect.innerHTML = `
        <option value="">-- Pilih Ruangan --</option>
        ${availableRooms.map(r => `
          <option value="${escapeHtml(r.id)}" ${r.id === preselectedRoomId ? 'selected' : ''}>
            ${escapeHtml(r.name)} - ${escapeHtml(r.type)} (${formatRupiah(r.price_per_hour)}/jam)
          </option>
        `).join('')}
      `;

      loaderContainer.style.display = 'none';
      formElement.style.display = 'block';

      // Validasi awal waktu & tanggal dan kalkulasi estimasi awal
      validateDateTime();
      updateCostEstimation();
      updateSubmitButtonState();
    } catch (err) {
      loaderContainer.innerHTML = renderErrorState({
        title: 'Gagal Memuat Formulir',
        message: err.message || 'Gagal memuat data ruangan untuk formulir.',
        retryButtonId: 'btn-retry-form'
      });
      const retryBtn = container.querySelector('#btn-retry-form');
      if (retryBtn) retryBtn.addEventListener('click', initForm);
    }
  }

  // Event listener reaktif untuk estimasi biaya dan validasi langsung
  roomSelect.addEventListener('change', () => {
    if (roomSelect.value) setError('field-room', '');
    updateCostEstimation();
    updateSubmitButtonState();
  });

  dateInput.addEventListener('input', () => {
    validateDateTime();
    updateCostEstimation();
  });
  dateInput.addEventListener('change', () => {
    validateDateTime();
    updateCostEstimation();
  });

  startTimeInput.addEventListener('input', () => {
    validateDateTime();
    updateCostEstimation();
  });
  startTimeInput.addEventListener('change', () => {
    validateDateTime();
    updateCostEstimation();
  });

  endTimeInput.addEventListener('input', () => {
    validateDateTime();
    updateCostEstimation();
  });
  endTimeInput.addEventListener('change', () => {
    validateDateTime();
    updateCostEstimation();
  });

  nameInput.addEventListener('input', () => {
    if (nameInput.value.trim()) setError('field-name', '');
    updateSubmitButtonState();
  });

  emailInput.addEventListener('input', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput.value.trim() && emailRegex.test(emailInput.value.trim())) {
      setError('field-email', '');
    }
    updateSubmitButtonState();
  });

  phoneInput.addEventListener('input', () => {
    if (phoneInput.value.trim().length >= 8) setError('field-phone', '');
    updateSubmitButtonState();
  });

  /**
   * Tampilkan kotak peringatan jadwal bentrok (HTTP 409) dan jadwal terisi
   */
  async function showConflictWarning(roomId, bookingDate) {
    conflictWrapper.style.display = 'block';
    conflictWrapper.innerHTML = `
      <div class="conflict-alert-box">
        <div class="conflict-alert-title">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          Jadwal Bentrok pada Ruangan Ini!
        </div>
        <p class="conflict-alert-desc">
          Waktu yang Anda pilih bertabrakan dengan reservasi lain yang sudah terkonfirmasi. Silakan pilih slot waktu lain berdasarkan jadwal terisi berikut:
        </p>
        <div id="conflict-slots-loading" style="font-size: 0.82rem; color: #991b1b;">
          Memuat jadwal terisi pada tanggal ${formatDateIndo(bookingDate)}...
        </div>
      </div>
    `;

    conflictWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
      // Ambil jadwal booking ruangan dan saring pada tanggal yang bentrok
      const bookings = await roomApi.getBookings(roomId);
      const onDate = (bookings || []).filter(b => b.booking_date === bookingDate);

      const slotsContainer = conflictWrapper.querySelector('#conflict-slots-loading');
      if (onDate.length > 0) {
        slotsContainer.outerHTML = `
          <div class="conflict-schedule-list">
            ${onDate.map(b => `
              <div class="conflict-schedule-item">
                <span>⏰ ${formatTime(b.start_time)} - ${formatTime(b.end_time)}</span>
                <span>(Terisi oleh ${escapeHtml(b.customers?.name || 'Pelanggan')})</span>
              </div>
            `).join('')}
          </div>
        `;
      } else {
        slotsContainer.textContent = 'Jadwal pada tanggal tersebut bentrok. Silakan ganti jam mulai/selesai Anda.';
      }
    } catch {
      const slotsContainer = conflictWrapper.querySelector('#conflict-slots-loading');
      if (slotsContainer) {
        slotsContainer.textContent = 'Silakan pilih jam yang berbeda pada tanggal tersebut.';
      }
    }
  }

  // Submit Handler
  formElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    conflictWrapper.style.display = 'none';

    const roomId = roomSelect.value;
    const bookingDate = dateInput.value;
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const institution = institutionInput.value.trim();
    const notes = notesInput.value.trim();

    // 1. Validasi Klien
    let hasError = false;

    if (!roomId) {
      setError('field-room', 'Ruangan wajib dipilih');
      hasError = true;
    }

    if (!bookingDate) {
      setError('field-date', 'Tanggal reservasi wajib diisi');
      hasError = true;
    } else if (bookingDate < getTodayDateString()) {
      setError('field-date', 'Tanggal reservasi tidak boleh sebelum hari ini');
      hasError = true;
    }

    if (!startTime) {
      setError('field-start-time', 'Jam mulai wajib diisi');
      hasError = true;
    } else if (bookingDate === getTodayDateString() && isStartTimePastToday(startTime)) {
      setError('field-start-time', 'Jam mulai sudah lewat. Pilih jam setelah sekarang');
      hasError = true;
    }

    if (!endTime) {
      setError('field-end-time', 'Jam selesai wajib diisi');
      hasError = true;
    } else if (startTime && timeToSeconds(endTime) <= timeToSeconds(startTime)) {
      setError('field-end-time', 'Jam selesai harus lebih besar dari jam mulai');
      hasError = true;
    }

    if (!name) {
      setError('field-name', 'Nama lengkap wajib diisi');
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError('field-email', 'Alamat email wajib diisi');
      hasError = true;
    } else if (!emailRegex.test(email)) {
      setError('field-email', 'Format alamat email tidak valid (contoh: user@domain.com)');
      hasError = true;
    }

    if (!phone) {
      setError('field-phone', 'Nomor telepon wajib diisi');
      hasError = true;
    } else if (phone.length < 8) {
      setError('field-phone', 'Nomor telepon minimal 8 digit angka');
      hasError = true;
    }

    if (hasError) {
      updateSubmitButtonState();
      showToast('Mohon lengkapi semua isian formulir dengan benar.', 'error');
      return;
    }

    // 2. Kunci tombol submit untuk mencegah submit ganda
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spin" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" style="animation: spin 1s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="0.8"></path>
      </svg>
      Memproses Reservasi...
    `;

    try {
      // 3. Cari Customer dengan email yang sama di GET /api/customers
      const allCustomers = await customerApi.getAll();
      let customer = allCustomers.find(
        c => String(c.email).toLowerCase() === email.toLowerCase()
      );

      // Jika belum ada, buat customer baru via POST /api/customers
      if (!customer) {
        customer = await customerApi.create({
          name: name,
          email: email,
          phone: phone,
          institution: institution || null
        });
      }

      // 4. Buat Reservasi baru via POST /api/bookings
      const newBooking = await bookingApi.create({
        room_id: roomId,
        customer_id: customer.id,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        notes: notes || null
      });

      showToast('Reservasi Anda berhasil dibuat!', 'success');

      // Arahkan ke halaman detail reservasi baru
      window.location.hash = `#/bookings/${encodeURIComponent(newBooking.id)}`;
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Konfirmasi & Buat Reservasi';
      updateSubmitButtonState();

      // 5. Penanganan Konflik 409 (Jadwal Bentrok)
      if (err.status === 409 || (err.message && err.message.toLowerCase().includes('bentrok'))) {
        showToast('Jadwal bentrok dengan reservasi lain!', 'error');
        await showConflictWarning(roomId, bookingDate);
      } else {
        showToast(err.message || 'Gagal membuat reservasi. Silakan coba lagi.', 'error');
      }
    }
  });

  // Pengecekan berkala setiap 30 detik untuk waktu lampau jika tanggal adalah hari ini
  const timeValidationTimer = setInterval(() => {
    if (dateInput.value === getTodayDateString()) {
      validateDateTime();
    }
  }, 30000);

  initForm();

  return () => {
    clearInterval(timeValidationTimer);
  };
}

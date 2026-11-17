/**
 * API Service Client untuk CoSpace Frontend
 * Terpusat pada satu BASE_URL dengan penanganan error dan konversi response.
 */

export const BASE_URL = 'https://co-space-indol.vercel.app/api';

/**
 * Fungsi fetch terpusat dengan penanganan header, JSON parsing, dan HTTP error
 * @param {string} endpoint - Path endpoint (misal '/rooms' atau '/bookings')
 * @param {RequestInit} [options={}] - Opsi Fetch API (method, headers, body)
 * @returns {Promise<any>}
 */
export async function fetchAPI(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  // Otomatis ubah body objek JS menjadi JSON string
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    // Parse JSON jika ada konten response
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      // Ambil pesan error dari backend JSON ({ error: '...' }) atau default statusText
      const errorMessage = data && data.error ? data.error : `Request gagal dengan status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // Tangani error jaringan (misal server offline atau koneksi terputus)
    if (!err.status) {
      err.message = err.message || 'Gagal terhubung ke server backend';
    }
    console.error(`[API Error] ${options.method || 'GET'} ${url}:`, err);
    throw err;
  }
}

/* ==========================================================================
   Endpoint Ruangan (/api/rooms)
   ========================================================================== */
export const roomApi = {
  // Ambil semua ruangan
  getAll: () => fetchAPI('/rooms'),

  // Ambil detail satu ruangan berdasarkan ID
  getById: (id) => fetchAPI(`/rooms/${id}`),

  // Ambil jadwal booking aktif pada ruangan tertentu
  getBookings: (id) => fetchAPI(`/rooms/${id}/bookings`),

  // Tambah ruangan baru
  create: (roomData) => fetchAPI('/rooms', {
    method: 'POST',
    body: roomData
  }),

  // Perbarui data ruangan
  update: (id, roomData) => fetchAPI(`/rooms/${id}`, {
    method: 'PUT',
    body: roomData
  }),

  // Hapus data ruangan
  delete: (id) => fetchAPI(`/rooms/${id}`, {
    method: 'DELETE'
  })
};

/* ==========================================================================
   Endpoint Reservasi / Booking (/api/bookings)
   ========================================================================== */
export const bookingApi = {
  // Ambil semua booking dengan filter opsional (date, status, room_id)
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.date) query.append('date', params.date);
    if (params.status) query.append('status', params.status);
    if (params.room_id) query.append('room_id', params.room_id);

    const queryString = query.toString();
    return fetchAPI(`/bookings${queryString ? `?${queryString}` : ''}`);
  },

  // Ambil satu booking berdasarkan ID
  getById: (id) => fetchAPI(`/bookings/${id}`),

  // Buat reservasi baru (validasi waktu & bentrok dijalankan di backend)
  create: (bookingData) => fetchAPI('/bookings', {
    method: 'POST',
    body: bookingData
  }),

  // Perbarui reservasi (mendukung pembaruan parsial)
  update: (id, bookingData) => fetchAPI(`/bookings/${id}`, {
    method: 'PUT',
    body: bookingData
  }),

  // Hapus reservasi
  delete: (id) => fetchAPI(`/bookings/${id}`, {
    method: 'DELETE'
  })
};

/* ==========================================================================
   Endpoint Pelanggan / Customer (/api/customers)
   ========================================================================== */
export const customerApi = {
  // Ambil semua data customer
  getAll: () => fetchAPI('/customers'),

  // Ambil satu data customer berdasarkan ID
  getById: (id) => fetchAPI(`/customers/${id}`),

  // Tambah customer baru
  create: (customerData) => fetchAPI('/customers', {
    method: 'POST',
    body: customerData
  }),

  // Perbarui data customer
  update: (id, customerData) => fetchAPI(`/customers/${id}`, {
    method: 'PUT',
    body: customerData
  }),

  // Hapus data customer
  delete: (id) => fetchAPI(`/customers/${id}`, {
    method: 'DELETE'
  })
};

/* ==========================================================================
   Health Check
   ========================================================================== */
export const checkHealth = async () => {
  const rootUrl = BASE_URL.replace(/\/api\/?$/, '');
  const res = await fetch(`${rootUrl}/`);
  return res.json();
};


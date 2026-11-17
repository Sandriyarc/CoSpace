import supabase from '../config/supabaseClient.js';

// Mengambil semua data booking beserta relasi rooms dan customers dengan opsi filter & sorting
export const getAllBookings = async ({ date, status, room_id } = {}) => {
  let query = supabase
    .from('bookings')
    .select('*, rooms(id, name, type, price_per_hour), customers(id, name, email, phone)')
    .order('booking_date', { ascending: true })
    .order('start_time', { ascending: true });

  // Filter opsional berdasarkan tanggal reservasi
  if (date) {
    query = query.eq('booking_date', date);
  }

  // Filter opsional berdasarkan status reservasi
  if (status) {
    query = query.eq('status', status);
  }

  // Filter opsional berdasarkan ruangan
  if (room_id) {
    query = query.eq('room_id', room_id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Mengambil satu data booking berdasarkan ID beserta relasi rooms dan customers
export const getBookingById = async (id) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, rooms(id, name, type, price_per_hour), customers(id, name, email, phone)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Fungsi untuk mengecek bentrok jadwal pada ruangan dan tanggal yang sama
export const hasConflict = async ({ room_id, booking_date, start_time, end_time, excludeId = null }) => {
  // Ambil semua reservasi ruangan pada tanggal terkait dengan status bukan 'cancelled'
  let query = supabase
    .from('bookings')
    .select('id, start_time, end_time')
    .eq('room_id', room_id)
    .eq('booking_date', booking_date)
    .neq('status', 'cancelled');

  // Pada operasi PUT, abaikan booking dengan ID yang sedang diedit
  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Konversi format string jam (HH:mm atau HH:mm:ss) ke satuan detik
  const toSeconds = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(Number);
    return parts[0] * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  };

  const newStart = toSeconds(start_time);
  const newEnd = toSeconds(end_time);

  // Aturan bentrok: start_time baru < end_time lama DAN end_time baru > start_time lama
  const isConflict = data.some((existing) => {
    const existingStart = toSeconds(existing.start_time);
    const existingEnd = toSeconds(existing.end_time);

    return newStart < existingEnd && newEnd > existingStart;
  });

  return isConflict;
};

// Menambahkan data booking baru
export const createBooking = async (bookingData) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert([bookingData])
    .select('*, rooms(id, name, type, price_per_hour), customers(id, name, email, phone)')
    .single();

  if (error) throw error;
  return data;
};

// Memperbarui data booking berdasarkan ID (mendukung update penuh maupun parsial)
export const updateBooking = async (id, bookingData) => {
  const { data, error } = await supabase
    .from('bookings')
    .update(bookingData)
    .eq('id', id)
    .select('*, rooms(id, name, type, price_per_hour), customers(id, name, email, phone)')
    .single();

  if (error) throw error;
  return data;
};

// Menghapus data booking berdasarkan ID
export const deleteBooking = async (id) => {
  const { data, error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};


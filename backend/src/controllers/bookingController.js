import * as bookingModel from '../models/bookingModel.js';

// Helper fungsi untuk konversi format string jam ke satuan detik
const timeToSeconds = (timeStr) => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  return parts[0] * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
};

// Helper untuk memeriksa apakah waktu mulai reservasi sudah lewat di zona waktu Asia/Jakarta (UTC+7)
const isBookingTimePast = (bookingDate, startTime) => {
  if (!bookingDate || !startTime) return false;

  const dateStr = typeof bookingDate === 'string'
    ? bookingDate.split('T')[0]
    : bookingDate.toISOString().slice(0, 10);

  const parts = String(startTime).split(':').map((p) => p.padStart(2, '0'));
  const h = parts[0] || '00';
  const m = parts[1] || '00';
  const s = (parts[2] || '00').split('.')[0];
  const timeStr = `${h}:${m}:${s}`;

  const bookingIso = `${dateStr}T${timeStr}+07:00`;
  const bookingTimeMs = new Date(bookingIso).getTime();

  if (isNaN(bookingTimeMs)) return false;

  return bookingTimeMs <= Date.now();
};

// Menampilkan semua booking dengan relasi rooms dan customers (bisa difilter via query string)
export const getAllBookings = async (req, res) => {
  try {
    const { date, status, room_id } = req.query;
    const bookings = await bookingModel.getAllBookings({ date, status, room_id });
    return res.status(200).json(bookings);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Menampilkan data booking berdasarkan ID beserta relasi rooms dan customers
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await bookingModel.getBookingById(id);

    if (!booking) {
      return res.status(404).json({ error: 'Data booking tidak ditemukan' });
    }

    return res.status(200).json(booking);
  } catch (err) {
    if (err.code === 'PGRST116') {
      return res.status(404).json({ error: 'Data booking tidak ditemukan' });
    }
    return res.status(500).json({ error: err.message });
  }
};

// Menambahkan data booking baru
export const createBooking = async (req, res) => {
  try {
    const { room_id, customer_id, booking_date, start_time, end_time, status, notes } = req.body;

    // 1. Validasi field wajib terisi
    if (!room_id || !customer_id || !booking_date || !start_time || !end_time) {
      return res.status(400).json({
        error: 'Field room_id, customer_id, booking_date, start_time, dan end_time wajib diisi'
      });
    }

    // 2. Validasi waktu mulai reservasi tidak boleh sudah lewat (zona waktu Asia/Jakarta UTC+7)
    if (isBookingTimePast(booking_date, start_time)) {
      return res.status(400).json({
        error: 'Waktu reservasi sudah lewat'
      });
    }

    // 3. Validasi end_time harus lebih besar dari start_time
    if (timeToSeconds(end_time) <= timeToSeconds(start_time)) {
      return res.status(400).json({
        error: 'Waktu selesai (end_time) harus lebih besar dari waktu mulai (start_time)'
      });
    }

    // 3. Cek jadwal bentrok pada ruangan dan tanggal yang sama
    const conflict = await bookingModel.hasConflict({
      room_id,
      booking_date,
      start_time,
      end_time
    });

    if (conflict) {
      return res.status(409).json({
        error: 'Jadwal bentrok dengan reservasi lain pada ruangan ini'
      });
    }

    // 4. Simpan booking baru
    const newBooking = await bookingModel.createBooking({
      room_id,
      customer_id,
      booking_date,
      start_time,
      end_time,
      status: status || 'confirmed',
      notes: notes || null
    });

    return res.status(201).json(newBooking);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Memperbarui data booking berdasarkan ID (mendukung update parsial)
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Ambil data booking lama dari database berdasarkan ID (404 jika tidak ditemukan)
    let existingBooking;
    try {
      existingBooking = await bookingModel.getBookingById(id);
    } catch (err) {
      if (err.code === 'PGRST116') {
        return res.status(404).json({ error: 'Data booking tidak ditemukan' });
      }
      throw err;
    }

    if (!existingBooking) {
      return res.status(404).json({ error: 'Data booking tidak ditemukan' });
    }

    const {
      room_id,
      customer_id,
      booking_date,
      start_time,
      end_time,
      status,
      notes
    } = req.body;

    // 2. Gabungkan data lama dengan field baru yang dikirim di body
    const mergedBooking = {
      room_id: room_id !== undefined ? room_id : existingBooking.room_id,
      customer_id: customer_id !== undefined ? customer_id : existingBooking.customer_id,
      booking_date: booking_date !== undefined ? booking_date : existingBooking.booking_date,
      start_time: start_time !== undefined ? start_time : existingBooking.start_time,
      end_time: end_time !== undefined ? end_time : existingBooking.end_time,
      status: status !== undefined ? status : existingBooking.status,
      notes: notes !== undefined ? notes : existingBooking.notes
    };

    // Deteksi apakah body mengubah jadwal waktu (tanggal, jam mulai, atau jam selesai)
    const isTimeScheduleChanged =
      booking_date !== undefined ||
      start_time !== undefined ||
      end_time !== undefined;

    // Deteksi apakah body mengubah jadwal (ruangan, tanggal, jam mulai, atau jam selesai)
    const isScheduleChanged =
      room_id !== undefined ||
      isTimeScheduleChanged;

    // Deteksi apakah status diaktifkan kembali menjadi confirmed/aktif dari sebelumnya cancelled
    const isReactivating =
      existingBooking.status === 'cancelled' &&
      mergedBooking.status !== 'cancelled';

    // 3. Jika tanggal, jam mulai, atau jam selesai diubah, tolak jika waktu mulainya sudah lewat
    if (isTimeScheduleChanged) {
      if (isBookingTimePast(mergedBooking.booking_date, mergedBooking.start_time)) {
        return res.status(400).json({
          error: 'Waktu reservasi sudah lewat'
        });
      }
    }

    // 4 & 5. Jika jadwal diubah, jalankan validasi jam dan cek bentrok jadwal
    if (isScheduleChanged) {
      // Validasi: end_time harus lebih besar dari start_time
      if (timeToSeconds(mergedBooking.end_time) <= timeToSeconds(mergedBooking.start_time)) {
        return res.status(400).json({
          error: 'Waktu selesai (end_time) harus lebih besar dari waktu mulai (start_time)'
        });
      }

      // Cek bentrok dengan data gabungan (kecuali jika status booking yang diedit adalah cancelled)
      if (mergedBooking.status !== 'cancelled') {
        const conflict = await bookingModel.hasConflict({
          room_id: mergedBooking.room_id,
          booking_date: mergedBooking.booking_date,
          start_time: mergedBooking.start_time,
          end_time: mergedBooking.end_time,
          excludeId: id
        });

        if (conflict) {
          return res.status(409).json({
            error: 'Jadwal bentrok dengan reservasi lain pada ruangan ini'
          });
        }
      }
    } else if (isReactivating) {
      // 5. Jika status diubah kembali menjadi confirmed dari cancelled, jalankan juga cek bentrok
      const conflict = await bookingModel.hasConflict({
        room_id: mergedBooking.room_id,
        booking_date: mergedBooking.booking_date,
        start_time: mergedBooking.start_time,
        end_time: mergedBooking.end_time,
        excludeId: id
      });

      if (conflict) {
        return res.status(409).json({
          error: 'Jadwal bentrok dengan reservasi lain pada ruangan ini'
        });
      }
    }
    // Jika body HANYA berisi status, notes, atau customer_id (tanpa perubahan jadwal dan bukan reaktivasi),
    // langsung lanjut simpan tanpa validasi waktu dan tanpa cek bentrok.

    // 6. Simpan pembaruan ke database
    const updatedBooking = await bookingModel.updateBooking(id, {
      room_id: mergedBooking.room_id,
      customer_id: mergedBooking.customer_id,
      booking_date: mergedBooking.booking_date,
      start_time: mergedBooking.start_time,
      end_time: mergedBooking.end_time,
      status: mergedBooking.status,
      notes: mergedBooking.notes
    });

    if (!updatedBooking) {
      return res.status(404).json({ error: 'Data booking tidak ditemukan' });
    }

    return res.status(200).json(updatedBooking);
  } catch (err) {
    if (err.code === 'PGRST116') {
      return res.status(404).json({ error: 'Data booking tidak ditemukan' });
    }
    return res.status(500).json({ error: err.message });
  }
};

// Menghapus data booking berdasarkan ID
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBooking = await bookingModel.deleteBooking(id);

    if (!deletedBooking) {
      return res.status(404).json({ error: 'Data booking tidak ditemukan' });
    }

    return res.status(200).json({ message: 'Booking berhasil dihapus', data: deletedBooking });
  } catch (err) {
    if (err.code === 'PGRST116') {
      return res.status(404).json({ error: 'Data booking tidak ditemukan' });
    }
    return res.status(500).json({ error: err.message });
  }
};


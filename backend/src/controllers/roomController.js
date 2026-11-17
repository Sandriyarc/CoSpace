import * as roomModel from '../models/roomModel.js';

// Menampilkan semua data ruangan
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await roomModel.getAllRooms();
    return res.status(200).json(rooms);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Menampilkan data ruangan berdasarkan ID
export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await roomModel.getRoomById(id);

    if (!room) {
      return res.status(404).json({ error: 'Ruangan tidak ditemukan' });
    }

    return res.status(200).json(room);
  } catch (err) {
    if (err.code === 'PGRST116') {
      return res.status(404).json({ error: 'Ruangan tidak ditemukan' });
    }
    return res.status(500).json({ error: err.message });
  }
};

// Menambahkan data ruangan baru
export const createRoom = async (req, res) => {
  try {
    const { name, type, capacity, price_per_hour, facilities, description, image_url } = req.body;

    // Validasi field wajib
    if (!name || !type || capacity === undefined || price_per_hour === undefined) {
      return res.status(400).json({
        error: 'Field name, type, capacity, dan price_per_hour wajib diisi'
      });
    }

    const newRoom = await roomModel.createRoom({
      name,
      type,
      capacity,
      price_per_hour,
      facilities,
      description,
      image_url
    });

    return res.status(201).json(newRoom);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Memperbarui data ruangan berdasarkan ID
export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, capacity, price_per_hour, facilities, description, image_url } = req.body;

    const updatedRoom = await roomModel.updateRoom(id, {
      name,
      type,
      capacity,
      price_per_hour,
      facilities,
      description,
      image_url
    });

    if (!updatedRoom) {
      return res.status(404).json({ error: 'Ruangan tidak ditemukan' });
    }

    return res.status(200).json(updatedRoom);
  } catch (err) {
    if (err.code === 'PGRST116') {
      return res.status(404).json({ error: 'Ruangan tidak ditemukan' });
    }
    return res.status(500).json({ error: err.message });
  }
};

// Menghapus data ruangan berdasarkan ID
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRoom = await roomModel.deleteRoom(id);

    if (!deletedRoom) {
      return res.status(404).json({ error: 'Ruangan tidak ditemukan' });
    }

    return res.status(200).json({ message: 'Ruangan berhasil dihapus', data: deletedRoom });
  } catch (err) {
    if (err.code === 'PGRST116') {
      return res.status(404).json({ error: 'Ruangan tidak ditemukan' });
    }
    return res.status(500).json({ error: err.message });
  }
};

// Menampilkan daftar booking aktif untuk ruangan tertentu
export const getRoomBookings = async (req, res) => {
  try {
    const { id } = req.params;
    const bookings = await roomModel.getRoomBookings(id);
    return res.status(200).json(bookings);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


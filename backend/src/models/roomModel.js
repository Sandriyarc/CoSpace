import supabase from '../config/supabaseClient.js';

// Mengambil semua data ruangan
export const getAllRooms = async () => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
};

// Mengambil satu data ruangan berdasarkan ID
export const getRoomById = async (id) => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Menambahkan data ruangan baru
export const createRoom = async (roomData) => {
  const { data, error } = await supabase
    .from('rooms')
    .insert([roomData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Memperbarui data ruangan berdasarkan ID
export const updateRoom = async (id, roomData) => {
  const { data, error } = await supabase
    .from('rooms')
    .update(roomData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Menghapus data ruangan berdasarkan ID
export const deleteRoom = async (id) => {
  const { data, error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Mengambil daftar booking untuk suatu ruangan yang berstatus aktif (bukan cancelled)
export const getRoomBookings = async (roomId) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, customers(id, name, email, phone)')
    .eq('room_id', roomId)
    .neq('status', 'cancelled')
    .order('booking_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) throw error;
  return data;
};


import supabase from '../config/supabaseClient.js';

// Mengambil semua data customer
export const getAllCustomers = async () => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
};

// Mengambil satu data customer berdasarkan ID
export const getCustomerById = async (id) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// Menambahkan data customer baru
export const createCustomer = async (customerData) => {
  const { data, error } = await supabase
    .from('customers')
    .insert([customerData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Memperbarui data customer berdasarkan ID
export const updateCustomer = async (id, customerData) => {
  const { data, error } = await supabase
    .from('customers')
    .update(customerData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Menghapus data customer berdasarkan ID
export const deleteCustomer = async (id) => {
  const { data, error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};


import * as customerModel from '../models/customerModel.js';

// Menampilkan semua data customer
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await customerModel.getAllCustomers();
    return res.status(200).json(customers);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Menampilkan data customer berdasarkan ID
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await customerModel.getCustomerById(id);

    if (!customer) {
      return res.status(404).json({ error: 'Customer tidak ditemukan' });
    }

    return res.status(200).json(customer);
  } catch (err) {
    if (err.code === 'PGRST116') {
      return res.status(404).json({ error: 'Customer tidak ditemukan' });
    }
    return res.status(500).json({ error: err.message });
  }
};

// Menambahkan data customer baru
export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, institution } = req.body;

    // Validasi field wajib
    if (!name || !email || !phone) {
      return res.status(400).json({
        error: 'Field name, email, dan phone wajib diisi'
      });
    }

    const newCustomer = await customerModel.createCustomer({
      name,
      email,
      phone,
      institution: institution || null
    });

    return res.status(201).json(newCustomer);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Memperbarui data customer berdasarkan ID
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, institution } = req.body;

    const updatedCustomer = await customerModel.updateCustomer(id, {
      name,
      email,
      phone,
      institution: institution || null
    });

    if (!updatedCustomer) {
      return res.status(404).json({ error: 'Customer tidak ditemukan' });
    }

    return res.status(200).json(updatedCustomer);
  } catch (err) {
    if (err.code === 'PGRST116') {
      return res.status(404).json({ error: 'Customer tidak ditemukan' });
    }
    return res.status(500).json({ error: err.message });
  }
};

// Menghapus data customer berdasarkan ID
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCustomer = await customerModel.deleteCustomer(id);

    if (!deletedCustomer) {
      return res.status(404).json({ error: 'Customer tidak ditemukan' });
    }

    return res.status(200).json({ message: 'Customer berhasil dihapus', data: deletedCustomer });
  } catch (err) {
    if (err.code === 'PGRST116') {
      return res.status(404).json({ error: 'Customer tidak ditemukan' });
    }
    return res.status(500).json({ error: err.message });
  }
};


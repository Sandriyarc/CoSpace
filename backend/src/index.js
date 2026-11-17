import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import roomRoutes from './routes/roomRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

// Memuat variabel lingkungan dari file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS diletakkan sebelum express.json()
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ message: 'CoSpace API is running' });
});

// Routing API dengan prefix /api
app.use('/api/rooms', roomRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/bookings', bookingRoutes);

// Handler untuk endpoint yang tidak ditemukan (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

// Menjalankan server lokal
app.listen(PORT, () => {
  console.log(`Server CoSpace berjalan di http://localhost:${PORT}`);
});

// Export default app untuk kompatibilitas deployment Vercel Serverless
export default app;


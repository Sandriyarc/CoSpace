import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Memuat konfigurasi variabel lingkungan dari .env
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'placeholder-key';

// Inisialisasi client Supabase
export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

export default supabase;


import { createClient } from '@supabase/supabase-js';

// Mengambil URL dan KEY dari variabel lingkungan menggunakan import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;https://fsraekouxepsdqpvhmyd.supabase.co
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;sb_publishable__oGq73vcMMkTFiDVQI-Jvw_384Qvugc

// Mengecek jika variabel kosong (mencegah error saat lupa mengisi .env)
if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL atau Key tidak ditemukan! Pastikan file .env sudah diisi.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
/**
 * src/services/supabase.js
 *
 * Supabase client — dibaca dari environment variables (.env)
 *
 * ⚠️  SECURITY:
 * Kredensial dibaca dari .env yang sudah masuk .gitignore.
 * Jangan pernah hardcode URL atau key di sini.
 *
 * Setup:
 * 1. Copy .env.example → .env
 * 2. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY
 * 3. Restart dev server (npm run dev)
 *
 * Behavior:
 * - URL + Key valid  → supabaseConfigured = true  → fetch dari Supabase
 * - URL atau Key kosong → supabaseConfigured = false → fallback ke mockData
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validasi — pastikan keduanya ada dan URL bukan placeholder
const isConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl !== 'https://your-project-ref.supabase.co'
);

// Hanya buat client kalau kredensial valid
// Kalau tidak → null, hook akan fallback ke mockData
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const supabaseConfigured = isConfigured;

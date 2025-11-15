// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_AUTH_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_AUTH_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ Faltan variables de entorno de Supabase');
}

// Exportar como named export (no default)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

console.log('✅ Supabase Client configurado');
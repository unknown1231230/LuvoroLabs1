import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error("Error: VITE_SUPABASE_URL is not defined. Please check your .env file.");
}
if (!supabaseAnonKey) {
  console.error("Error: VITE_SUPABASE_ANON_KEY is not defined. Please check your .env file.");
}

// Only create the client if both are defined to prevent runtime errors
export const supabase = createClient(supabaseUrl || 'YOUR_SUPABASE_URL_PLACEHOLDER', supabaseAnonKey || 'YOUR_SUPABASE_ANON_KEY_PLACEHOLDER');
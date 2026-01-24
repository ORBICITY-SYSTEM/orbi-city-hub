// Supabase Client for ORBICITY
// Connects to the ORBI CITY HUB Supabase project
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// HARDCODED - Supabase credentials for ORBI CITY HUB
const SUPABASE_URL = 'https://lusagtvxjtfxgfadulgv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1c2FndHZ4anRmeGdmYWR1bGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMDg2MzYsImV4cCI6MjA4Mzg4NDYzNn0.D3F6xMDNLm8a9AC6tDMsT68Ad6F6xOlhoXTxEFmtPM8';

console.log('[Supabase] Connecting to:', SUPABASE_URL);

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

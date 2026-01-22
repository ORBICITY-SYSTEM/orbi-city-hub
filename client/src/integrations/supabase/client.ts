// Supabase Client for ORBICITY
// Connects to the same database as the Lovable app (orbi-ai-nexus)
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://akxwboxrwrryroftutpd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFreHdib3hyd3JyeXJvZnR1dHBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjAzNTQsImV4cCI6MjA3NjczNjM1NH0.DWFC_kaCThY9IzCod21-DFjloV_DbPK8lUa64daZNUY";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

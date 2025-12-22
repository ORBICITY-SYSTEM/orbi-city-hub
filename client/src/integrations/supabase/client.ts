import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://akxwboxrwrryroftutpd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFreHdib3hyd3JyeXJvZnR1dHBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjAzNTQsImV4cCI6MjA3NjczNjM1NH0.DWFC_kaCThY9IzCod21-DFjloV_DbPK8lUa64daZNUY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

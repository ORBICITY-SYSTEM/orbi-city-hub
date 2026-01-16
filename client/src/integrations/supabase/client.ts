// Supabase Client for Instagram Analytics (Lovable approach)
import { createClient } from '@supabase/supabase-js';
import { env } from "@/config/env";

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

type SupabaseError = { message: string };

const createMockQuery = (error: SupabaseError) => {
  const query: any = {
    select: () => query,
    order: () => query,
    gte: () => query,
    lte: () => query,
    limit: () => query,
    maybeSingle: async () => ({ data: null, error }),
    then: (resolve: any) => resolve({ data: [], error }),
  };
  return query;
};

const createMockSupabaseClient = () => {
  const error = { message: 'Supabase is not configured' };
  return {
    from: () => createMockQuery(error),
    functions: {
      invoke: async () => ({ data: null, error }),
    },
  } as any;
};

// Create Supabase client (like Lovable harmony)
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : createMockSupabaseClient();

// Type export for compatibility
export type SupabaseClient = ReturnType<typeof createClient>;

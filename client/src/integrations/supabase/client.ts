// Stub Supabase client for compatibility with Lovable components
// Will be replaced with tRPC calls

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
  },
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => ({ data: null, error: null }),
        limit: (n: number) => ({
          then: async (resolve: any) => resolve({ data: [], error: null }),
        }),
        then: async (resolve: any) => resolve({ data: [], error: null }),
      }),
      order: (column: string, options?: any) => ({
        then: async (resolve: any) => resolve({ data: [], error: null }),
      }),
      limit: (n: number) => ({
        then: async (resolve: any) => resolve({ data: [], error: null }),
      }),
      then: async (resolve: any) => resolve({ data: [], error: null }),
    }),
    insert: (values: any) => ({
      select: () => ({
        single: async () => ({ data: null, error: null }),
        then: async (resolve: any) => resolve({ data: null, error: null }),
      }),
      then: async (resolve: any) => resolve({ data: null, error: null }),
    }),
    update: (values: any) => ({
      eq: (column: string, value: any) => ({
        select: () => ({
          single: async () => ({ data: null, error: null }),
        }),
        then: async (resolve: any) => resolve({ data: null, error: null }),
      }),
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({
        then: async (resolve: any) => resolve({ data: null, error: null }),
      }),
    }),
  }),
  channel: (name: string) => ({
    on: (event: string, options: any, callback: any) => ({
      subscribe: () => ({}),
    }),
  }),
};

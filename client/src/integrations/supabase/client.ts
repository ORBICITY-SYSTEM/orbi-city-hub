/**
 * DEPRECATED: Supabase Client Stub
 * 
 * This is a compatibility stub for the legacy Supabase integration.
 * All Supabase functionality has been deprecated in favor of Google Sheets.
 * 
 * This stub provides a mock client that:
 * 1. Logs deprecation warnings
 * 2. Returns empty/mock data to prevent crashes
 * 3. Maintains type compatibility with existing code
 * 
 * @deprecated Use Google Sheets via AppScript instead
 * @see ARCHITECTURE.md for the new data flow
 */

// Mock Supabase client that logs warnings and returns empty data
const createMockClient = () => {
  const logDeprecation = (method: string) => {
    console.warn(
      `[DEPRECATED] Supabase.${method}() called. ` +
      `PowerStack uses Google Sheets as the database. ` +
      `See ARCHITECTURE.md for migration guide.`
    );
  };

  // Mock query builder
  const createQueryBuilder = () => ({
    select: () => createQueryBuilder(),
    insert: () => createQueryBuilder(),
    update: () => createQueryBuilder(),
    delete: () => createQueryBuilder(),
    eq: () => createQueryBuilder(),
    neq: () => createQueryBuilder(),
    gt: () => createQueryBuilder(),
    gte: () => createQueryBuilder(),
    lt: () => createQueryBuilder(),
    lte: () => createQueryBuilder(),
    like: () => createQueryBuilder(),
    ilike: () => createQueryBuilder(),
    is: () => createQueryBuilder(),
    in: () => createQueryBuilder(),
    contains: () => createQueryBuilder(),
    order: () => createQueryBuilder(),
    limit: () => createQueryBuilder(),
    range: () => createQueryBuilder(),
    single: () => createQueryBuilder(),
    maybeSingle: () => createQueryBuilder(),
    then: (resolve: any) => {
      logDeprecation('query');
      resolve({ data: [], error: null });
      return Promise.resolve({ data: [], error: null });
    },
  });

  // Mock auth
  const mockAuth = {
    getUser: async () => {
      logDeprecation('auth.getUser');
      return { 
        data: { 
          user: { 
            id: 'mock-user-id', 
            email: 'demo@orbicity.com',
            user_metadata: { name: 'Demo User' }
          } 
        }, 
        error: null 
      };
    },
    getSession: async () => {
      logDeprecation('auth.getSession');
      return { 
        data: { 
          session: { 
            user: { id: 'mock-user-id', email: 'demo@orbicity.com' },
            access_token: 'mock-token'
          } 
        }, 
        error: null 
      };
    },
    signInWithOAuth: async () => {
      logDeprecation('auth.signInWithOAuth');
      return { data: { url: null, provider: null }, error: null };
    },
    signOut: async () => {
      logDeprecation('auth.signOut');
      return { error: null };
    },
    onAuthStateChange: (callback: any) => {
      logDeprecation('auth.onAuthStateChange');
      // Call with mock session immediately
      setTimeout(() => {
        callback('SIGNED_IN', { 
          user: { id: 'mock-user-id', email: 'demo@orbicity.com' }
        });
      }, 100);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
  };

  // Mock functions
  const mockFunctions = {
    invoke: async (functionName: string, options?: any) => {
      logDeprecation(`functions.invoke(${functionName})`);
      return { data: null, error: null };
    },
  };

  // Mock storage
  const mockStorage = {
    from: (bucket: string) => ({
      upload: async () => {
        logDeprecation(`storage.from(${bucket}).upload`);
        return { data: null, error: null };
      },
      download: async () => {
        logDeprecation(`storage.from(${bucket}).download`);
        return { data: null, error: null };
      },
      getPublicUrl: () => {
        logDeprecation(`storage.from(${bucket}).getPublicUrl`);
        return { data: { publicUrl: '' } };
      },
      remove: async () => {
        logDeprecation(`storage.from(${bucket}).remove`);
        return { data: null, error: null };
      },
      list: async () => {
        logDeprecation(`storage.from(${bucket}).list`);
        return { data: [], error: null };
      },
    }),
  };

  return {
    from: (table: string) => {
      logDeprecation(`from(${table})`);
      return createQueryBuilder();
    },
    auth: mockAuth,
    functions: mockFunctions,
    storage: mockStorage,
    rpc: async (fn: string, params?: any) => {
      logDeprecation(`rpc(${fn})`);
      return { data: null, error: null };
    },
  };
};

// Export the mock client
export const supabase = createMockClient();

// Type export for compatibility
export type SupabaseClient = ReturnType<typeof createMockClient>;

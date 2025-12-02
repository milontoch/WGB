import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Admin client with service role key
// ⚠️ ONLY use this in server-side code (API routes, Server Actions, Server Components)
// This bypasses Row Level Security (RLS) - use with caution!

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Create a chainable dummy query builder for build time
const createDummyQueryBuilder = (): any => {
  const builder = {
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    delete: () => builder,
    eq: () => builder,
    neq: () => builder,
    gt: () => builder,
    gte: () => builder,
    lt: () => builder,
    lte: () => builder,
    like: () => builder,
    ilike: () => builder,
    is: () => builder,
    in: () => builder,
    contains: () => builder,
    containedBy: () => builder,
    rangeGt: () => builder,
    rangeGte: () => builder,
    rangeLt: () => builder,
    rangeLte: () => builder,
    rangeAdjacent: () => builder,
    overlaps: () => builder,
    textSearch: () => builder,
    match: () => builder,
    not: () => builder,
    or: () => builder,
    filter: () => builder,
    order: () => builder,
    limit: () => builder,
    range: () => builder,
    single: () => Promise.resolve({ data: null, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: any) => resolve({ data: null, error: null }),
    catch: () => Promise.resolve({ data: null, error: null }),
  };
  return builder;
};

// Create a dummy client for build time
const createDummyClient = () => ({
  from: () => createDummyQueryBuilder(),
  auth: {
    admin: {
      getUserById: () => Promise.resolve({ data: null, error: null }),
      listUsers: () => Promise.resolve({ data: null, error: null }),
      createUser: () => Promise.resolve({ data: null, error: null }),
      deleteUser: () => Promise.resolve({ data: null, error: null }),
      updateUserById: () => Promise.resolve({ data: null, error: null }),
    },
    getUser: () => Promise.resolve({ data: null, error: null }),
    getSession: () => Promise.resolve({ data: null, error: null }),
  },
  rpc: () => Promise.resolve({ data: null, error: null }),
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: null }),
      download: () => Promise.resolve({ data: null, error: null }),
      list: () => Promise.resolve({ data: null, error: null }),
      remove: () => Promise.resolve({ data: null, error: null }),
    }),
  },
});

export const supabaseAdmin = 
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : (createDummyClient() as any as SupabaseClient);

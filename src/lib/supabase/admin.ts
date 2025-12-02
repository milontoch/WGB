import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Admin client with service role key
// ⚠️ ONLY use this in server-side code (API routes, Server Actions, Server Components)
// This bypasses Row Level Security (RLS) - use with caution!

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Create a dummy client for build time
const createDummyClient = () => ({
  from: () => ({
    select: () => Promise.resolve({ data: null, error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
  }),
  auth: {
    admin: {
      getUserById: () => Promise.resolve({ data: null, error: null }),
    },
  },
  rpc: () => Promise.resolve({ data: null, error: null }),
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

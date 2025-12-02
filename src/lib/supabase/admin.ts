import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Admin client with service role key
// ⚠️ ONLY use this in server-side code (API routes, Server Actions, Server Components)
// This bypasses Row Level Security (RLS) - use with caution!

let adminClient: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) {
    return adminClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment."
    );
  }

  adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient];
  },
});

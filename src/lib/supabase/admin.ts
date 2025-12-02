import { createClient } from "@supabase/supabase-js";

// Admin client with service role key
// ⚠️ ONLY use this in server-side code (API routes, Server Actions, Server Components)
// This bypasses Row Level Security (RLS) - use with caution!

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

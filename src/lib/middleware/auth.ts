/**
 * Authentication Middleware for API Routes
 * Provides reusable authentication helpers
 */

import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export interface AuthResult {
  authenticated: boolean;
  user: {
    id: string;
    email: string;
  } | null;
  error?: string;
}

/**
 * Require authentication for an API route
 * Returns user if authenticated, or null if not
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        authenticated: false,
        user: null,
        error: "Authentication required",
      };
    }

    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email || "",
      },
    };
  } catch (error) {
    console.error("Error in requireAuth:", error);
    return {
      authenticated: false,
      user: null,
      error: "Authentication error",
    };
  }
}

/**
 * Check if user has a specific role
 * @param userId - User ID from Supabase Auth
 * @param requiredRole - Role required (admin, provider, customer)
 */
export async function requireRole(
  userId: string,
  requiredRole: "admin" | "provider" | "customer"
): Promise<boolean> {
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/admin");

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error || !profile) {
      return false;
    }

    return profile.role === requiredRole;
  } catch (error) {
    console.error("Error in requireRole:", error);
    return false;
  }
}

/**
 * Get session from request cookies
 * Useful for server-side rendering
 */
export async function getSession(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return null;
    }

    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

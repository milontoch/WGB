// Authentication helper functions for Supabase Auth
import { createClient } from "@/lib/supabase/client";
import { createClient as createServerClient } from "@/lib/supabase/server";

export type UserRole = "admin" | "provider" | "customer";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile | null;
}

// Client-side auth functions
export const authClient = {
  // Sign up with email and password
  async signUp(
    email: string,
    password: string,
    fullName: string,
    role: UserRole = "customer"
  ) {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Get current user with profile
  async getCurrentUser(): Promise<AuthUser | null> {
    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) return null;

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return {
        id: user.id,
        email: user.email || "",
        profile: null,
      };
    }

    return {
      id: user.id,
      email: user.email || "",
      profile: profile as UserProfile,
    };
  },

  // Update user profile
  async updateProfile(updates: Partial<Pick<UserProfile, "full_name">>) {
    const supabase = createClient();
    const user = await this.getCurrentUser();

    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Send password reset email
  async resetPassword(email: string) {
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
  },

  // Update password
  async updatePassword(newPassword: string) {
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const authUser = await this.getCurrentUser();
        callback(authUser);
      } else {
        callback(null);
      }
    });

    return subscription;
  },
};

// Server-side auth functions (for Server Components and API routes)
export const authServer = {
  // Get current user on server
  async getCurrentUser(): Promise<AuthUser | null> {
    const supabase = await createServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) return null;

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return {
        id: user.id,
        email: user.email || "",
        profile: null,
      };
    }

    return {
      id: user.id,
      email: user.email || "",
      profile: profile as UserProfile,
    };
  },

  // Check if user is admin
  async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.profile?.role === "admin";
  },

  // Require authentication (throws error if not authenticated)
  async requireAuth(): Promise<AuthUser> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error("Authentication required");
    }
    return user;
  },

  // Require admin role (throws error if not admin)
  async requireAdmin(): Promise<AuthUser> {
    const user = await this.requireAuth();
    if (user.profile?.role !== "admin") {
      throw new Error("Admin access required");
    }
    return user;
  },
};

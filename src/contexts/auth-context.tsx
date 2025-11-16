"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient, type AuthUser, type UserRole } from "@/lib/supabase/auth";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role?: UserRole
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isProvider: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check active session on mount
    authClient.getCurrentUser().then((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Listen for auth changes
    const subscription = authClient.onAuthStateChange((user) => {
      setUser(user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = "customer"
  ) => {
    try {
      await authClient.signUp(email, password, fullName, role);
      // User will receive confirmation email
      // After confirmation, they can sign in
      router.push(
        "/auth/login?message=Check your email to confirm your account"
      );
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user: authUser } = await authClient.signIn(email, password);
      const currentUser = await authClient.getCurrentUser();
      setUser(currentUser);

      // Redirect based on role
      if (currentUser?.profile?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      router.push("/");
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authClient.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
    }
  };

  const isAdmin = user?.profile?.role === "admin";
  const isProvider = user?.profile?.role === "provider";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        refreshUser,
        isAdmin,
        isProvider,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

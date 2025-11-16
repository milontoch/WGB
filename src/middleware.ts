import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

// Routes that require authentication (any logged-in user)
const protectedRoutes = ["/booking", "/cart", "/admin", "/provider"];

// Routes that are only for admins
const adminRoutes = ["/admin"];

// Routes that are only for providers
const providerRoutes = ["/provider"];

// Routes that should redirect to home if already authenticated
const authRoutes = ["/auth/login", "/auth/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create supabase client with cookie handling
  const { supabase, response } = createClient(request);

  // Get current user session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // ====================================================
  // 1. REDIRECT AUTHENTICATED USERS FROM AUTH PAGES
  // ====================================================
  if (session && authRoutes.some((route) => pathname.startsWith(route))) {
    // Fetch user profile to determine role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    // Redirect based on role
    if (profile?.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (profile?.role === "provider") {
      return NextResponse.redirect(new URL("/provider", request.url));
    }

    return NextResponse.redirect(new URL("/", request.url));
  }

  // ====================================================
  // 2. PROTECT ROUTES REQUIRING AUTHENTICATION
  // ====================================================
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !session) {
    // Redirect to login with return URL
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // ====================================================
  // 3. PROTECT ADMIN-ONLY ROUTES
  // ====================================================
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if (isAdminRoute && session) {
    // Check user role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "admin") {
      // Not an admin, redirect to home with error message
      const redirectUrl = new URL("/", request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // ====================================================
  // 4. PROTECT PROVIDER-ONLY ROUTES
  // ====================================================
  const isProviderRoute = providerRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProviderRoute && session) {
    // Check user role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    // Allow both providers and admins to access provider routes
    if (profile?.role !== "provider" && profile?.role !== "admin") {
      // Not a provider or admin, redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

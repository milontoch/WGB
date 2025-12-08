"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut, loading, isAdmin } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  // Fetch cart count when user changes and on cart updates
  useEffect(() => {
    let active = true;

    async function fetchCount() {
      try {
        if (!user) {
          if (active) setCartCount(0);
          return;
        }
        const res = await fetch("/api/cart", { cache: "no-store" });
        if (!res.ok) {
          if (active) setCartCount(0);
          return;
        }
        const data = await res.json();
        if (active) setCartCount(typeof data.itemCount === "number" ? data.itemCount : 0);
      } catch {
        if (active) setCartCount(0);
      }
    }

    fetchCount();

    const onCartUpdated = () => fetchCount();
    if (typeof window !== "undefined") {
      window.addEventListener("cart:updated", onCartUpdated);
    }
    return () => {
      active = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("cart:updated", onCartUpdated);
      }
    };
  }, [user]);

  return (
    <nav className="fixed w-full bg-white/98 backdrop-blur-md shadow-sm z-50 border-b border-[#111111]/5">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="font-['Poppins'] text-2xl font-bold text-[#111111]">
                WGB
              </span>
              <span className="ml-2 text-sm text-[#D4B58E] font-light tracking-widest">BEAUTY</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-10">
            <Link
              href="/"
              className="text-[#111111]/70 hover:text-[#D4B58E] transition-colors text-sm font-medium tracking-wide"
            >
              HOME
            </Link>
            <Link
              href="/services"
              className="text-[#111111]/70 hover:text-[#D4B58E] transition-colors text-sm font-medium tracking-wide"
            >
              SERVICES
            </Link>
            <Link
              href="/shop"
              className="text-[#111111]/70 hover:text-[#D4B58E] transition-colors text-sm font-medium tracking-wide"
            >
              STORE
            </Link>
            <Link
              href="/booking"
              className="text-[#111111]/70 hover:text-[#D4B58E] transition-colors text-sm font-medium tracking-wide"
            >
              BOOKING
            </Link>
            {user && (
              <Link
                href="/orders"
                className="text-[#111111]/70 hover:text-[#D4B58E] transition-colors text-sm font-medium tracking-wide"
              >
                ORDERS
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="text-[#111111]/70 hover:text-[#D4B58E] transition-colors text-sm font-medium tracking-wide"
              >
                ADMIN
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 text-[#111111]/70 hover:text-[#D4B58E] transition-colors"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-[#D4B58E] rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth Buttons */}
            {!loading && (
              <>
                {user ? (
                  <div className="hidden lg:flex items-center space-x-4">
                    <span className="text-sm text-[#111111]/60 font-light">
                      {user.profile?.full_name || user.email}
                    </span>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="px-4 py-2 bg-[#111111] text-white text-sm font-medium rounded-full hover:bg-[#D4B58E] hover:text-[#111111] transition-all"
                      >
                        ADMIN
                      </Link>
                    )}
                    <button
                      onClick={signOut}
                      className="px-6 py-2.5 border border-[#111111]/20 text-sm font-medium rounded-full text-[#111111]/70 bg-white hover:border-red-500 hover:text-red-500 transition-all"
                    >
                      LOGOUT
                    </button>
                  </div>
                ) : (
                  <div className="hidden lg:flex items-center space-x-3">
                    <Link
                      href="/auth/login"
                      className="px-6 py-2.5 border border-[#111111]/20 text-sm font-medium rounded-full text-[#111111]/70 bg-white hover:border-[#D4B58E] hover:text-[#D4B58E] transition-all"
                    >
                      SIGN IN
                    </Link>
                    <Link
                      href="/auth/register"
                      className="px-6 py-2.5 bg-[#D4B58E] text-white text-sm font-medium rounded-full hover:bg-[#C4A57E] transition-all shadow-md hover:shadow-lg"
                    >
                      SIGN UP
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-[#111111]/70 hover:text-[#D4B58E] hover:bg-[#FAF7F2]"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-6 border-t border-[#111111]/5 bg-white">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-[#111111]/70 hover:text-[#D4B58E] transition-colors px-2 py-2 text-sm font-medium tracking-wide"
                onClick={() => setMobileMenuOpen(false)}
              >
                HOME
              </Link>
              <Link
                href="/services"
                className="text-[#111111]/70 hover:text-[#D4B58E] transition-colors px-2 py-2 text-sm font-medium tracking-wide"
                onClick={() => setMobileMenuOpen(false)}
              >
                SERVICES
              </Link>
              <Link
                href="/shop"
                className="text-[#111111]/70 hover:text-[#D4B58E] transition-colors px-2 py-2 text-sm font-medium tracking-wide"
                onClick={() => setMobileMenuOpen(false)}
              >
                STORE
              </Link>
              <Link
                href="/booking"
                className="text-[#111111]/70 hover:text-[#D4B58E] transition-colors px-2 py-2 text-sm font-medium tracking-wide"
                onClick={() => setMobileMenuOpen(false)}
              >
                BOOKING
              </Link>
              {user && (
                <Link
                  href="/orders"
                  className="text-[#111111]/70 hover:text-[#D4B58E] transition-colors px-2 py-2 text-sm font-medium tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ORDERS
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-[#111111]/70 hover:text-[#D4B58E] transition-colors px-2 py-2 text-sm font-medium tracking-wide"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ADMIN
                </Link>
              )}

              {/* Mobile Auth Buttons */}
              {!loading && (
                <>
                  {user ? (
                    <>
                      <div className="px-2 py-3 text-sm text-[#111111]/60 border-t border-[#111111]/5 pt-6 font-light">
                        {user.profile?.full_name || user.email}
                      </div>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="block w-full text-center px-6 py-3 bg-[#111111] text-white text-sm font-medium rounded-full hover:bg-[#D4B58E] hover:text-[#111111] transition-all mb-3"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          ADMIN PANEL
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          signOut();
                          setMobileMenuOpen(false);
                        }}
                        className="block w-full text-center px-6 py-3 border border-red-500 text-red-500 text-sm font-medium rounded-full hover:bg-red-500 hover:text-white transition-all"
                      >
                        LOGOUT
                      </button>
                    </>
                  ) : (
                    <div className="space-y-3 pt-4 border-t border-[#111111]/5">
                      <Link
                        href="/auth/login"
                        className="block w-full text-center px-6 py-3 border border-[#111111]/20 text-sm font-medium rounded-full text-[#111111]/70 bg-white hover:border-[#D4B58E] hover:text-[#D4B58E] transition-all"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        SIGN IN
                      </Link>
                      <Link
                        href="/auth/register"
                        className="block w-full text-center px-6 py-3 bg-[#D4B58E] text-white text-sm font-medium rounded-full hover:bg-[#C4A57E] transition-all shadow-md"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        SIGN UP
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut, loading, isAdmin } = useAuth();

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-primary">
              Beauty<span className="text-gray-900">Co</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/services"
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Services
            </Link>
            <Link
              href="/shop"
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Shop
            </Link>
            <Link
              href="/booking"
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Booking
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-gray-700 hover:text-primary transition-colors"
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-primary transition-colors"
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
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-primary rounded-full">
                0
              </span>
            </Link>

            {/* Auth Buttons */}
            {!loading && (
              <>
                {user ? (
                  <div className="hidden md:flex items-center space-x-4">
                    <span className="text-sm text-gray-700">
                      {user.profile?.full_name || user.email}
                    </span>
                    <button
                      onClick={signOut}
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center space-x-2">
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100"
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
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                href="/services"
                className="text-gray-700 hover:text-primary transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/shop"
                className="text-gray-700 hover:text-primary transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                href="/booking"
                className="text-gray-700 hover:text-primary transition-colors px-2 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Booking
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-gray-700 hover:text-primary transition-colors px-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              )}

              {/* Mobile Auth Buttons */}
              {!loading && (
                <>
                  {user ? (
                    <>
                      <div className="px-2 py-2 text-sm text-gray-700 border-t border-gray-200 pt-4">
                        {user.profile?.full_name || user.email}
                      </div>
                      <button
                        onClick={() => {
                          signOut();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-2 py-2 text-gray-700 hover:text-primary transition-colors"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="px-2 py-2 text-gray-700 hover:text-primary transition-colors border-t border-gray-200 pt-4"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/auth/register"
                        className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </>
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

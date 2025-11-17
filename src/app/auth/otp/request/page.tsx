"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { Container } from "@/components/container";

export default function RequestOtpPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [purpose, setPurpose] = useState<
    "login" | "verify_email" | "reset_password"
  >("login");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState("");

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setDevCode("");

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId || user?.id,
          purpose,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setMessage(data.message || "OTP sent successfully!");

      // Show dev code in development mode
      if (data.dev_code) {
        setDevCode(data.dev_code);
      }
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12">
      <Container>
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Request OTP
            </h1>
            <p className="text-gray-600">
              Get a verification code sent to your email
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleRequest} className="space-y-6">
              {/* Success Message */}
              {message && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">{message}</p>
                  {devCode && (
                    <p className="text-sm text-green-800 mt-2 font-mono">
                      <strong>Dev Code:</strong> {devCode}
                    </p>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* User ID (optional if logged in) */}
              {!user && (
                <div>
                  <label
                    htmlFor="userId"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    User ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="userId"
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required={!user}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your user ID"
                    disabled={loading}
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="you@example.com"
                  disabled={loading}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Optional - for email notification
                </p>
              </div>

              {/* Purpose */}
              <div>
                <label
                  htmlFor="purpose"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Purpose <span className="text-red-500">*</span>
                </label>
                <select
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value as any)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                >
                  <option value="login">Login Verification</option>
                  <option value="verify_email">Email Verification</option>
                  <option value="reset_password">Password Reset</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center space-y-2">
              <Link
                href="/auth/otp/verify"
                className="block text-primary hover:text-primary/80 font-medium"
              >
                Already have a code? Verify it here
              </Link>
              <Link
                href="/auth/login"
                className="block text-gray-600 hover:text-gray-900"
              >
                Back to login
              </Link>
            </div>
          </div>

          {/* Info */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              OTP codes expire in 10 minutes. Check your email for the code.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/container";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [code, setCode] = useState("");
  const [purpose, setPurpose] = useState<
    "login" | "verify_email" | "reset_password"
  >("login");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, purpose, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setMessage(data.message || "OTP verified successfully!");

      // Redirect based on purpose
      setTimeout(() => {
        if (purpose === "login") {
          router.push("/auth/login?message=OTP verified. Please sign in.");
        } else if (purpose === "verify_email") {
          router.push(
            "/auth/login?message=Email verified. You can now sign in."
          );
        } else if (purpose === "reset_password") {
          router.push("/auth/reset-password?verified=true");
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Invalid or expired code");
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
              Verify OTP
            </h1>
            <p className="text-gray-600">
              Enter the verification code sent to your email
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleVerify} className="space-y-6">
              {/* Success Message */}
              {message && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">{message}</p>
                  <p className="text-sm text-green-600 mt-1">Redirecting...</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* User ID */}
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
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your user ID"
                  disabled={loading}
                />
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

              {/* OTP Code */}
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Verification Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  disabled={loading}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter the 6-digit code
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center space-y-2">
              <Link
                href="/auth/otp/request"
                className="block text-primary hover:text-primary/80 font-medium"
              >
                Resend verification code
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
              Didn&apos;t receive a code? Check your spam folder or request a
              new one.
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}

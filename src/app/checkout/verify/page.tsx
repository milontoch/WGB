/**
 * Payment Verification Page
 * Verifies Paystack payment and creates order
 */

"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/container";
import { LoadingSpinner } from "@/components/ui/loading";

function VerifyPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [message, setMessage] = useState("Verifying your payment...");
  const [orderId, setOrderId] = useState<string | null>(null);

  const verifyPayment = useCallback(async () => {
    try {
      const res = await fetch(`/api/payment/verify?reference=${reference}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.details || "Payment verification failed");
      }

      setStatus("success");
      setMessage("Payment successful! Your order has been confirmed.");
      setOrderId(data.order.id);

      // Redirect to orders after 3 seconds
      setTimeout(() => {
        router.push("/orders");
      }, 3000);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }, [reference, router]);

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      setMessage("Payment reference not found");
      return;
    }
    verifyPayment();
  }, [reference, verifyPayment]);

  return (
    <div className="pt-16 bg-gray-50 min-h-screen">
      <Container>
        <div className="py-16">
          <div className="max-w-md mx-auto bg-white rounded-xl p-8 shadow-lg text-center">
            {status === "verifying" && (
              <>
                <LoadingSpinner />
                <h2 className="font-serif text-2xl text-gray-900 mt-6 mb-2">
                  Verifying Payment
                </h2>
                <p className="text-gray-600">{message}</p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="font-serif text-3xl text-gray-900 mb-3">
                  Payment Successful!
                </h2>
                <p className="text-gray-600 mb-6">{message}</p>
                {orderId && (
                  <p className="text-sm text-gray-500 mb-6">
                    Order ID: {orderId}
                  </p>
                )}
                <button
                  onClick={() => router.push("/orders")}
                  className="px-8 py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors"
                >
                  View Orders
                </button>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="font-serif text-3xl text-gray-900 mb-3">
                  Payment Failed
                </h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push("/cart")}
                    className="w-full px-8 py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition-colors"
                  >
                    Return to Cart
                  </button>
                  <button
                    onClick={() => router.push("/shop")}
                    className="w-full px-8 py-3 border-2 border-pink-600 text-pink-600 rounded-xl font-semibold hover:bg-pink-50 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

export default function VerifyPaymentPage() {
  return (
    <Suspense fallback={
      <div className="pt-16 bg-gray-50 min-h-screen">
        <Container>
          <div className="py-16">
            <div className="max-w-md mx-auto bg-white rounded-xl p-8 shadow-lg text-center">
              <LoadingSpinner />
              <h2 className="font-serif text-2xl text-gray-900 mt-6 mb-2">
                Loading...
              </h2>
            </div>
          </div>
        </Container>
      </div>
    }>
      <VerifyPaymentContent />
    </Suspense>
  );
}

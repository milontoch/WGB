/**
 * Paystack Payment Service
 * Initialize and verify payments via Paystack API
 * Using Paystack TEST mode for development
 */

// Paystack TEST API Key - For production, use environment variable
const PAYSTACK_SECRET_KEY =
  process.env.PAYSTACK_SECRET_KEY ||
  "sk_test_960b5c3231a50fcf197a199715bc39bff47ddb0a";
const PAYSTACK_BASE_URL = "https://api.paystack.co";

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: "success" | "failed";
    reference: string;
    amount: number;
    customer: {
      email: string;
    };
    metadata: any;
  };
}

/**
 * Initialize Paystack payment
 */
export async function initializePayment(
  email: string,
  amount: number, // in naira (will be converted to kobo)
  metadata: any = {}
): Promise<PaystackInitializeResponse> {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("Paystack secret key not configured");
  }

  const amountInKobo = Math.round(amount * 100); // Convert to kobo

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amountInKobo,
      metadata,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/verify`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to initialize payment");
  }

  return response.json();
}

/**
 * Verify Paystack payment
 */
export async function verifyPayment(
  reference: string
): Promise<PaystackVerifyResponse> {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("Paystack secret key not configured");
  }

  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to verify payment");
  }

  return response.json();
}

/**
 * Get payment amount in Naira (convert from kobo)
 */
export function convertKoboToNaira(kobo: number): number {
  return kobo / 100;
}

/**
 * Format amount for display
 */
export function formatAmount(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Paystack Payment Service
 * Initialize and verify payments via Paystack API
 * Using Paystack TEST mode for development
 */

// Paystack TEST API Key - For production, use environment variable
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
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
    console.error('Paystack initialization error:', error);
    throw new Error(error.message || 'Failed to initialize payment. Please check your Paystack API key.');
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

  console.log('Verifying payment with Paystack API:', reference);
  console.log('Using secret key:', PAYSTACK_SECRET_KEY?.substring(0, 15) + '...');

  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  const responseData = await response.json();
  
  console.log('Paystack API response status:', response.status);
  console.log('Paystack API response:', JSON.stringify(responseData, null, 2));

  if (!response.ok) {
    console.error('Paystack API error:', responseData);
    throw new Error(responseData.message || "Failed to verify payment");
  }

  return responseData;
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

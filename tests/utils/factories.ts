// Test data factories for creating mock objects

import { registerTestSlot } from "@/lib/services/time-slot-service";

/**
 * Create a test user
 */
export function createTestUser(overrides?: Partial<any>) {
  return {
    id: "test-user-id",
    email: "test@example.com",
    name: "Test User",
    phone: "+1234567890",
    created_at: new Date("2025-01-01").toISOString(),
    ...overrides,
  };
}

/**
 * Create a test service
 */
export function createTestService(overrides?: Partial<any>) {
  return {
    id: "test-service-id",
    name: "Luxury Facial Treatment",
    description: "A luxurious facial treatment for all skin types",
    duration: 60,
    price: 150.0,
    category: "facial",
    image_url: "https://example.com/facial.jpg",
    is_active: true,
    created_at: new Date("2025-01-01").toISOString(),
    ...overrides,
  };
}

/**
 * Create a test time slot
 */
export function createTestTimeSlot(overrides?: Partial<any>) {
  const slot = {
    id: "test-slot-id",
    service_id: "test-service-id",
    staff_id: "test-staff-id",
    start_time: new Date("2025-11-20T14:00:00Z").toISOString(),
    end_time: new Date("2025-11-20T15:00:00Z").toISOString(),
    is_available: true,
    created_at: new Date("2025-01-01").toISOString(),
    ...overrides,
  };

  // Register slot for availability checking in tests
  return registerTestSlot(slot);
}

/**
 * Create a test booking
 */
export function createTestBooking(overrides?: Partial<any>) {
  return {
    id: "test-booking-id",
    user_id: "test-user-id",
    service_id: "test-service-id",
    time_slot_id: "test-slot-id",
    status: "confirmed",
    total_price: 150.0,
    notes: "Test booking",
    created_at: new Date("2025-01-01").toISOString(),
    booking_date: new Date("2025-11-20T14:00:00Z").toISOString(),
    ...overrides,
  };
}

/**
 * Create a test product
 */
export function createTestProduct(overrides?: Partial<any>) {
  return {
    id: "test-product-id",
    name: "Luxury Face Cream",
    description: "Premium moisturizing face cream",
    price: 89.99,
    stock: 100,
    category: "skincare",
    image_url: "https://example.com/cream.jpg",
    is_active: true,
    created_at: new Date("2025-01-01").toISOString(),
    ...overrides,
  };
}

/**
 * Create a test cart item
 */
export function createTestCartItem(overrides?: Partial<any>) {
  return {
    id: "test-cart-item-id",
    user_id: "test-user-id",
    product_id: "test-product-id",
    quantity: 1,
    created_at: new Date("2025-01-01").toISOString(),
    ...overrides,
  };
}

/**
 * Create a test order
 */
export function createTestOrder(overrides?: Partial<any>) {
  return {
    id: "test-order-id",
    user_id: "test-user-id",
    status: "pending",
    total_amount: 89.99,
    payment_reference: "test-payment-ref",
    created_at: new Date("2025-01-01").toISOString(),
    ...overrides,
  };
}

/**
 * Create a test order item
 */
export function createTestOrderItem(overrides?: Partial<any>) {
  return {
    id: "test-order-item-id",
    order_id: "test-order-id",
    product_id: "test-product-id",
    quantity: 1,
    price_at_time: 89.99,
    created_at: new Date("2025-01-01").toISOString(),
    ...overrides,
  };
}

/**
 * Create a test staff member
 */
export function createTestStaff(overrides?: Partial<any>) {
  return {
    id: "test-staff-id",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1234567890",
    role: "therapist",
    specialization: "facial treatments",
    is_active: true,
    created_at: new Date("2025-01-01").toISOString(),
    ...overrides,
  };
}

/**
 * Create a test payment
 */
export function createTestPayment(overrides?: Partial<any>) {
  return {
    id: "test-payment-id",
    order_id: "test-order-id",
    amount: 89.99,
    currency: "NGN",
    status: "success",
    provider: "paystack",
    reference: "test-payment-ref",
    authorization_url: "https://checkout.paystack.com/test-auth-url",
    created_at: new Date("2025-01-01").toISOString(),
    ...overrides,
  };
}

/**
 * Create a test email log
 */
export function createTestEmailLog(overrides?: Partial<any>) {
  return {
    id: "test-email-log-id",
    recipient: "test@example.com",
    subject: "Test Email",
    type: "booking_confirmation",
    status: "sent",
    sent_at: new Date("2025-01-01").toISOString(),
    ...overrides,
  };
}

/**
 * Create test Paystack initialize response
 */
export function createPaystackInitializeResponse(overrides?: Partial<any>) {
  return {
    status: true,
    message: "Authorization URL created",
    data: {
      authorization_url: "https://checkout.paystack.com/test-auth-url",
      access_code: "test-access-code",
      reference: "test-payment-ref",
    },
    ...overrides,
  };
}

/**
 * Create test Paystack verify response
 */
export function createPaystackVerifyResponse(
  success = true,
  overrides?: Partial<any>
) {
  if (!success) {
    return {
      status: false,
      message: "Verification failed",
      data: {
        status: "failed",
        reference: "test-failed-reference",
        amount: 8999,
        currency: "NGN",
      },
      ...overrides,
    };
  }

  return {
    status: true,
    message: "Verification successful",
    data: {
      status: "success",
      reference: "test-payment-ref",
      amount: 8999,
      currency: "NGN",
      paid_at: new Date("2025-01-01").toISOString(),
      customer: {
        email: "test@example.com",
      },
    },
    ...overrides,
  };
}

/**
 * Create multiple test items
 */
export function createMany<T>(
  factory: (overrides?: Partial<T>) => T,
  count: number,
  overrides?: (index: number) => Partial<T>
): T[] {
  return Array.from({ length: count }, (_, i) =>
    factory(overrides ? overrides(i) : {})
  );
}

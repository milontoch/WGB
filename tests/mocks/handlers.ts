// Mock Service Worker handlers for API mocking
import { http, HttpResponse } from "msw";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://test.supabase.co";
const PAYSTACK_BASE_URL = "https://api.paystack.co";

export const handlers = [
  // ============================================
  // SUPABASE MOCKS
  // ============================================

  // Mock Supabase Auth
  http.post(`${SUPABASE_URL}/auth/v1/token`, () => {
    return HttpResponse.json({
      access_token: "mock-access-token",
      token_type: "bearer",
      expires_in: 3600,
      refresh_token: "mock-refresh-token",
      user: {
        id: "test-user-id",
        email: "test@example.com",
        role: "authenticated",
      },
    });
  }),

  // Mock Supabase select queries
  http.get(`${SUPABASE_URL}/rest/v1/bookings`, () => {
    return HttpResponse.json([
      {
        id: "booking-1",
        user_id: "test-user-id",
        service_id: "service-1",
        booking_date: "2025-11-21",
        booking_time: "10:00",
        status: "confirmed",
      },
    ]);
  }),

  http.get(`${SUPABASE_URL}/rest/v1/services`, () => {
    return HttpResponse.json([
      {
        id: "service-1",
        name: "Haircut",
        price: 5000,
        duration: 60,
        description: "Professional haircut",
      },
      {
        id: "service-2",
        name: "Manicure",
        price: 3000,
        duration: 45,
        description: "Nail care",
      },
    ]);
  }),

  http.get(`${SUPABASE_URL}/rest/v1/time_slots`, () => {
    return HttpResponse.json([
      {
        id: "slot-1",
        staff_id: "staff-1",
        day_of_week: 1,
        start_time: "09:00",
        end_time: "17:00",
        is_available: true,
      },
    ]);
  }),

  http.get(`${SUPABASE_URL}/rest/v1/products`, () => {
    return HttpResponse.json([
      {
        id: "product-1",
        name: "Face Cream",
        price: 7500,
        stock_quantity: 10,
        in_stock: true,
      },
    ]);
  }),

  // Mock Supabase inserts
  http.post(`${SUPABASE_URL}/rest/v1/bookings`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        id: "new-booking-id",
        ...body,
        created_at: "2025-11-20T10:00:00Z",
      },
      { status: 201 }
    );
  }),

  http.post(`${SUPABASE_URL}/rest/v1/orders`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        id: "new-order-id",
        ...body,
        created_at: "2025-11-20T10:00:00Z",
      },
      { status: 201 }
    );
  }),

  // Mock Supabase RPC calls
  http.post(`${SUPABASE_URL}/rest/v1/rpc/check_slot_availability`, () => {
    return HttpResponse.json({ available: true });
  }),

  // ============================================
  // PAYSTACK MOCKS
  // ============================================

  // Mock Paystack initialize transaction
  http.post(
    `${PAYSTACK_BASE_URL}/transaction/initialize`,
    async ({ request }) => {
      const body = (await request.json()) as any;
      return HttpResponse.json({
        status: true,
        message: "Authorization URL created",
        data: {
          authorization_url: "https://checkout.paystack.com/test-reference",
          access_code: "test-access-code",
          reference: body.reference || "test-reference-123",
        },
      });
    }
  ),

  // Mock Paystack verify transaction (success)
  http.get(
    `${PAYSTACK_BASE_URL}/transaction/verify/:reference`,
    ({ params }) => {
      const { reference } = params;

      // Simulate failure for specific test reference
      if (reference === "test-failed-reference") {
        return HttpResponse.json({
          status: true,
          message: "Verification successful",
          data: {
            status: "failed",
            reference,
            amount: 1500000,
            metadata: {
              user_id: "test-user-id",
              cart_items: [],
            },
          },
        });
      }

      // Default success response
      return HttpResponse.json({
        status: true,
        message: "Verification successful",
        data: {
          status: "success",
          reference,
          amount: 1500000, // 15000 in Naira * 100
          paid_at: "2025-11-20T10:00:00Z",
          metadata: {
            user_id: "test-user-id",
            customer_name: "Test User",
            customer_email: "test@example.com",
            customer_phone: "08012345678",
            shipping_address: "123 Test St",
            shipping_city: "Asaba",
            shipping_state: "Delta",
            is_pickup: false,
            cart_items: [
              {
                product_id: "product-1",
                product_name: "Face Cream",
                quantity: 2,
                unit_price: 7500,
                total_price: 15000,
              },
            ],
          },
        },
      });
    }
  ),

  // ============================================
  // EMAIL MOCKS
  // ============================================

  // Mock email sending endpoint (internal)
  http.post("/api/internal/send-email", async ({ request }) => {
    const body = await request.json();
    // Email mock utility will capture this
    return HttpResponse.json({
      success: true,
      message: "Email sent (mocked)",
    });
  }),
];

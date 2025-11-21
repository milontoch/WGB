// Pre-defined test fixtures for common test scenarios

import {
  createTestUser,
  createTestService,
  createTestTimeSlot,
  createTestBooking,
  createTestProduct,
  createTestOrder,
  createTestStaff,
} from "./factories";

/**
 * Standard test user
 */
export const testUser = createTestUser({
  id: "user-1",
  email: "john.doe@example.com",
  name: "John Doe",
  phone: "+2348012345678",
});

/**
 * Admin user
 */
export const adminUser = createTestUser({
  id: "admin-1",
  email: "admin@beautystudio.com",
  name: "Admin User",
  role: "admin",
});

/**
 * Multiple test users
 */
export const testUsers = [
  testUser,
  createTestUser({
    id: "user-2",
    email: "jane.smith@example.com",
    name: "Jane Smith",
    phone: "+2348023456789",
  }),
  createTestUser({
    id: "user-3",
    email: "bob.wilson@example.com",
    name: "Bob Wilson",
    phone: "+2348034567890",
  }),
];

/**
 * Test services
 */
export const facialService = createTestService({
  id: "service-1",
  name: "Luxury Facial Treatment",
  description: "Deep cleansing and rejuvenating facial",
  duration: 60,
  price: 150.0,
  category: "facial",
});

export const massageService = createTestService({
  id: "service-2",
  name: "Swedish Massage",
  description: "Relaxing full-body massage",
  duration: 90,
  price: 200.0,
  category: "massage",
});

export const manicureService = createTestService({
  id: "service-3",
  name: "Luxury Manicure",
  description: "Complete nail care and polish",
  duration: 45,
  price: 80.0,
  category: "nails",
});

export const testServices = [facialService, massageService, manicureService];

/**
 * Test staff members
 */
export const staff1 = createTestStaff({
  id: "staff-1",
  name: "Sarah Johnson",
  email: "sarah@beautystudio.com",
  specialization: "Facial treatments",
});

export const staff2 = createTestStaff({
  id: "staff-2",
  name: "Emily Davis",
  email: "emily@beautystudio.com",
  specialization: "Massage therapy",
});

export const testStaff = [staff1, staff2];

/**
 * Test time slots (all for 2025-11-20)
 */
export const timeSlot9am = createTestTimeSlot({
  id: "slot-1",
  service_id: facialService.id,
  staff_id: staff1.id,
  start_time: "2025-11-20T09:00:00Z",
  end_time: "2025-11-20T10:00:00Z",
  is_available: true,
});

export const timeSlot2pm = createTestTimeSlot({
  id: "slot-2",
  service_id: facialService.id,
  staff_id: staff1.id,
  start_time: "2025-11-20T14:00:00Z",
  end_time: "2025-11-20T15:00:00Z",
  is_available: true,
});

export const timeSlot4pm = createTestTimeSlot({
  id: "slot-3",
  service_id: massageService.id,
  staff_id: staff2.id,
  start_time: "2025-11-20T16:00:00Z",
  end_time: "2025-11-20T17:30:00Z",
  is_available: true,
});

export const bookedSlot = createTestTimeSlot({
  id: "slot-4",
  service_id: facialService.id,
  staff_id: staff1.id,
  start_time: "2025-11-20T11:00:00Z",
  end_time: "2025-11-20T12:00:00Z",
  is_available: false,
});

export const testTimeSlots = [
  timeSlot9am,
  timeSlot2pm,
  timeSlot4pm,
  bookedSlot,
];

/**
 * Test bookings
 */
export const confirmedBooking = createTestBooking({
  id: "booking-1",
  user_id: testUser.id,
  service_id: facialService.id,
  time_slot_id: timeSlot2pm.id,
  status: "confirmed",
  total_price: 150.0,
  booking_date: "2025-11-20T14:00:00Z",
});

export const pendingBooking = createTestBooking({
  id: "booking-2",
  user_id: testUser.id,
  service_id: massageService.id,
  time_slot_id: timeSlot4pm.id,
  status: "pending",
  total_price: 200.0,
  booking_date: "2025-11-20T16:00:00Z",
});

export const cancelledBooking = createTestBooking({
  id: "booking-3",
  user_id: testUsers[1].id,
  service_id: manicureService.id,
  time_slot_id: bookedSlot.id,
  status: "cancelled",
  total_price: 80.0,
  booking_date: "2025-11-20T11:00:00Z",
});

export const testBookings = [
  confirmedBooking,
  pendingBooking,
  cancelledBooking,
];

/**
 * Test products
 */
export const faceCream = createTestProduct({
  id: "product-1",
  name: "Luxury Face Cream",
  description: "Premium moisturizing face cream with SPF 30",
  price: 89.99,
  stock: 50,
  category: "skincare",
});

export const serum = createTestProduct({
  id: "product-2",
  name: "Vitamin C Serum",
  description: "Brightening serum with antioxidants",
  price: 69.99,
  stock: 30,
  category: "skincare",
});

export const bodyLotion = createTestProduct({
  id: "product-3",
  name: "Hydrating Body Lotion",
  description: "Rich body lotion for all skin types",
  price: 45.0,
  stock: 100,
  category: "bodycare",
});

export const lowStockProduct = createTestProduct({
  id: "product-4",
  name: "Limited Edition Oil",
  description: "Rare essential oil blend",
  price: 120.0,
  stock: 2,
  category: "oils",
});

export const outOfStockProduct = createTestProduct({
  id: "product-5",
  name: "Sold Out Mask",
  description: "Popular face mask",
  price: 35.0,
  stock: 0,
  category: "masks",
  is_active: false,
});

export const testProducts = [
  faceCream,
  serum,
  bodyLotion,
  lowStockProduct,
  outOfStockProduct,
];

/**
 * Test orders
 */
export const pendingOrder = createTestOrder({
  id: "order-1",
  user_id: testUser.id,
  status: "pending",
  total_amount: 159.98,
  payment_reference: "pay-pending-001",
});

export const completedOrder = createTestOrder({
  id: "order-2",
  user_id: testUser.id,
  status: "completed",
  total_amount: 89.99,
  payment_reference: "pay-completed-001",
});

export const failedOrder = createTestOrder({
  id: "order-3",
  user_id: testUsers[1].id,
  status: "failed",
  total_amount: 69.99,
  payment_reference: "pay-failed-001",
});

export const testOrders = [pendingOrder, completedOrder, failedOrder];

/**
 * Mock API responses
 */
export const mockSupabaseAuthResponse = {
  access_token: "mock-access-token",
  token_type: "bearer",
  expires_in: 3600,
  refresh_token: "mock-refresh-token",
  user: {
    id: testUser.id,
    email: testUser.email,
    role: "authenticated",
  },
};

export const mockPaystackInitResponse = {
  status: true,
  message: "Authorization URL created",
  data: {
    authorization_url: "https://checkout.paystack.com/mock-auth-url",
    access_code: "mock-access-code",
    reference: "mock-payment-ref",
  },
};

export const mockPaystackVerifySuccessResponse = {
  status: true,
  message: "Verification successful",
  data: {
    status: "success",
    reference: "mock-payment-ref",
    amount: 8999,
    currency: "NGN",
    paid_at: "2025-01-01T12:00:00Z",
    customer: {
      email: testUser.email,
    },
  },
};

export const mockPaystackVerifyFailureResponse = {
  status: false,
  message: "Verification failed",
  data: {
    status: "failed",
    reference: "mock-failed-ref",
    amount: 8999,
    currency: "NGN",
  },
};

/**
 * Test scenarios with multiple related entities
 */
export const bookingScenario = {
  user: testUser,
  service: facialService,
  staff: staff1,
  timeSlot: timeSlot2pm,
  booking: confirmedBooking,
};

export const checkoutScenario = {
  user: testUser,
  products: [faceCream, serum],
  order: pendingOrder,
  totalAmount: 159.98,
};

export const raceConditionScenario = {
  users: [testUser, testUsers[1]],
  service: facialService,
  timeSlot: timeSlot9am,
  // Both users will try to book the same slot
};

export const stockRaceCondition = {
  users: [testUser, testUsers[1], testUsers[2]],
  product: lowStockProduct, // Only 2 in stock
  // 3 users will try to buy
};

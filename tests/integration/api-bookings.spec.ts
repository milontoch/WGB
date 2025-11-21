// Integration tests for booking API routes with race condition handling

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { POST as createBooking } from "@/app/api/bookings/route";
import { GET as getBookings } from "@/app/api/bookings/route";
import { PATCH as updateBooking } from "@/app/api/bookings/[id]/route";
import { DELETE as deleteBooking } from "@/app/api/bookings/[id]/route";
import {
  createMockRequest,
  simulateConcurrentRequests,
  extractJSON,
} from "@tests/utils/testHelpers";
import { createTestBooking, createTestTimeSlot } from "@tests/utils/factories";
import { resetEmailMock, assertEmailSent } from "@tests/utils/emailMock";

describe("Booking API Routes", () => {
  beforeEach(() => {
    resetEmailMock();
  });

  describe("POST /api/bookings - Create Booking", () => {
    it("should create a new booking", async () => {
      const bookingData = {
        service_id: "service-1",
        time_slot_id: "slot-1",
        user_id: "user-1",
        booking_date: "2025-11-20T14:00:00Z",
        notes: "First booking",
      };

      const request = createMockRequest("/api/bookings", {
        method: "POST",
        body: bookingData,
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await createBooking(request);
      const data = await extractJSON(response);

      expect(response.status).toBe(201);
      expect(data.booking).toBeDefined();
      expect(data.booking.service_id).toBe(bookingData.service_id);
      expect(data.booking.status).toBe("confirmed");
    });

    it("should send confirmation email after booking", async () => {
      const bookingData = {
        service_id: "service-1",
        time_slot_id: "slot-1",
        user_id: "user-1",
        booking_date: "2025-11-20T14:00:00Z",
      };

      const request = createMockRequest("/api/bookings", {
        method: "POST",
        body: bookingData,
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      await createBooking(request);

      // Verify confirmation email was sent
      assertEmailSent({
        subject: "Booking Confirmation",
        contentIncludes: "confirmed",
      });
    });

    it("should reject booking for unavailable slot", async () => {
      const bookingData = {
        service_id: "service-1",
        time_slot_id: "unavailable-slot",
        user_id: "user-1",
        booking_date: "2025-11-20T14:00:00Z",
      };

      const request = createMockRequest("/api/bookings", {
        method: "POST",
        body: bookingData,
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await createBooking(request);

      expect(response.status).toBe(400);
      const data = await extractJSON(response);
      expect(data.error).toContain("not available");
    });

    it("should reject booking for past date", async () => {
      const bookingData = {
        service_id: "service-1",
        time_slot_id: "slot-1",
        user_id: "user-1",
        booking_date: "2020-01-01T14:00:00Z",
      };

      const request = createMockRequest("/api/bookings", {
        method: "POST",
        body: bookingData,
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await createBooking(request);

      expect(response.status).toBe(400);
      const data = await extractJSON(response);
      expect(data.error).toContain("past");
    });

    it("should require authentication", async () => {
      const bookingData = {
        service_id: "service-1",
        time_slot_id: "slot-1",
        booking_date: "2025-11-20T14:00:00Z",
      };

      const request = createMockRequest("/api/bookings", {
        method: "POST",
        body: bookingData,
        // No auth header
      });

      const response = await createBooking(request);

      expect(response.status).toBe(401);
    });

    it("should validate required fields", async () => {
      const incompleteData = {
        service_id: "service-1",
        // Missing time_slot_id and booking_date
      };

      const request = createMockRequest("/api/bookings", {
        method: "POST",
        body: incompleteData,
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await createBooking(request);

      expect(response.status).toBe(400);
      const data = await extractJSON(response);
      expect(data.error).toBeDefined();
    });

    /**
     * RACE CONDITION TEST: Double booking prevention
     * Two users try to book the same time slot simultaneously
     */
    it("should prevent double-booking with concurrent requests", async () => {
      const bookingData = {
        service_id: "service-1",
        time_slot_id: "slot-race-test",
        booking_date: "2025-11-20T14:00:00Z",
      };

      // Create two identical requests with different user IDs
      const createRequest = (userId: string) => {
        return async () => {
          const request = createMockRequest("/api/bookings", {
            method: "POST",
            body: { ...bookingData, user_id: userId },
            headers: {
              Authorization: `Bearer mock-token-${userId}`,
            },
          });
          return createBooking(request);
        };
      };

      // Simulate concurrent booking attempts
      const results = await simulateConcurrentRequests(
        createRequest("user-1"),
        2
      );

      // Exactly one should succeed
      const successfulBookings = results.filter((r) => r.status === 201);
      const failedBookings = results.filter((r) => r.status >= 400);

      expect(successfulBookings.length).toBe(1);
      expect(failedBookings.length).toBe(1);

      // Failed booking should have clear error message
      const failedData = await extractJSON(failedBookings[0]);
      expect(failedData.error).toContain("already booked");
    });

    /**
     * RACE CONDITION TEST: Multiple concurrent bookings for different slots
     * Should all succeed if slots are different
     */
    it("should allow concurrent bookings for different slots", async () => {
      const createRequest = (slotId: string) => {
        return async () => {
          const request = createMockRequest("/api/bookings", {
            method: "POST",
            body: {
              service_id: "service-1",
              time_slot_id: slotId,
              user_id: "user-1",
              booking_date: `2025-11-20T${slotId}:00:00Z`,
            },
            headers: {
              Authorization: "Bearer mock-access-token",
            },
          });
          return createBooking(request);
        };
      };

      const results = await Promise.all([
        createRequest("14")(),
        createRequest("15")(),
        createRequest("16")(),
      ]);

      // All should succeed
      expect(results.every((r) => r.status === 201)).toBe(true);
    });
  });

  describe("GET /api/bookings - List Bookings", () => {
    it("should return user bookings", async () => {
      const request = createMockRequest("/api/bookings", {
        method: "GET",
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await getBookings(request);
      const data = await extractJSON(response);

      expect(response.status).toBe(200);
      expect(Array.isArray(data.bookings)).toBe(true);
    });

    it("should filter by status", async () => {
      const request = createMockRequest("/api/bookings", {
        method: "GET",
        searchParams: { status: "confirmed" },
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await getBookings(request);
      const data = await extractJSON(response);

      expect(response.status).toBe(200);
      expect(data.bookings.every((b: any) => b.status === "confirmed")).toBe(
        true
      );
    });

    it("should filter by date range", async () => {
      const request = createMockRequest("/api/bookings", {
        method: "GET",
        searchParams: {
          from: "2025-11-01",
          to: "2025-11-30",
        },
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await getBookings(request);
      const data = await extractJSON(response);

      expect(response.status).toBe(200);
      expect(Array.isArray(data.bookings)).toBe(true);
    });

    it("should require authentication", async () => {
      const request = createMockRequest("/api/bookings", {
        method: "GET",
      });

      const response = await getBookings(request);
      expect(response.status).toBe(401);
    });
  });

  describe("PATCH /api/bookings/[id] - Update Booking", () => {
    it("should reschedule a booking", async () => {
      const updateData = {
        time_slot_id: "new-slot-1",
        booking_date: "2025-11-21T15:00:00Z",
      };

      const request = createMockRequest("/api/bookings/booking-1", {
        method: "PATCH",
        body: updateData,
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await updateBooking(request, {
        params: { id: "booking-1" },
      });
      const data = await extractJSON(response);

      expect(response.status).toBe(200);
      expect(data.booking.time_slot_id).toBe(updateData.time_slot_id);
    });

    it("should send reschedule notification", async () => {
      resetEmailMock();

      const updateData = {
        time_slot_id: "new-slot-1",
        booking_date: "2025-11-21T15:00:00Z",
      };

      const request = createMockRequest("/api/bookings/booking-1", {
        method: "PATCH",
        body: updateData,
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      await updateBooking(request, { params: { id: "booking-1" } });

      assertEmailSent({
        subject: "Booking Rescheduled",
        contentIncludes: "rescheduled",
      });
    });

    it("should only allow owner to update booking", async () => {
      const updateData = {
        notes: "Updated notes",
      };

      const request = createMockRequest("/api/bookings/booking-1", {
        method: "PATCH",
        body: updateData,
        headers: {
          Authorization: "Bearer mock-different-user-token",
        },
      });

      const response = await updateBooking(request, {
        params: { id: "booking-1" },
      });
      expect(response.status).toBe(403);
    });
  });

  describe("DELETE /api/bookings/[id] - Cancel Booking", () => {
    it("should cancel a booking", async () => {
      const request = createMockRequest("/api/bookings/booking-1", {
        method: "DELETE",
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await deleteBooking(request, {
        params: { id: "booking-1" },
      });
      const data = await extractJSON(response);

      expect(response.status).toBe(200);
      expect(data.booking.status).toBe("cancelled");
    });

    it("should send cancellation notification", async () => {
      resetEmailMock();

      const request = createMockRequest("/api/bookings/booking-1", {
        method: "DELETE",
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      await deleteBooking(request, { params: { id: "booking-1" } });

      assertEmailSent({
        subject: "Booking Cancelled",
        contentIncludes: "cancelled",
      });
    });

    it("should enforce cancellation policy", async () => {
      // Booking less than 24 hours away
      const request = createMockRequest("/api/bookings/near-booking", {
        method: "DELETE",
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await deleteBooking(request, {
        params: { id: "near-booking" },
      });

      expect(response.status).toBe(400);
      const data = await extractJSON(response);
      expect(data.error).toContain("24 hours");
    });
  });
});

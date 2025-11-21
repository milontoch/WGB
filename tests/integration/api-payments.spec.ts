// Integration tests for payment API routes

import { describe, it, expect } from "vitest";
import { POST as initializePayment } from "@/app/api/payment/initialize/route";
import { GET as verifyPayment } from "@/app/api/payment/verify/route";
import { createMockRequest, extractJSON } from "@tests/utils/testHelpers";
import { resetEmailMock, assertEmailSent } from "@tests/utils/emailMock";

describe("Payment API Routes", () => {
  describe("POST /api/payment/initialize - Initialize Payment", () => {
    it("should initialize Paystack payment", async () => {
      const paymentData = {
        order_id: "order-1",
        email: "test@example.com",
        amount: 10000, // in kobo (₦100.00)
      };

      const request = createMockRequest("/api/payment/initialize", {
        method: "POST",
        body: paymentData,
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await initializePayment(request);
      const data = await extractJSON(response);

      expect(response.status).toBe(200);
      expect(data.authorization_url).toBeDefined();
      expect(data.authorization_url).toContain("paystack.com");
      expect(data.reference).toBeDefined();
    });

    it("should create payment record in database", async () => {
      const paymentData = {
        order_id: "order-1",
        email: "test@example.com",
        amount: 10000,
      };

      const request = createMockRequest("/api/payment/initialize", {
        method: "POST",
        body: paymentData,
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await initializePayment(request);
      const data = await extractJSON(response);

      expect(data.payment_id).toBeDefined();
    });

    it("should validate minimum amount (₦100)", async () => {
      const paymentData = {
        order_id: "order-1",
        email: "test@example.com",
        amount: 50, // Less than minimum
      };

      const request = createMockRequest("/api/payment/initialize", {
        method: "POST",
        body: paymentData,
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await initializePayment(request);

      expect(response.status).toBe(400);
      const data = await extractJSON(response);
      expect(data.error).toContain("minimum");
    });

    it("should require authentication", async () => {
      const paymentData = {
        order_id: "order-1",
        email: "test@example.com",
        amount: 10000,
      };

      const request = createMockRequest("/api/payment/initialize", {
        method: "POST",
        body: paymentData,
        // No auth header
      });

      const response = await initializePayment(request);
      expect(response.status).toBe(401);
    });

    it("should validate email format", async () => {
      const paymentData = {
        order_id: "order-1",
        email: "invalid-email",
        amount: 10000,
      };

      const request = createMockRequest("/api/payment/initialize", {
        method: "POST",
        body: paymentData,
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await initializePayment(request);
      expect(response.status).toBe(400);
    });

    it("should generate unique payment reference", async () => {
      const makeRequest = async () => {
        const request = createMockRequest("/api/payment/initialize", {
          method: "POST",
          body: {
            order_id: "order-1",
            email: "test@example.com",
            amount: 10000,
          },
          headers: {
            Authorization: "Bearer mock-access-token",
          },
        });
        return initializePayment(request);
      };

      const response1 = await makeRequest();
      const response2 = await makeRequest();

      const data1 = await extractJSON(response1);
      const data2 = await extractJSON(response2);

      expect(data1.reference).not.toBe(data2.reference);
    });
  });

  describe("GET /api/payment/verify - Verify Payment", () => {
    it("should verify successful payment", async () => {
      const request = createMockRequest("/api/payment/verify", {
        method: "GET",
        searchParams: {
          reference: "test-payment-ref",
        },
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await verifyPayment(request);
      const data = await extractJSON(response);

      expect(response.status).toBe(200);
      expect(data.status).toBe("success");
      expect(data.order_status).toBe("completed");
    });

    it("should send payment confirmation email", async () => {
      resetEmailMock();

      const request = createMockRequest("/api/payment/verify", {
        method: "GET",
        searchParams: {
          reference: "test-payment-ref",
        },
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      await verifyPayment(request);

      assertEmailSent({
        subject: "Payment Confirmed",
        contentIncludes: "payment",
      });
    });

    it("should handle failed payment", async () => {
      const request = createMockRequest("/api/payment/verify", {
        method: "GET",
        searchParams: {
          reference: "test-failed-reference",
        },
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await verifyPayment(request);
      const data = await extractJSON(response);

      expect(response.status).toBe(200);
      expect(data.status).toBe("failed");
      expect(data.order_status).toBe("failed");
    });

    it("should send payment failure email", async () => {
      resetEmailMock();

      const request = createMockRequest("/api/payment/verify", {
        method: "GET",
        searchParams: {
          reference: "test-failed-reference",
        },
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      await verifyPayment(request);

      assertEmailSent({
        subject: "Payment Failed",
        contentIncludes: "failed",
      });
    });

    it("should update order status on successful payment", async () => {
      const request = createMockRequest("/api/payment/verify", {
        method: "GET",
        searchParams: {
          reference: "test-payment-ref",
        },
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await verifyPayment(request);
      const data = await extractJSON(response);

      expect(data.order).toBeDefined();
      expect(data.order.status).toBe("completed");
      expect(data.order.payment_status).toBe("paid");
    });

    it("should handle invalid reference", async () => {
      const request = createMockRequest("/api/payment/verify", {
        method: "GET",
        searchParams: {
          reference: "invalid-reference",
        },
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await verifyPayment(request);

      expect(response.status).toBe(404);
      const data = await extractJSON(response);
      expect(data.error).toContain("not found");
    });

    it("should prevent double verification", async () => {
      const makeRequest = async () => {
        const request = createMockRequest("/api/payment/verify", {
          method: "GET",
          searchParams: {
            reference: "test-payment-ref",
          },
          headers: {
            Authorization: "Bearer mock-access-token",
          },
        });
        return verifyPayment(request);
      };

      // First verification succeeds
      const response1 = await makeRequest();
      expect(response1.status).toBe(200);

      // Second verification should indicate already verified
      const response2 = await makeRequest();
      const data2 = await extractJSON(response2);
      expect(data2.already_verified).toBe(true);
    });

    it("should require authentication", async () => {
      const request = createMockRequest("/api/payment/verify", {
        method: "GET",
        searchParams: {
          reference: "test-payment-ref",
        },
        // No auth header
      });

      const response = await verifyPayment(request);
      expect(response.status).toBe(401);
    });

    it("should validate amount matches order", async () => {
      const request = createMockRequest("/api/payment/verify", {
        method: "GET",
        searchParams: {
          reference: "test-payment-ref",
        },
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await verifyPayment(request);
      const data = await extractJSON(response);

      // Verify amount in Paystack matches order amount
      expect(data.amount_verified).toBe(true);
    });
  });
});

// Integration tests for orders API with stock race condition handling

import { describe, it, expect, beforeEach } from "vitest";
import { POST as createOrder } from "@/app/api/orders/route";
import { GET as getOrders } from "@/app/api/orders/route";
import { GET as getOrder } from "@/app/api/orders/[id]/route";
import {
  createMockRequest,
  simulateConcurrentRequests,
  extractJSON,
} from "@tests/utils/testHelpers";
import { resetEmailMock, assertEmailSent } from "@tests/utils/emailMock";
import { lowStockProduct } from "@tests/utils/fixtures";

describe("Orders API Routes", () => {
  beforeEach(() => {
    resetEmailMock();
  });

  describe("POST /api/orders - Create Order", () => {
    it("should create a new order", async () => {
      const orderData = {
        items: [
          {
            product_id: "product-1",
            quantity: 2,
            price: 89.99,
          },
        ],
        user_id: "user-1",
        total_amount: 179.98,
      };

      const request = createMockRequest("/api/orders", {
        method: "POST",
        body: orderData,
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await createOrder(request);
      const data = await extractJSON(response);

      expect(response.status).toBe(201);
      expect(data.order).toBeDefined();
      expect(data.order.total_amount).toBe(orderData.total_amount);
      expect(data.order.status).toBe("pending");
    });

    it("should return payment initialization URL", async () => {
      const orderData = {
        items: [
          {
            product_id: "product-1",
            quantity: 1,
            price: 89.99,
          },
        ],
        total_amount: 89.99,
      };

      const request = createMockRequest("/api/orders", {
        method: "POST",
        body: orderData,
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await createOrder(request);
      const data = await extractJSON(response);

      expect(data.payment).toBeDefined();
      expect(data.payment.authorization_url).toContain("checkout.paystack.com");
      expect(data.payment.reference).toBeDefined();
    });

    it("should send order confirmation email", async () => {
      const orderData = {
        items: [
          {
            product_id: "product-1",
            quantity: 1,
            price: 89.99,
          },
        ],
        total_amount: 89.99,
      };

      const request = createMockRequest("/api/orders", {
        method: "POST",
        body: orderData,
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      await createOrder(request);

      assertEmailSent({
        subject: "Order Confirmation",
        contentIncludes: "order",
      });
    });

    it("should reject order with insufficient stock", async () => {
      const orderData = {
        items: [
          {
            product_id: "out-of-stock",
            quantity: 1,
            price: 35.0,
          },
        ],
        total_amount: 35.0,
      };

      const request = createMockRequest("/api/orders", {
        method: "POST",
        body: orderData,
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await createOrder(request);

      expect(response.status).toBe(400);
      const data = await extractJSON(response);
      expect(data.error).toContain("stock");
    });

    it("should reject order with invalid quantity", async () => {
      const orderData = {
        items: [
          {
            product_id: "product-1",
            quantity: 0,
            price: 89.99,
          },
        ],
        total_amount: 0,
      };

      const request = createMockRequest("/api/orders", {
        method: "POST",
        body: orderData,
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await createOrder(request);

      expect(response.status).toBe(400);
    });

    it("should require authentication", async () => {
      const orderData = {
        items: [
          {
            product_id: "product-1",
            quantity: 1,
            price: 89.99,
          },
        ],
        total_amount: 89.99,
      };

      const request = createMockRequest("/api/orders", {
        method: "POST",
        body: orderData,
        // No auth header
      });

      const response = await createOrder(request);
      expect(response.status).toBe(401);
    });

    it("should validate total amount matches items", async () => {
      const orderData = {
        items: [
          {
            product_id: "product-1",
            quantity: 2,
            price: 89.99,
          },
        ],
        total_amount: 100.0, // Wrong total
      };

      const request = createMockRequest("/api/orders", {
        method: "POST",
        body: orderData,
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await createOrder(request);

      expect(response.status).toBe(400);
      const data = await extractJSON(response);
      expect(data.error).toContain("total");
    });

    /**
     * RACE CONDITION TEST: Stock depletion with concurrent orders
     * Multiple users try to buy the last items in stock simultaneously
     */
    it("should prevent overselling with concurrent orders", async () => {
      // Product with only 2 items in stock
      const productId = "low-stock-product";

      const createOrderRequest = (userId: string) => {
        return async () => {
          const request = createMockRequest("/api/orders", {
            method: "POST",
            body: {
              items: [
                {
                  product_id: productId,
                  quantity: 2, // Each wants to buy 2 (total stock)
                  price: 120.0,
                },
              ],
              total_amount: 240.0,
              user_id: userId,
            },
            headers: {
              Authorization: `Bearer mock-token-${userId}`,
            },
          });
          return createOrder(request);
        };
      };

      // Three users try to buy simultaneously
      const results = await Promise.all([
        createOrderRequest("user-1")(),
        createOrderRequest("user-2")(),
        createOrderRequest("user-3")(),
      ]);

      // Only one should succeed (first to acquire lock)
      const successfulOrders = results.filter((r) => r.status === 201);
      const failedOrders = results.filter((r) => r.status >= 400);

      expect(successfulOrders.length).toBe(1);
      expect(failedOrders.length).toBe(2);

      // Failed orders should indicate insufficient stock
      for (const failed of failedOrders) {
        const data = await extractJSON(failed);
        expect(data.error).toContain("stock");
      }
    });

    /**
     * RACE CONDITION TEST: Multiple items in cart with partial stock
     */
    it("should handle partial stock availability correctly", async () => {
      const createOrderRequest = () => {
        return async () => {
          const request = createMockRequest("/api/orders", {
            method: "POST",
            body: {
              items: [
                {
                  product_id: "low-stock-product",
                  quantity: 1,
                  price: 120.0,
                },
                {
                  product_id: "high-stock-product",
                  quantity: 5,
                  price: 50.0,
                },
              ],
              total_amount: 370.0,
            },
            headers: {
              Authorization: "Bearer mock-access-token",
            },
          });
          return createOrder(request);
        };
      };

      // Three concurrent orders, low-stock product has only 2 in stock
      const results = await Promise.all([
        createOrderRequest()(),
        createOrderRequest()(),
        createOrderRequest()(),
      ]);

      const successfulOrders = results.filter((r) => r.status === 201);

      // At most 2 should succeed (limited by low-stock product)
      expect(successfulOrders.length).toBeLessThanOrEqual(2);
    });

    /**
     * RACE CONDITION TEST: Order creation with inventory check
     */
    it("should atomically check and reserve stock", async () => {
      const productId = "limited-product";
      const availableStock = 5;

      const createOrderRequest = (quantity: number) => {
        return async () => {
          const request = createMockRequest("/api/orders", {
            method: "POST",
            body: {
              items: [
                {
                  product_id: productId,
                  quantity,
                  price: 100.0,
                },
              ],
              total_amount: quantity * 100.0,
            },
            headers: {
              Authorization: "Bearer mock-access-token",
            },
          });
          return createOrder(request);
        };
      };

      // Multiple orders that together exceed stock
      const results = await Promise.all([
        createOrderRequest(3)(), // 3 items
        createOrderRequest(3)(), // 3 items - total would be 6, exceeds 5
      ]);

      const successfulOrders = results.filter((r) => r.status === 201);

      // Total quantity in successful orders should not exceed available stock
      let totalOrdered = 0;
      for (const success of successfulOrders) {
        const data = await extractJSON(success);
        totalOrdered += data.order.items[0].quantity;
      }

      expect(totalOrdered).toBeLessThanOrEqual(availableStock);
    });
  });

  describe("GET /api/orders - List Orders", () => {
    it("should return user orders", async () => {
      const request = createMockRequest("/api/orders", {
        method: "GET",
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await getOrders(request);
      const data = await extractJSON(response);

      expect(response.status).toBe(200);
      expect(Array.isArray(data.orders)).toBe(true);
    });

    it("should filter by status", async () => {
      const request = createMockRequest("/api/orders", {
        method: "GET",
        searchParams: { status: "completed" },
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await getOrders(request);
      const data = await extractJSON(response);

      expect(response.status).toBe(200);
      expect(data.orders.every((o: any) => o.status === "completed")).toBe(
        true
      );
    });

    it("should include order items", async () => {
      const request = createMockRequest("/api/orders", {
        method: "GET",
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await getOrders(request);
      const data = await extractJSON(response);

      if (data.orders.length > 0) {
        expect(data.orders[0].items).toBeDefined();
        expect(Array.isArray(data.orders[0].items)).toBe(true);
      }
    });

    it("should require authentication", async () => {
      const request = createMockRequest("/api/orders", {
        method: "GET",
      });

      const response = await getOrders(request);
      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/orders/[id] - Get Order Details", () => {
    it("should return order details", async () => {
      const request = createMockRequest("/api/orders/order-1", {
        method: "GET",
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await getOrder(request, { params: { id: "order-1" } });
      const data = await extractJSON(response);

      expect(response.status).toBe(200);
      expect(data.order.id).toBe("order-1");
      expect(data.order.items).toBeDefined();
    });

    it("should return 404 for nonexistent order", async () => {
      const request = createMockRequest("/api/orders/nonexistent", {
        method: "GET",
        headers: {
          Authorization: "Bearer mock-access-token",
        },
      });

      const response = await getOrder(request, {
        params: { id: "nonexistent" },
      });
      expect(response.status).toBe(404);
    });

    it("should only allow owner to view order", async () => {
      const request = createMockRequest("/api/orders/order-1", {
        method: "GET",
        headers: {
          Authorization: "Bearer mock-different-user-token",
        },
      });

      const response = await getOrder(request, { params: { id: "order-1" } });
      expect(response.status).toBe(403);
    });
  });
});

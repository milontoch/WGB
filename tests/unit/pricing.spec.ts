// Unit tests for pricing calculations

import { describe, it, expect } from "vitest";
import {
  calculateCartTotal,
  calculateDiscount,
  calculateServicePrice,
} from "@/lib/booking-utils";

describe("Pricing Calculations", () => {
  describe("calculateCartTotal", () => {
    it("should calculate total for single item", () => {
      const items = [{ product_id: "1", quantity: 2, price: 50.0 }];
      const total = calculateCartTotal(items);
      expect(total).toBe(100.0);
    });

    it("should calculate total for multiple items", () => {
      const items = [
        { product_id: "1", quantity: 2, price: 50.0 },
        { product_id: "2", quantity: 1, price: 75.0 },
        { product_id: "3", quantity: 3, price: 25.0 },
      ];
      const total = calculateCartTotal(items);
      expect(total).toBe(250.0); // (2*50) + (1*75) + (3*25)
    });

    it("should handle empty cart", () => {
      const total = calculateCartTotal([]);
      expect(total).toBe(0);
    });

    it("should handle zero quantity", () => {
      const items = [{ product_id: "1", quantity: 0, price: 50.0 }];
      const total = calculateCartTotal(items);
      expect(total).toBe(0);
    });

    it("should round to 2 decimal places", () => {
      const items = [{ product_id: "1", quantity: 3, price: 33.333 }];
      const total = calculateCartTotal(items);
      expect(total).toBe(100.0);
    });

    it("should handle large quantities", () => {
      const items = [{ product_id: "1", quantity: 100, price: 10.5 }];
      const total = calculateCartTotal(items);
      expect(total).toBe(1050.0);
    });
  });

  describe("calculateDiscount", () => {
    it("should calculate percentage discount", () => {
      const discount = calculateDiscount(100, 10); // 10% off 100
      expect(discount).toBe(10.0);
    });

    it("should calculate 50% discount", () => {
      const discount = calculateDiscount(200, 50);
      expect(discount).toBe(100.0);
    });

    it("should calculate 100% discount", () => {
      const discount = calculateDiscount(150, 100);
      expect(discount).toBe(150.0);
    });

    it("should handle zero discount", () => {
      const discount = calculateDiscount(100, 0);
      expect(discount).toBe(0);
    });

    it("should not exceed original price", () => {
      const discount = calculateDiscount(100, 150); // 150% would be invalid
      expect(discount).toBeLessThanOrEqual(100);
    });

    it("should round to 2 decimal places", () => {
      const discount = calculateDiscount(33.33, 10);
      expect(discount).toBe(3.33);
    });

    it("should calculate fixed amount discount", () => {
      const discount = calculateDiscount(100, { type: "fixed", amount: 15 });
      expect(discount).toBe(15.0);
    });

    it("should not allow fixed discount to exceed price", () => {
      const discount = calculateDiscount(50, { type: "fixed", amount: 75 });
      expect(discount).toBeLessThanOrEqual(50);
    });
  });

  describe("calculateServicePrice", () => {
    it("should calculate base service price", () => {
      const service = {
        base_price: 150.0,
        duration: 60,
      };
      const price = calculateServicePrice(service);
      expect(price).toBe(150.0);
    });

    it("should apply addon charges", () => {
      const service = {
        base_price: 150.0,
        duration: 60,
      };
      const addons = [
        { name: "Hot towel", price: 10.0 },
        { name: "Aromatherapy", price: 20.0 },
      ];
      const price = calculateServicePrice(service, { addons });
      expect(price).toBe(180.0); // 150 + 10 + 20
    });

    it("should apply duration multiplier", () => {
      const service = {
        base_price: 100.0,
        duration: 60,
      };
      const price = calculateServicePrice(service, { duration: 90 });
      expect(price).toBe(150.0); // 100 * 1.5
    });

    it("should apply peak time surcharge", () => {
      const service = {
        base_price: 150.0,
        duration: 60,
      };
      const price = calculateServicePrice(service, { isPeakTime: true });
      expect(price).toBe(180.0); // 150 * 1.2 (20% surcharge)
    });

    it("should combine multiple adjustments", () => {
      const service = {
        base_price: 100.0,
        duration: 60,
      };
      const addons = [{ name: "Extra", price: 20.0 }];
      const price = calculateServicePrice(service, {
        addons,
        duration: 90,
        isPeakTime: true,
      });
      // Base: 100
      // Duration: 100 * 1.5 = 150
      // Peak time: 150 * 1.2 = 180
      // Addon: 180 + 20 = 200
      expect(price).toBe(200.0);
    });

    it("should apply member discount", () => {
      const service = {
        base_price: 200.0,
        duration: 60,
      };
      const price = calculateServicePrice(service, { isMember: true });
      expect(price).toBe(180.0); // 200 * 0.9 (10% member discount)
    });

    it("should not go below minimum price", () => {
      const service = {
        base_price: 50.0,
        duration: 60,
        minimum_price: 40.0,
      };
      const price = calculateServicePrice(service, {
        isMember: true,
        discount: 30,
      });
      expect(price).toBeGreaterThanOrEqual(40.0);
    });

    it("should handle package pricing", () => {
      const service = {
        base_price: 150.0,
        duration: 60,
      };
      const price = calculateServicePrice(service, {
        packageSessions: 5,
      });
      expect(price).toBe(675.0); // 150 * 5 * 0.9 (10% package discount)
    });
  });
});

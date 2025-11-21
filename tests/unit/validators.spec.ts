// Unit tests for lib/utils/validation.ts

import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateBookingDate,
  validatePrice,
  validateQuantity,
} from "@/lib/utils/validation";

describe("Validation Utilities", () => {
  describe("validateEmail", () => {
    it("should accept valid email addresses", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name@domain.co.uk")).toBe(true);
      expect(validateEmail("test+tag@gmail.com")).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      expect(validateEmail("notanemail")).toBe(false);
      expect(validateEmail("missing@domain")).toBe(false);
      expect(validateEmail("@nodomain.com")).toBe(false);
      expect(validateEmail("spaces in@email.com")).toBe(false);
    });

    it("should reject empty string", () => {
      expect(validateEmail("")).toBe(false);
    });

    it("should be case insensitive", () => {
      expect(validateEmail("TEST@EXAMPLE.COM")).toBe(true);
    });
  });

  describe("validatePhone", () => {
    it("should accept valid Nigerian phone numbers", () => {
      expect(validatePhone("+2348012345678")).toBe(true);
      expect(validatePhone("08012345678")).toBe(true);
      expect(validatePhone("2348012345678")).toBe(true);
    });

    it("should accept international format", () => {
      expect(validatePhone("+1234567890")).toBe(true);
      expect(validatePhone("+44 20 7946 0958")).toBe(true);
    });

    it("should reject invalid phone numbers", () => {
      expect(validatePhone("123")).toBe(false);
      expect(validatePhone("abcdefghij")).toBe(false);
      expect(validatePhone("")).toBe(false);
    });

    it("should handle phone with spaces and dashes", () => {
      expect(validatePhone("+234 801 234 5678")).toBe(true);
      expect(validatePhone("080-1234-5678")).toBe(true);
    });
  });

  describe("validatePassword", () => {
    it("should accept strong passwords", () => {
      expect(validatePassword("SecurePass123!")).toBe(true);
      expect(validatePassword("MyP@ssw0rd")).toBe(true);
    });

    it("should reject weak passwords", () => {
      expect(validatePassword("weak")).toBe(false);
      expect(validatePassword("12345678")).toBe(false);
      expect(validatePassword("onlylowercase")).toBe(false);
    });

    it("should enforce minimum length", () => {
      expect(validatePassword("Short1!")).toBe(false);
      expect(validatePassword("LongEnough123!")).toBe(true);
    });

    it("should require mixed case", () => {
      expect(validatePassword("alllowercase123!")).toBe(false);
      expect(validatePassword("ALLUPPERCASE123!")).toBe(false);
      expect(validatePassword("MixedCase123!")).toBe(true);
    });

    it("should require numbers", () => {
      expect(validatePassword("NoNumbers!@#")).toBe(false);
      expect(validatePassword("HasNumber1!")).toBe(true);
    });

    it("should require special characters", () => {
      expect(validatePassword("NoSpecialChars123")).toBe(false);
      expect(validatePassword("HasSpecial123!")).toBe(true);
    });
  });

  describe("validateBookingDate", () => {
    it("should accept future dates", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      expect(validateBookingDate(futureDate)).toBe(true);
    });

    it("should reject past dates", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      expect(validateBookingDate(pastDate)).toBe(false);
    });

    it("should reject today (same day)", () => {
      const today = new Date();
      expect(validateBookingDate(today)).toBe(false);
    });

    it("should accept date strings", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      expect(validateBookingDate(futureDate.toISOString())).toBe(true);
    });

    it("should enforce minimum advance booking (24 hours)", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(tomorrow.getHours() - 1); // Less than 24 hours
      expect(validateBookingDate(tomorrow)).toBe(false);

      tomorrow.setHours(tomorrow.getHours() + 2); // More than 24 hours
      expect(validateBookingDate(tomorrow)).toBe(true);
    });

    it("should enforce maximum advance booking (90 days)", () => {
      const farFuture = new Date();
      farFuture.setDate(farFuture.getDate() + 100);
      expect(validateBookingDate(farFuture)).toBe(false);

      const acceptableFuture = new Date();
      acceptableFuture.setDate(acceptableFuture.getDate() + 60);
      expect(validateBookingDate(acceptableFuture)).toBe(true);
    });
  });

  describe("validatePrice", () => {
    it("should accept valid prices", () => {
      expect(validatePrice(100)).toBe(true);
      expect(validatePrice(0.01)).toBe(true);
      expect(validatePrice(9999.99)).toBe(true);
    });

    it("should reject negative prices", () => {
      expect(validatePrice(-10)).toBe(false);
      expect(validatePrice(-0.01)).toBe(false);
    });

    it("should reject zero", () => {
      expect(validatePrice(0)).toBe(false);
    });

    it("should accept zero if allowZero is true", () => {
      expect(validatePrice(0, { allowZero: true })).toBe(true);
    });

    it("should enforce maximum price", () => {
      expect(validatePrice(1000000)).toBe(false);
      expect(validatePrice(99999)).toBe(true);
    });

    it("should handle string numbers", () => {
      expect(validatePrice("100.50")).toBe(true);
      expect(validatePrice("invalid")).toBe(false);
    });

    it("should enforce decimal precision (2 places)", () => {
      expect(validatePrice(10.999)).toBe(false);
      expect(validatePrice(10.99)).toBe(true);
    });
  });

  describe("validateQuantity", () => {
    it("should accept valid quantities", () => {
      expect(validateQuantity(1)).toBe(true);
      expect(validateQuantity(5)).toBe(true);
      expect(validateQuantity(100)).toBe(true);
    });

    it("should reject zero and negative", () => {
      expect(validateQuantity(0)).toBe(false);
      expect(validateQuantity(-1)).toBe(false);
    });

    it("should reject decimals", () => {
      expect(validateQuantity(1.5)).toBe(false);
      expect(validateQuantity(2.99)).toBe(false);
    });

    it("should enforce maximum quantity", () => {
      expect(validateQuantity(1000)).toBe(false);
      expect(validateQuantity(999)).toBe(true);
    });

    it("should check against available stock", () => {
      expect(validateQuantity(5, { maxStock: 10 })).toBe(true);
      expect(validateQuantity(15, { maxStock: 10 })).toBe(false);
    });

    it("should handle string numbers", () => {
      expect(validateQuantity("5")).toBe(true);
      expect(validateQuantity("abc")).toBe(false);
    });
  });
});

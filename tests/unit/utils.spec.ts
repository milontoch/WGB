// Unit tests for lib/utils.ts

import { describe, it, expect } from "vitest";
import { cn, formatPrice, formatDate, truncateText } from "@/lib/utils";

describe("Utils", () => {
  describe("cn (classNames utility)", () => {
    it("should merge class names", () => {
      const result = cn("px-4", "py-2", "bg-blue-500");
      expect(result).toBe("px-4 py-2 bg-blue-500");
    });

    it("should handle conditional classes", () => {
      const isActive = true;
      const result = cn("base-class", isActive && "active-class");
      expect(result).toContain("active-class");
    });

    it("should handle falsy values", () => {
      const result = cn("base-class", false && "hidden", null, undefined);
      expect(result).toBe("base-class");
    });

    it("should override conflicting Tailwind classes", () => {
      const result = cn("px-4", "px-8");
      expect(result).toContain("px-8");
      expect(result).not.toContain("px-4");
    });
  });

  describe("formatPrice", () => {
    it("should format price in NGN", () => {
      const result = formatPrice(1000);
      expect(result).toBe("₦1,000.00");
    });

    it("should handle decimal values", () => {
      const result = formatPrice(1234.56);
      expect(result).toBe("₦1,234.56");
    });

    it("should handle zero", () => {
      const result = formatPrice(0);
      expect(result).toBe("₦0.00");
    });

    it("should handle large numbers", () => {
      const result = formatPrice(1000000);
      expect(result).toBe("₦1,000,000.00");
    });

    it("should round to 2 decimal places", () => {
      const result = formatPrice(10.999);
      expect(result).toBe("₦11.00");
    });
  });

  describe("formatDate", () => {
    it("should format date in readable format", () => {
      const date = new Date("2025-11-20T14:00:00Z");
      const result = formatDate(date);
      // Result format depends on locale, so just check it's a string
      expect(typeof result).toBe("string");
      expect(result).toContain("Nov");
      expect(result).toContain("20");
    });

    it("should handle ISO string input", () => {
      const result = formatDate("2025-11-20T14:00:00Z");
      expect(typeof result).toBe("string");
    });

    it("should handle different date formats", () => {
      const date1 = formatDate(new Date("2025-01-01"));
      const date2 = formatDate(new Date("2025-12-31"));
      expect(date1).not.toBe(date2);
    });
  });

  describe("truncateText", () => {
    it("should truncate long text", () => {
      const longText = "This is a very long text that needs to be truncated";
      const result = truncateText(longText, 20);
      expect(result).toBe("This is a very long...");
      expect(result.length).toBeLessThanOrEqual(23); // 20 + '...'
    });

    it("should not truncate short text", () => {
      const shortText = "Short text";
      const result = truncateText(shortText, 20);
      expect(result).toBe(shortText);
    });

    it("should handle exact length", () => {
      const text = "Exactly twenty chars";
      const result = truncateText(text, 20);
      expect(result).toBe(text);
    });

    it("should handle empty string", () => {
      const result = truncateText("", 10);
      expect(result).toBe("");
    });

    it("should use default maxLength if not provided", () => {
      const longText = "A".repeat(200);
      const result = truncateText(longText);
      expect(result.endsWith("...")).toBe(true);
    });
  });
});

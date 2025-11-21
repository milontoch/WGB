// Unit tests for time slot availability logic

import { describe, it, expect, beforeEach } from "vitest";
import {
  checkSlotAvailability,
  findAvailableSlots,
  isSlotConflict,
  calculateSlotDuration,
  generateTimeSlots,
} from "@/lib/services/time-slot-service";
import { createTestTimeSlot, createTestBooking } from "@tests/utils/factories";

describe("Time Slot Service", () => {
  describe("checkSlotAvailability", () => {
    it("should return true for available slot", async () => {
      const slot = createTestTimeSlot({
        is_available: true,
        start_time: "2025-11-20T14:00:00Z",
      });

      const available = await checkSlotAvailability(slot.id);
      expect(available).toBe(true);
    });

    it("should return false for booked slot", async () => {
      const slot = createTestTimeSlot({
        is_available: false,
        start_time: "2025-11-20T14:00:00Z",
      });

      const available = await checkSlotAvailability(slot.id);
      expect(available).toBe(false);
    });

    it("should return false for past slot", async () => {
      const pastSlot = createTestTimeSlot({
        is_available: true,
        start_time: "2025-01-01T14:00:00Z",
      });

      const available = await checkSlotAvailability(pastSlot.id);
      expect(available).toBe(false);
    });

    it("should check with specific date", async () => {
      const slot = createTestTimeSlot({
        is_available: true,
        start_time: "2025-11-20T14:00:00Z",
      });

      const available = await checkSlotAvailability(
        slot.id,
        new Date("2025-11-20T10:00:00Z")
      );
      expect(available).toBe(true);
    });

    it("should return false if slot is within buffer time", async () => {
      // Slot starting in 30 minutes (less than 1 hour buffer)
      const nearSlot = createTestTimeSlot({
        is_available: true,
        start_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      });

      const available = await checkSlotAvailability(nearSlot.id);
      expect(available).toBe(false);
    });
  });

  describe("findAvailableSlots", () => {
    it("should find all available slots for a service", async () => {
      const serviceId = "service-1";
      const date = new Date("2025-11-20");

      const slots = await findAvailableSlots(serviceId, date);

      expect(slots.length).toBeGreaterThan(0);
      expect(slots.every((slot) => slot.is_available)).toBe(true);
    });

    it("should filter out past slots", async () => {
      const serviceId = "service-1";
      const date = new Date(); // Today

      const slots = await findAvailableSlots(serviceId, date);

      slots.forEach((slot) => {
        expect(new Date(slot.start_time).getTime()).toBeGreaterThan(Date.now());
      });
    });

    it("should return empty array if no slots available", async () => {
      const serviceId = "nonexistent-service";
      const date = new Date("2025-11-20");

      const slots = await findAvailableSlots(serviceId, date);

      expect(slots).toEqual([]);
    });

    it("should filter by staff member", async () => {
      const serviceId = "service-1";
      const staffId = "staff-1";
      const date = new Date("2025-11-20");

      const slots = await findAvailableSlots(serviceId, date, { staffId });

      expect(slots.every((slot) => slot.staff_id === staffId)).toBe(true);
    });

    it("should respect business hours", async () => {
      const serviceId = "service-1";
      const date = new Date("2025-11-20");

      const slots = await findAvailableSlots(serviceId, date);

      slots.forEach((slot) => {
        const hour = new Date(slot.start_time).getHours();
        expect(hour).toBeGreaterThanOrEqual(9); // Open at 9am
        expect(hour).toBeLessThan(18); // Close at 6pm
      });
    });

    it("should return slots sorted by start time", async () => {
      const serviceId = "service-1";
      const date = new Date("2025-11-20");

      const slots = await findAvailableSlots(serviceId, date);

      for (let i = 1; i < slots.length; i++) {
        const prevTime = new Date(slots[i - 1].start_time).getTime();
        const currTime = new Date(slots[i].start_time).getTime();
        expect(currTime).toBeGreaterThanOrEqual(prevTime);
      }
    });
  });

  describe("isSlotConflict", () => {
    it("should detect overlapping slots", () => {
      const slot1 = {
        start_time: "2025-11-20T14:00:00Z",
        end_time: "2025-11-20T15:00:00Z",
      };
      const slot2 = {
        start_time: "2025-11-20T14:30:00Z",
        end_time: "2025-11-20T15:30:00Z",
      };

      const conflict = isSlotConflict(slot1, slot2);
      expect(conflict).toBe(true);
    });

    it("should not detect conflict for adjacent slots", () => {
      const slot1 = {
        start_time: "2025-11-20T14:00:00Z",
        end_time: "2025-11-20T15:00:00Z",
      };
      const slot2 = {
        start_time: "2025-11-20T15:00:00Z",
        end_time: "2025-11-20T16:00:00Z",
      };

      const conflict = isSlotConflict(slot1, slot2);
      expect(conflict).toBe(false);
    });

    it("should detect when one slot contains another", () => {
      const slot1 = {
        start_time: "2025-11-20T14:00:00Z",
        end_time: "2025-11-20T16:00:00Z",
      };
      const slot2 = {
        start_time: "2025-11-20T14:30:00Z",
        end_time: "2025-11-20T15:30:00Z",
      };

      const conflict = isSlotConflict(slot1, slot2);
      expect(conflict).toBe(true);
    });

    it("should not detect conflict for separate slots", () => {
      const slot1 = {
        start_time: "2025-11-20T09:00:00Z",
        end_time: "2025-11-20T10:00:00Z",
      };
      const slot2 = {
        start_time: "2025-11-20T14:00:00Z",
        end_time: "2025-11-20T15:00:00Z",
      };

      const conflict = isSlotConflict(slot1, slot2);
      expect(conflict).toBe(false);
    });
  });

  describe("calculateSlotDuration", () => {
    it("should calculate duration in minutes", () => {
      const slot = {
        start_time: "2025-11-20T14:00:00Z",
        end_time: "2025-11-20T15:00:00Z",
      };

      const duration = calculateSlotDuration(slot);
      expect(duration).toBe(60);
    });

    it("should handle 30-minute slots", () => {
      const slot = {
        start_time: "2025-11-20T14:00:00Z",
        end_time: "2025-11-20T14:30:00Z",
      };

      const duration = calculateSlotDuration(slot);
      expect(duration).toBe(30);
    });

    it("should handle 90-minute slots", () => {
      const slot = {
        start_time: "2025-11-20T14:00:00Z",
        end_time: "2025-11-20T15:30:00Z",
      };

      const duration = calculateSlotDuration(slot);
      expect(duration).toBe(90);
    });

    it("should handle multi-hour slots", () => {
      const slot = {
        start_time: "2025-11-20T14:00:00Z",
        end_time: "2025-11-20T17:00:00Z",
      };

      const duration = calculateSlotDuration(slot);
      expect(duration).toBe(180);
    });
  });

  describe("generateTimeSlots", () => {
    it("should generate slots for a day", () => {
      const config = {
        date: new Date("2025-11-20"),
        startHour: 9,
        endHour: 17,
        slotDuration: 60,
        serviceId: "service-1",
        staffId: "staff-1",
      };

      const slots = generateTimeSlots(config);

      expect(slots.length).toBe(8); // 9am-5pm = 8 hours
      expect(slots[0].start_time).toContain("09:00");
      expect(slots[slots.length - 1].start_time).toContain("16:00");
    });

    it("should generate 30-minute slots", () => {
      const config = {
        date: new Date("2025-11-20"),
        startHour: 9,
        endHour: 11,
        slotDuration: 30,
        serviceId: "service-1",
        staffId: "staff-1",
      };

      const slots = generateTimeSlots(config);

      expect(slots.length).toBe(4); // 9:00, 9:30, 10:00, 10:30
    });

    it("should mark slots as available by default", () => {
      const config = {
        date: new Date("2025-11-20"),
        startHour: 9,
        endHour: 12,
        slotDuration: 60,
        serviceId: "service-1",
        staffId: "staff-1",
      };

      const slots = generateTimeSlots(config);

      expect(slots.every((slot) => slot.is_available)).toBe(true);
    });

    it("should exclude lunch break", () => {
      const config = {
        date: new Date("2025-11-20"),
        startHour: 9,
        endHour: 17,
        slotDuration: 60,
        serviceId: "service-1",
        staffId: "staff-1",
        breakTimes: [
          { start: 12, end: 13 }, // Lunch 12-1pm
        ],
      };

      const slots = generateTimeSlots(config);

      const hasLunchSlot = slots.some((slot) =>
        slot.start_time.includes("12:00")
      );
      expect(hasLunchSlot).toBe(false);
    });

    it("should respect buffer time between slots", () => {
      const config = {
        date: new Date("2025-11-20"),
        startHour: 9,
        endHour: 12,
        slotDuration: 60,
        bufferMinutes: 15,
        serviceId: "service-1",
        staffId: "staff-1",
      };

      const slots = generateTimeSlots(config);

      // With 15-minute buffer, 60-minute slots become 75-minute intervals
      // 9am-12pm = 180 minutes / 75 = 2.4 slots = 2 slots
      expect(slots.length).toBe(2);
    });
  });
});

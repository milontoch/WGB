/**
 * Booking System Utilities
 * Handles time slot generation, availability checking, and booking validation
 */

import { supabaseAdmin } from "./supabase/admin";

export interface TimeSlot {
  time: string; // HH:MM format
  available: boolean;
  staffId?: string;
  staffName?: string;
}

export interface StaffAvailability {
  staffId: string;
  staffName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface Booking {
  id: string;
  staff_id: string | null;
  booking_date: string;
  booking_time: string;
  status: string;
}

/**
 * Generate time slots in 30-minute intervals
 * @param startTime - Start time in HH:MM format
 * @param endTime - End time in HH:MM format
 * @returns Array of time strings
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string
): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMin < endMin)
  ) {
    const timeStr = `${String(currentHour).padStart(2, "0")}:${String(
      currentMin
    ).padStart(2, "0")}`;
    slots.push(timeStr);

    // Add 30 minutes
    currentMin += 30;
    if (currentMin >= 60) {
      currentMin -= 60;
      currentHour += 1;
    }
  }

  return slots;
}

/**
 * Get day of week from date (0 = Sunday, 6 = Saturday)
 */
export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

/**
 * Get staff availability for a specific date
 * @param date - The date to check
 * @returns Array of staff availability records
 */
export async function getStaffAvailabilityForDate(
  date: Date
): Promise<StaffAvailability[]> {
  const dayOfWeek = getDayOfWeek(date);

  const { data, error } = await supabaseAdmin
    .from("availability")
    .select(
      `
      staff_id,
      day_of_week,
      start_time,
      end_time,
      staff:staff_id (
        id,
        name,
        active
      )
    `
    )
    .eq("day_of_week", dayOfWeek);

  if (error) {
    console.error("Error fetching availability:", error);
    return [];
  }

  return (data || [])
    .filter((av: any) => av.staff?.active)
    .map((av: any) => ({
      staffId: av.staff_id,
      staffName: av.staff.name,
      dayOfWeek: av.day_of_week,
      startTime: av.start_time,
      endTime: av.end_time,
    }));
}

/**
 * Get existing bookings for a specific date
 */
export async function getBookingsForDate(date: string): Promise<Booking[]> {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("id, staff_id, booking_date, booking_time, status")
    .eq("booking_date", date)
    .neq("status", "cancelled");

  if (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }

  return data || [];
}

/**
 * Get available time slots for a specific date and optionally a service
 * @param date - The date to check (YYYY-MM-DD)
 * @param serviceId - Optional service ID to filter staff
 * @returns Array of available time slots with staff information
 */
export async function getAvailableTimeSlots(
  date: string,
  serviceId?: string
): Promise<TimeSlot[]> {
  const dateObj = new Date(date);

  // Get staff availability for this day
  const availabilities = await getStaffAvailabilityForDate(dateObj);

  if (availabilities.length === 0) {
    return [];
  }

  // Get existing bookings for this date
  const bookings = await getBookingsForDate(date);

  // Generate all possible time slots from all staff availabilities
  const allSlots: TimeSlot[] = [];

  for (const availability of availabilities) {
    const slots = generateTimeSlots(
      availability.startTime,
      availability.endTime
    );

    for (const time of slots) {
      // Check if this staff member is already booked at this time
      const isBooked = bookings.some(
        (booking) =>
          booking.staff_id === availability.staffId &&
          booking.booking_time === time + ":00" // Convert HH:MM to HH:MM:SS
      );

      allSlots.push({
        time,
        available: !isBooked,
        staffId: availability.staffId,
        staffName: availability.staffName,
      });
    }
  }

  // Group by time and return unique slots
  const uniqueSlots = new Map<string, TimeSlot>();

  for (const slot of allSlots) {
    const existing = uniqueSlots.get(slot.time);

    if (!existing) {
      uniqueSlots.set(slot.time, slot);
    } else if (!existing.available && slot.available) {
      // If we have an available slot for this time from another staff, prefer it
      uniqueSlots.set(slot.time, slot);
    }
  }

  return Array.from(uniqueSlots.values()).sort((a, b) =>
    a.time.localeCompare(b.time)
  );
}

/**
 * Check if a specific time slot is available for booking
 */
export async function isSlotAvailable(
  staffId: string,
  date: string,
  time: string
): Promise<boolean> {
  const dateObj = new Date(date);
  const dayOfWeek = getDayOfWeek(dateObj);

  // Check if staff has availability for this day/time
  const { data: availability } = await supabaseAdmin
    .from("availability")
    .select("start_time, end_time")
    .eq("staff_id", staffId)
    .eq("day_of_week", dayOfWeek)
    .single();

  if (!availability) {
    return false;
  }

  // Check if time falls within availability range
  const [hour, min] = time.split(":").map(Number);
  const [startHour, startMin] = availability.start_time.split(":").map(Number);
  const [endHour, endMin] = availability.end_time.split(":").map(Number);

  const timeMinutes = hour * 60 + min;
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  if (timeMinutes < startMinutes || timeMinutes >= endMinutes) {
    return false;
  }

  // Check if slot is already booked
  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .select("id")
    .eq("staff_id", staffId)
    .eq("booking_date", date)
    .eq("booking_time", time + ":00")
    .neq("status", "cancelled")
    .maybeSingle();

  return !booking;
}

/**
 * Format date for display
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format time for display (HH:MM to h:MM AM/PM)
 */
export function formatTime(time: string): string {
  const [hour, minute] = time.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${ampm}`;
}

/**
 * Validate booking date is not in the past
 */
export function isValidBookingDate(date: string): boolean {
  const bookingDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return bookingDate >= today;
}

/**
 * Calculate cart total
 */
export interface CartItem {
  product_id: string;
  quantity: number;
  price: number;
}

export function calculateCartTotal(items: CartItem[]): number {
  const total = items.reduce((sum, item) => {
    return sum + item.quantity * item.price;
  }, 0);

  // Round to 2 decimal places
  return Math.round(total * 100) / 100;
}

/**
 * Calculate discount
 */
export function calculateDiscount(
  price: number,
  discount: number | { type: "fixed" | "percentage"; amount: number }
): number {
  let discountAmount = 0;

  if (typeof discount === "number") {
    // Percentage discount
    discountAmount = (price * discount) / 100;
  } else if (discount.type === "fixed") {
    // Fixed amount discount
    discountAmount = discount.amount;
  } else {
    // Percentage discount
    discountAmount = (price * discount.amount) / 100;
  }

  // Discount cannot exceed the original price
  discountAmount = Math.min(discountAmount, price);

  // Round to 2 decimal places
  return Math.round(discountAmount * 100) / 100;
}

/**
 * Calculate service price with adjustments
 */
export interface Service {
  id?: string;
  name?: string;
  price?: number;
  base_price?: number;
  duration: number;
  minimum_price?: number;
}

export interface ServicePriceOptions {
  addons?: Array<{ name: string; price: number }>;
  duration?: number;
  isPeakTime?: boolean;
  isMember?: boolean;
  discount?: number;
  packageSessions?: number;
}

export function calculateServicePrice(
  service: Service,
  options?: ServicePriceOptions
): number {
  let price = service.price || service.base_price || 0;

  // Apply duration multiplier first (if different from service duration)
  if (options?.duration && options.duration !== service.duration) {
    const multiplier = options.duration / service.duration;
    price = (service.price || service.base_price || 0) * multiplier;
  }

  // Apply peak time surcharge (20%)
  if (options?.isPeakTime) {
    price *= 1.2;
  }

  // Add addon prices
  if (options?.addons) {
    const addonTotal = options.addons.reduce(
      (sum, addon) => sum + addon.price,
      0
    );
    price += addonTotal;
  }

  // Apply member discount (10%)
  if (options?.isMember) {
    price *= 0.9;
  }

  // Apply additional discount
  if (options?.discount) {
    const discountAmount = (price * options.discount) / 100;
    price -= discountAmount;
  }

  // Apply package discount (5 sessions = 10% off total)
  if (options?.packageSessions) {
    price = price * options.packageSessions * 0.9;
  }

  // Ensure price doesn't go below minimum
  if (service.minimum_price) {
    price = Math.max(price, service.minimum_price);
  }

  // Round to 2 decimal places
  return Math.round(price * 100) / 100;
}

/**
 * Validation Utilities
 * Input validation helpers for booking system
 */

/**
 * Validate date string format (YYYY-MM-DD)
 */
export function isValidDateFormat(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }

  // Check if date is actually valid (not like 2024-13-45)
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}

/**
 * Validate time string format (HH:MM or HH:MM:SS)
 */
export function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
  return timeRegex.test(time);
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic validation)
 */
export function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");
  // Phone should have 10-15 digits
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate booking time is within business hours
 * @param time - Time in HH:MM format
 * @param minHour - Minimum hour (default 9)
 * @param maxHour - Maximum hour (default 18)
 */
export function isWithinBusinessHours(
  time: string,
  minHour: number = 9,
  maxHour: number = 18
): boolean {
  const [hour] = time.split(":").map(Number);
  return hour >= minHour && hour < maxHour;
}

/**
 * Validate that date is not in the past
 */
export function isFutureDate(date: string): boolean {
  const bookingDate = new Date(date + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return bookingDate >= today;
}

/**
 * Validate that date is within allowed booking window (e.g., max 90 days ahead)
 */
export function isWithinBookingWindow(
  date: string,
  maxDaysAhead: number = 90
): boolean {
  const bookingDate = new Date(date + "T00:00:00");
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + maxDaysAhead);

  return bookingDate <= maxDate;
}

/**
 * Validate day of week (0-6)
 */
export function isValidDayOfWeek(day: number): boolean {
  return Number.isInteger(day) && day >= 0 && day <= 6;
}

/**
 * Parse and validate booking request body
 */
export interface BookingRequest {
  service_id: string;
  staff_id: string;
  booking_date: string;
  booking_time: string;
  notes?: string;
}

export function validateBookingRequest(body: any): {
  valid: boolean;
  data?: BookingRequest;
  errors?: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!body.service_id) {
    errors.push("service_id is required");
  } else if (!isValidUUID(body.service_id)) {
    errors.push("service_id must be a valid UUID");
  }

  if (!body.staff_id) {
    errors.push("staff_id is required");
  } else if (!isValidUUID(body.staff_id)) {
    errors.push("staff_id must be a valid UUID");
  }

  if (!body.booking_date) {
    errors.push("booking_date is required");
  } else if (!isValidDateFormat(body.booking_date)) {
    errors.push("booking_date must be in YYYY-MM-DD format");
  } else if (!isFutureDate(body.booking_date)) {
    errors.push("booking_date cannot be in the past");
  }

  if (!body.booking_time) {
    errors.push("booking_time is required");
  } else if (!isValidTimeFormat(body.booking_time)) {
    errors.push("booking_time must be in HH:MM format");
  }

  // Optional fields
  if (body.notes && typeof body.notes !== "string") {
    errors.push("notes must be a string");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      service_id: body.service_id,
      staff_id: body.staff_id,
      booking_date: body.booking_date,
      booking_time: body.booking_time,
      notes: body.notes || null,
    },
  };
}

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): boolean {
  if (!password || typeof password !== "string") return false;

  // Minimum 8 characters
  if (password.length < 8) return false;

  // Must contain at least one uppercase letter
  if (!/[A-Z]/.test(password)) return false;

  // Must contain at least one lowercase letter
  if (!/[a-z]/.test(password)) return false;

  // Must contain at least one number
  if (!/\d/.test(password)) return false;

  // Must contain at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;

  return true;
}

/**
 * Validate booking date
 */
export function validateBookingDate(date: Date | string): boolean {
  const bookingDate = typeof date === "string" ? new Date(date) : date;
  const now = new Date();

  // Must be at least 24 hours in the future
  const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Cannot be more than 90 days in the future
  const maxDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  return bookingDate >= minDate && bookingDate <= maxDate;
}

/**
 * Validate price
 */
export function validatePrice(
  price: string | number,
  options?: { allowZero?: boolean }
): boolean {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;

  if (isNaN(numPrice)) return false;
  if (numPrice < 0) return false;
  if (numPrice === 0 && !options?.allowZero) return false;
  if (numPrice > 100000) return false;

  // Check for max 2 decimal places
  const decimalPlaces = (numPrice.toString().split(".")[1] || "").length;
  if (decimalPlaces > 2) return false;

  return true;
}

/**
 * Validate quantity
 */
export function validateQuantity(
  quantity: string | number,
  options?: { maxStock?: number }
): boolean {
  const numQuantity =
    typeof quantity === "string" ? parseInt(quantity) : quantity;

  if (isNaN(numQuantity)) return false;
  if (!Number.isInteger(numQuantity)) return false;
  if (numQuantity < 1) return false;
  if (numQuantity >= 1000) return false;

  if (options?.maxStock && numQuantity > options.maxStock) {
    return false;
  }

  return true;
}

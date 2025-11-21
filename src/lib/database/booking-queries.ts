/**
 * Database Queries for Booking System
 * All Supabase queries related to bookings, availability, and time slots
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import type {
  Service,
  Staff,
  Availability,
  Booking,
} from "@/lib/supabase/config";

/**
 * Fetch service by ID
 */
export async function getServiceById(
  serviceId: string
): Promise<Service | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching service:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Exception in getServiceById:", error);
    return null;
  }
}

/**
 * Fetch all active staff members
 */
export async function getActiveStaff(): Promise<Staff[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("staff")
      .select("*")
      .eq("active", true)
      .order("name");

    if (error) {
      console.error("Error fetching staff:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Exception in getActiveStaff:", error);
    return [];
  }
}

/**
 * Fetch staff member by ID
 */
export async function getStaffById(staffId: string): Promise<Staff | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("staff")
      .select("*")
      .eq("id", staffId)
      .eq("active", true)
      .single();

    if (error) {
      console.error("Error fetching staff:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Exception in getStaffById:", error);
    return null;
  }
}

/**
 * Fetch staff availability for a specific day of week
 * @param staffId - Staff member ID
 * @param dayOfWeek - 0 (Sunday) to 6 (Saturday)
 */
export async function getStaffAvailability(
  staffId: string,
  dayOfWeek: number
): Promise<Availability[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("availability")
      .select("*")
      .eq("staff_id", staffId)
      .eq("day_of_week", dayOfWeek)
      .order("start_time");

    if (error) {
      console.error("Error fetching availability:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Exception in getStaffAvailability:", error);
    return [];
  }
}

/**
 * Fetch all availability records for all staff on a specific day
 * @param dayOfWeek - 0 (Sunday) to 6 (Saturday)
 */
export async function getAllStaffAvailabilityForDay(
  dayOfWeek: number
): Promise<Availability[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("availability")
      .select("*")
      .eq("day_of_week", dayOfWeek)
      .order("start_time");

    if (error) {
      console.error("Error fetching day availability:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Exception in getAllStaffAvailabilityForDay:", error);
    return [];
  }
}

/**
 * Fetch all bookings for a specific date
 * @param date - Date in YYYY-MM-DD format
 */
export async function getBookingsForDate(date: string): Promise<Booking[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("booking_date", date)
      .in("status", ["pending", "confirmed"])
      .order("booking_time");

    if (error) {
      console.error("Error fetching bookings for date:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Exception in getBookingsForDate:", error);
    return [];
  }
}

/**
 * Check if a specific time slot is available for a staff member
 * @param staffId - Staff member ID
 * @param date - Date in YYYY-MM-DD format
 * @param time - Time in HH:MM:SS format
 */
export async function isTimeSlotAvailable(
  staffId: string,
  date: string,
  time: string
): Promise<boolean> {
  try {
    // Check for existing booking
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("id")
      .eq("staff_id", staffId)
      .eq("booking_date", date)
      .eq("booking_time", time)
      .in("status", ["pending", "confirmed"])
      .maybeSingle();

    if (error) {
      console.error("Error checking slot availability:", error);
      return false;
    }

    // Slot is available if no booking exists
    return !data;
  } catch (error) {
    console.error("Exception in isTimeSlotAvailable:", error);
    return false;
  }
}

/**
 * Create a new booking
 * Uses transaction-like approach with RLS and unique constraint
 */
export async function createBooking(booking: {
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  service_id: string;
  staff_id: string;
  booking_date: string;
  booking_time: string;
  notes: string | null;
}): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  try {
    // Insert booking - unique constraint will prevent double-booking
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .insert({
        user_id: booking.user_id,
        customer_name: booking.customer_name,
        customer_email: booking.customer_email,
        customer_phone: booking.customer_phone,
        service_id: booking.service_id,
        staff_id: booking.staff_id,
        booking_date: booking.booking_date,
        booking_time: booking.booking_time,
        status: "pending",
        notes: booking.notes,
      })
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation (duplicate booking)
      if (error.code === "23505") {
        return {
          success: false,
          error:
            "This time slot is no longer available. Please select another time.",
        };
      }

      console.error("Error creating booking:", error);
      return {
        success: false,
        error: "Failed to create booking. Please try again.",
      };
    }

    return {
      success: true,
      booking: data,
    };
  } catch (error) {
    console.error("Exception in createBooking:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Fetch all bookings for a specific user
 * @param userId - User ID from Supabase Auth
 */
export async function getUserBookings(userId: string): Promise<Booking[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("user_id", userId)
      .order("booking_date", { ascending: false })
      .order("booking_time", { ascending: false });

    if (error) {
      console.error("Error fetching user bookings:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Exception in getUserBookings:", error);
    return [];
  }
}

/**
 * Cancel a booking
 * @param bookingId - Booking ID
 * @param userId - User ID (for authorization check)
 */
export async function cancelBooking(
  bookingId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // First, verify the booking belongs to the user
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from("bookings")
      .select("id, user_id, booking_date, booking_time")
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      return {
        success: false,
        error: "Booking not found.",
      };
    }

    if (booking.user_id !== userId) {
      return {
        success: false,
        error: "You do not have permission to cancel this booking.",
      };
    }

    // Check if booking is in the past
    const bookingDateTime = new Date(
      `${booking.booking_date}T${booking.booking_time}`
    );
    if (bookingDateTime < new Date()) {
      return {
        success: false,
        error: "Cannot cancel past bookings.",
      };
    }

    // Update status to cancelled
    const { error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Error cancelling booking:", updateError);
      return {
        success: false,
        error: "Failed to cancel booking. Please try again.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Exception in cancelBooking:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Exception in getUserProfile:", error);
    return null;
  }
}
